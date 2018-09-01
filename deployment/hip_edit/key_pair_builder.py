import boto3
import os
from os import path
from hip_edit import log

logger = log.get_stream_logger(__name__)


def build(key_name, client=boto3.client('ec2')):
    """
    AWS::KeyPair builder:
    * If key_name does not exist, creates it and downloads the key to ~/.ssh.
    * If key_name exists, but if the key file does not exist in ~/.ssh, an Exception is raised.

    If ~/.ssh does not exist, it is created with appropriate permissions.

    :param key_name: AWS::KeyPair name
    :type  key_name: string
    """
    with _ssh_path(key_name) as pvt_key_path:
        key_pair_info = _exists_key_pair(key_name, client)
        if key_pair_info is None:
            _create_key_pair(key_name, client, save_to=pvt_key_path.value)
        else:
            if not _present_key_file(saved_to=pvt_key_path.value):
                raise RuntimeError("%s not found" % pvt_key_path.value)
            logger.info("Using exisiting key-pair '%s' with fingerprint %s" %
                        (key_name, key_pair_info['KeyFingerprint']))


def _exists_key_pair(key_name, client):
    response = client.describe_key_pairs(
        Filters=[
            {
                'Name': 'key-name',
                'Values': [
                    key_name
                ]
            }
        ]
    )
    logger.debug(response)
    key_pairs = response['KeyPairs']
    return key_pairs[0] if len(key_pairs) > 0 else None


def _create_key_pair(key_name, client, save_to):
    response = client.create_key_pair(
        KeyName=key_name
    )
    logger.debug(response)
    with open(save_to, 'w') as pvt_key_file:
        pvt_key_file.write(response['KeyMaterial'])


def _present_key_file(saved_to):
    return path.exists(saved_to)


def _ssh_path(key_name):
    return PrivateKeyPath(key_name)


class PrivateKeyPath(object):
    """KeyPath context manager"""

    def __init__(self, key_name):
        super(PrivateKeyPath, self).__init__()
        key_file = "%s.pem" % key_name
        self.ssh_dir = path.expanduser('~/.ssh')
        self.value = path.join(self.ssh_dir, key_file)

    def __enter__(self):
        if not path.exists(self.ssh_dir):
            os.mkdir(self.ssh_dir, 0700)
        return self

    def __exit__(self, error_type, value, tb):
        if error_type is None:
            os.chmod(self.value, 0400)
        return error_type is None
