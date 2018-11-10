"""
CloudFormation template builder
"""
from troposphere import Template, Parameter
from hip_edit import log, resource_title
from hip_edit.resources import bucket
from hip_edit.resources import instance
from hip_edit.resources import vpc


LOGGER = log.get_stream_logger(__name__)


def build(cli_options):
    """
    Constructs and returns the CF template.
    """
    prefix = cli_options.name
    t = Template(Description="Infrastructure for %s" % prefix)
    _build_aws_cf_template(cli_options, template=t)
    LOGGER.debug(t.to_yaml())
    return t


def _build_aws_cf_template(cli_options, template):
    """
    :param troposphere.Template template:
    """
    prefix = cli_options.name
    vpc_param = None
    if cli_options.vpc_id:
        vpc_param = Parameter(resource_title.vpc_title(prefix),
                              Type='AWS::EC2::VPC::Id',
                              Default=cli_options.vpc_id,
                              Description='VPC to use for the backing services')
        template.add_parameter(vpc_param)

    subnet_param = None
    if cli_options.subnet_id:
        subnet_param = Parameter(resource_title.subnet_title(prefix),
                                 Type='AWS::EC2::Subnet::Id',
                                 Default=cli_options.subnet_id,
                                 Description='Subnet to use for the backing services')
        template.add_parameter(subnet_param)

    vpc_resource, subnet_resource, security_group_resource = vpc.build(prefix, template,
                                                                        vpc_param=vpc_param,
                                                                        subnet_param=subnet_param)
    instance.build(prefix, template,
                   vpc=vpc_resource,
                   subnet=subnet_resource,
                   security_group=security_group_resource,
                   region_code=cli_options.region,
                   instance_type=cli_options.instance_type,
                   key_name=cli_options.key_name
                  )
    bucket.build(prefix, template, suffix=cli_options.domain_suffix)

# YAML format
# ---
# AWSTemplateFormatVersion: "version date"
#
# Description:
#   String
#
# Metadata:
#   template metadata
#
# Parameters:
#   set of parameters
#
# Mappings:
#   set of mappings
#
# Conditions:
#   set of conditions
#
# Transform:
#   set of transforms
#
# Resources:
#   set of resources
#
# Outputs:
#   set of outputs
#
