"""
Configures the remote activemq instance
"""
import crypt
import datetime
import re
import string
import tempfile
import time
from os import path, urandom

import boto3
import paramiko

from hip_edit import log

LOGGER = log.get_stream_logger(__name__)

def check_instance_status(instance_id,
                          ec2=boto3.resource('ec2'),
                          client=boto3.client('ec2'),
                          wait_seconds=10, total_wait_seconds=600):
    """
    Waits for instance and system checks to complete.
    """
    instance = ec2.Instance(instance_id)
    if instance.state['Name'] == 'stopped':
        LOGGER.info('ActiveMQ instance is stopped, starting...')
        instance.start()

    elapsed_seconds = 0
    up_and_running = False
    while up_and_running is False and elapsed_seconds <= total_wait_seconds:
        response = client.describe_instance_status(InstanceIds=[instance_id])
        model = response['InstanceStatuses'][0]
        if model['InstanceStatus']['Status'] == 'ok' and model['SystemStatus']['Status'] == 'ok':
            up_and_running = True
        else:
            time.sleep(wait_seconds)
            elapsed_seconds += wait_seconds
            LOGGER.debug(model)

    LOGGER.info('ActiveMQ instance up and running')
    return True


def configure(cli_options, hostname, templates_path, distribution_type, ssh_client=None):
    """
    Sets up custom ActiveMQ configuration.
    """
    distribution = factory(distribution_type)
    if ssh_client is None:
        ssh_client = _connect(hostname,
                              username=distribution.username,
                              key_pair_name=cli_options.key_name)

    user_passwords = configure_users(ssh_client, distribution, templates_path, cli_options.amq_users or [])
    configure_groups(ssh_client, distribution, templates_path, cli_options.amq_groups or {})
    _configure_activemq(ssh_client, distribution, templates_path)
    if ssh_client is not None:
        ssh_client.close()

    LOGGER.info('ActiveMQ instance configured OK')
    return user_passwords


def factory(distribution_type):
    """Generates a distribution object based on the type"""
    distribution = None
    if distribution_type == 'bitnami':
        distribution = BitnamiDistribution()
    return distribution


def _connect(hostname, username, key_pair_name):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.WarningPolicy())
    key_file_path = path.expanduser("~/.ssh/%s.pem" % key_pair_name)
    client.connect(hostname, username=username, key_filename=key_file_path)
    return client


def configure_users(ssh_client, distribution, templates_path, users, template_file='users-sample.properties'):
    """Configures users.properties for JAAS"""
    inputs = _readlines_template(templates_path, template_file)
    user_tuples = []
    out_lines = []
    for line, name, value, token in _generate_property_literals(inputs):
        if name is not None:
            token_value = None
            if token is not None:
                if token == 'bitnami_credentials()':
                    token_value = distribution.fetch_bitnami_credentials(ssh_client)
                else:
                    raise RuntimeError("Unknown identifier: %s" % token)
            else:
                token_value = value
            user_tuples.append((name, token_value))
        else:
            out_lines.append(line)

    _generate_user_passwords(users, user_tuples)
    for user, password in user_tuples:
        out_lines.append("%s=%s\n" % (user, password))

    _put_users_properties_file(out_lines, ssh_client, distribution)
    LOGGER.debug('Configured activemq users')
    return user_tuples


def _generate_user_passwords(users, user_tuples):
    seed = int(datetime.datetime.now().strftime("%S"))
    for user in users:
        password = crypt.crypt(str(urandom(8)), "%02d" % seed)
        user_tuples.append((user, password))
        seed += 2


def configure_groups(ssh_client, distribution, templates_path, groups, template_file='groups-sample.properties'):
    """Configures groups for JAAS"""
    inputs = _readlines_template(templates_path, template_file)
    groups_users = dict()
    out_lines = []
    for line, name, value, token in _generate_property_literals(inputs):
        if name is not None:
            token_value = None
            if token is not None:
                if token in groups:
                    token_value = ','.join(groups[token])
                else:
                    raise RuntimeError("Unknown identifier in template: %s" % token)
            else:
                token_value = value
            groups_users[name] = token_value
            out_lines.append("%s=%s\n" % (name, token_value))
        else:
            out_lines.append(line)

    _put_groups_properties_file(out_lines, ssh_client, distribution)
    LOGGER.debug('Configured activemq groups')
    return groups_users


def _generate_property_literals(inputs):
    line_rexp = re.compile('^(\\w+)\\s*=\\s*(.+?)$')
    value_interpolation_rexp = re.compile('^\\${(.+?)}$')
    for line in inputs:
        if line.startswith('#'):
            yield (line, None, None, None)
            continue

        match = line_rexp.match(line)
        if match is not None:
            name, value = match.groups()
            match = value_interpolation_rexp.match(value)
            token = match.group(1) if match is not None else None
            yield (line, name, value, token)


def _readlines_template(templates_path, template_file):
    file_lines = None
    template_file_path = path.join(templates_path, template_file)
    with open(template_file_path, 'r') as template:
        file_lines = template.readlines()
    return file_lines


