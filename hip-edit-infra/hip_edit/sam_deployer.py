"""
AWS Lambda and API Gateway
"""
from string import Template

import awscli.clidriver
from hip_edit import resource_title


def main(prefix, template_path, template_context, bucket_name, role_arn=None):
    """
    Packages and deploys the AWS Lambda infrastructure
    """
    driver = awscli.clidriver.create_clidriver()
    interpolated_template_path = _interpolate(template_path, template_context)
    packaged_template_path = _package(prefix, interpolated_template_path, bucket_name, driver)
    if packaged_template_path is not None:
        _deploy(prefix, packaged_template_path, driver, role_arn)


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


def _deploy(prefix, packaged_template_path, driver, role_arn=None):
    stack_name = "%sSAMStack" % prefix
    argv = 'cloudformation deploy'.split()
    argv.extend("--template-file {0}".format(packaged_template_path).split())
    argv.extend("--stack-name {0}".format(stack_name).split())
    argv.extend("--capabilities CAPABILITY_IAM".split())
    if role_arn:
        argv.extend("--role-arn {0}".format(role_arn).split())
    driver.main(args=argv)


def _interpolate(template_path, template_context):
    out_path = resource_title.packaged_path(template_path, token='staged')
    with open(template_path, 'r') as in_file:
        template = in_file.read()
        with open(out_path, 'w') as out_file:
            out_file.write(Template(template).substitute(template_context))

    return out_path
