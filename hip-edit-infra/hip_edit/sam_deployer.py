"""
AWS Lambda and API Gateway
"""
from os import environ

import awscli.clidriver
import boto3
import yaml

from hip_edit import resource_title


def main(cli_options, build_context):
    """
    Packages and deploys the AWS Lambda infrastructure
    """
    prefix = cli_options.name
    template_path = cli_options.sam_template_path
    bucket_name = cli_options.sam_bucket_name
    driver = awscli.clidriver.create_clidriver()
    packaged_template_path = _package(prefix, template_path, bucket_name, driver)
    if packaged_template_path is None:
        return None
    _configure_lambda(packaged_template_path, build_context)
    if cli_options.dry_run is True:
        return None
    stack_name = "%sSAMStack" % prefix
    _deploy(stack_name, packaged_template_path, driver, cli_options.role_arn)
    return _collect_outputs(stack_name)


def _package(prefix, template_path, bucket_name, driver):
    packaged_path = resource_title.packaged_path(template_path)
    argv = 'cloudformation package'.split()
    argv.extend("--template {0}".format(template_path).split())
    argv.extend("--output-template-file {0}".format(packaged_path).split())
    argv.extend("--s3-bucket {0}".format(bucket_name).split())
    argv.extend("--s3-prefix {0}".format(resource_title.bucket_name(prefix)).split())
    if driver.main(args=argv) == 0:
        return packaged_path
    return None


def _deploy(stack_name, packaged_template_path, driver, role_arn=None):
    argv = 'cloudformation deploy'.split()
    argv.extend("--template-file {0}".format(packaged_template_path).split())
    argv.extend("--stack-name {0}".format(stack_name).split())
    argv.extend("--capabilities CAPABILITY_IAM".split())
    if role_arn:
        argv.extend("--role-arn {0}".format(role_arn).split())
    driver.main(args=argv)


def _configure_lambda(template_path, build_context):
    model = yaml.load(file(template_path, 'r'))
    lambda_vars = model['Resources']['HipEditServerApiFunction']['Properties']['Environment']['Variables']
    for name in lambda_vars.keys():
        if name in environ:
            lambda_vars[name] = environ[name]
        if name in build_context.lambda_vars():
            if name == 'npm_config_messaging_password':
                key = environ['npm_config_messaging_user']
                lambda_vars[name] = build_context.get(key, group_key=('services', 'activemq', 'users'))
            elif name == 'npm_config_auth_agent_passcode':
                key = environ['npm_config_auth_agent_login']
                lambda_vars[name] = build_context.get(key, group_key=('services', 'activemq', 'users'))
            else:
                lambda_vars[name] = build_context.get(name)
    yaml.dump(model, stream=file(template_path, 'w'), default_flow_style=False)


def _collect_outputs(stack_name, cloudformation=boto3.resource('cloudformation')):
    return cloudformation.Stack(stack_name).outputs
