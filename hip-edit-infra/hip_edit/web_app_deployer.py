"""
Angular app deployment to S3.
"""
from os import environ
from string import Template
import awscli.clidriver
from hip_edit import resource_title


def main(prefix, dir_path, suffix=None):
    """
    Deploys contents of directory path to S3 bucket
    """
    bucket_name = resource_title.bucket_name(prefix, suffix)
    _copy_recursive(dir_path, bucket_name)


def _copy_recursive(dir_path, bucket_name, driver=awscli.clidriver.create_clidriver()):
    argv = "s3 cp {0} s3://{1} --recursive --acl public-read".format(dir_path, bucket_name).split()
    driver.main(args=argv)


def write_prod_env(build_context, out_file_path):
    """
    Writes the prod env to a configuration file on disk
    """
    conf_template = """
    export const environment = {
        production: true,
        hipEditApiPrefix: '$ApiUrl',
        stomp: {
            server: {
                host: '$npm_config_messaging_host',
                port: 61614,
                headers: {
                    login: '$npm_config_messaging_user',
                    passcode: '$npm_config_messaging_password',
                },
                domain: '$npm_config_editor_topic_domain',
            }
        }
    };
    """
    template_vars = dict(ApiUrl=build_context.get('ApiUrl'),
                         npm_config_messaging_host=build_context.get('npm_config_messaging_host'),
                         npm_config_messaging_user=environ.get('npm_config_messaging_user'),
                         npm_config_editor_topic_domain=environ.get('npm_config_editor_topic_domain'))

    template_vars['npm_config_messaging_password'] = build_context.get(template_vars['npm_config_messaging_user'],
                                                                       group_key=('services', 'activemq', 'users'))

    conf = Template(template=conf_template).substitute(template_vars)
    with open(out_file_path, 'w') as outf:
        outf.write(conf)
