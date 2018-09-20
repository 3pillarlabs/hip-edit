"""
Adds the VPC and child elements to CF template.
"""
from troposphere import ec2, Ref, Output

from hip_edit import tagging
from hip_edit.resources import subnet
from hip_edit.resources import security_group
from hip_edit import resource_title


def build(prefix, template, cidr="172.168.0.0/16"):
    """
    Declare a VPC with:
      * One public subnet
      * Security group for the EC2 instance
      * One EC2 t2.nano instance in the public subnet

    :param prefix: Prefix for all resource names
    :param template: Template for building CF output
    """
    vpc_title = resource_title.vpc_title(prefix)
    vpc = ec2.VPC(vpc_title)
    vpc.CidrBlock = cidr
    vpc.Tags = [tagging.name(vpc_title), tagging.env_name()]
    template.add_resource(vpc)
    template.add_output(Output('VPC',
                               Description="VPC Identifier",
                               Value=Ref(vpc)))
    subnet_resource = subnet.build(prefix, template, vpc)
    security_group_resource = security_group.build(prefix, template, vpc)
    return (vpc, subnet_resource, security_group_resource)
