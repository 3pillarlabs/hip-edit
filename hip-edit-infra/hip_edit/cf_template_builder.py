"""
CloudFormation template builder
"""
from troposphere import Template
from hip_edit import log
from hip_edit.resources import bucket
from hip_edit.resources import instance
from hip_edit.resources import vpc


logger = log.get_stream_logger(__name__)


def build(cli_options):
    """
    Constructs and returns the CF template.
    """
    prefix = cli_options.name
    t = Template(Description="Infrastructure for %s" % prefix)
    _build_aws_cf_template(cli_options, template=t)
    logger.debug(t.to_yaml())
    return t


def _build_aws_cf_template(cli_options, template):
    prefix = cli_options.name
    _vpc_resource, subnet_resource, security_group_resource = vpc.build(prefix, template)
    instance.build(prefix, template,
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