def _put_users_properties_file(out_lines, ssh_client, distribution):
    local_path = path.join(tempfile.gettempdir(), "users.properties")
    _put_file(local_path, ssh_client, distribution,
              outputs=out_lines,
              remote_path_getter=distribution.users_properties_path)


def _put_groups_properties_file(out_lines, ssh_client, distribution):
    local_path = path.join(tempfile.gettempdir(), "groups.properties")
    _put_file(local_path, ssh_client, distribution,
              outputs=out_lines,
              remote_path_getter=distribution.groups_properties_path)


def _put_file(local_path, ssh_client, distribution, outputs, remote_path_getter):
    with open(local_path, 'w') as out_file:
        for line in outputs:
            out_file.write(line)
    distribution.put_config_file(ssh_client, local_path, remote_path=remote_path_getter())


def _configure_activemq(ssh_client, distribution, templates_path, config_file='activemq.secure.xml'):
    config_path = path.join(templates_path, config_file)
    distribution.put_activemq_conf(ssh_client, local_path=config_path)



ACTIVEMQ_PASSWORD_REXP = re.compile('<property name="password" value="(.+?)"/>')

class BitnamiDistribution(object):
    """
    Properties for a Bitnami distribution
    """

    def __init__(self):
        self.username = 'ubuntu'
        self.home_path = '/home/bitnami'
        self.base_path = "%s/stack/activemq" % self.home_path
        self.config_path = "%s/conf" % self.base_path
        self.ctl_script_path = '/opt/bitnami/ctlscript.sh'


    def fetch_bitnami_credentials(self, ssh_client):
        """Fetches the account admin user"""
        cmd = "cat %s/bitnami_credentials" % self.home_path
        _stdin, stdout, _stderr = ssh_client.exec_command(cmd)
        rexp = re.compile("'admin'\\s+and\\s+'(.+?)'")
        lines = stdout.readlines()
        for line in lines:
            match = rexp.search(line)
            if match is not None:
                return match.group(1)
        return None


    def users_properties_path(self):
        """Path to users.properties"""
        return "%s/users.properties" % self.config_path


    def groups_properties_path(self):
        """Path to groups.properties"""
        return "%s/groups.properties" % self.config_path


    def activemq_config_path(self):
        """Path to activemq.xml"""
        return "%s/activemq.xml" % self.config_path


    def put_config_file(self, ssh_client, local_path, remote_path):
        """
        Put file in remote configuration directory
        """
        local_file = path.basename(local_path)
        intermediate_path = "%s/%s" % (self.home_path, local_file)
        sftp_client = ssh_client.open_sftp()
        sftp_client.put(local_path, intermediate_path)
        ssh_exec(ssh_client, "sudo cp %s %s~" % (remote_path, remote_path)) # backup the file
        ssh_exec(ssh_client, "sudo mv %s %s" % (intermediate_path, remote_path))


    def put_activemq_conf(self, ssh_client, local_path):
        """
        Copies and updates activemq configuration
        """
        admin_password = self._get_activemq_admin_password(ssh_client)
        templ = string.Template(file(local_path).read())
        tmp_file = path.join(tempfile.tempdir, path.basename(self.activemq_config_path()))
        with open(tmp_file, 'w') as out_cfg:
            out_cfg.write(templ.substitute(encryptedPassword=admin_password))

        self.put_config_file(ssh_client, tmp_file, remote_path=self.activemq_config_path())
        ssh_exec(ssh_client, "sudo chown root:activemq %s %s %s" % (self.users_properties_path(),
                                                                    self.groups_properties_path(),
                                                                    self.activemq_config_path()))
        ssh_exec(ssh_client, "sudo chmod 640 %s %s %s" % (self.users_properties_path(),
                                                          self.groups_properties_path(),
                                                          self.activemq_config_path()))
        out = ssh_exec(ssh_client, "sudo %s restart activemq" % self.ctl_script_path)
        LOGGER.debug("Restarted activemq\n%s", out)


    def _get_activemq_admin_password(self, ssh_client):
        activemq_config_file = path.basename(self.activemq_config_path())
        sftp_client = ssh_client.open_sftp()
        tmp_file = path.join(tempfile.tempdir, activemq_config_file)
        ssh_exec(ssh_client, "sudo cp %s %s" % (self.activemq_config_path(), self.home_path))
        ssh_exec(ssh_client, "sudo chown bitnami:bitnami %s/%s" % (self.home_path, activemq_config_file))
        sftp_client.get("%s/%s" % (self.home_path, activemq_config_file), tmp_file)
        with open(tmp_file, 'r') as remote_cfg:
            for line in remote_cfg:
                match = ACTIVEMQ_PASSWORD_REXP.search(line)
                if match:
                    return match.group(1)
        return None



def ssh_exec(ssh_client, command):
    """
    Executes the command over ssh_client. Raises stderr and returns stdout
    """
    LOGGER.debug(command)
    _stdin, stdout, stderr = ssh_client.exec_command(command)
    if stderr is not None:
        err = stderr.read()
        if err:
            raise RuntimeError(err)

    return stdout.read() if stdout else ''
