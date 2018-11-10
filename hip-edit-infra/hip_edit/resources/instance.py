"""
Functions for adding instance and EIP to template.
"""
from troposphere import ec2, Ref, Output, Join
from hip_edit.resources.region_ami_map import RegionAmiMap
from hip_edit import tagging
from hip_edit import resource_title

DEFAULT_INSTANCE_TYPE = 't2.micro'

def build(prefix, template, vpc, subnet, security_group, region_code, instance_type=None, key_name=None, index=1):
    """
    Template for launching instance into the VPC.
    """
    if region_code not in RegionAmiMap:
        raise KeyError("Invalid region_code: %s" % region_code)
    instance_title = "%sActiveMQInstance%d" % (prefix, index)
    instance = ec2.Instance(instance_title)
    instance.BlockDeviceMappings = [
        {
            'DeviceName': '/dev/sda1',
            'Ebs': {'VolumeSize': '20'}
        }
    ]
    instance.ImageId = RegionAmiMap[region_code].ami_id
    instance.InstanceType = instance_type if instance_type is not None else DEFAULT_INSTANCE_TYPE
    instance.KeyName = key_name if key_name else "%sKeyPair" % prefix
    instance.SecurityGroupIds = [Ref(security_group)]
    instance.SubnetId = Ref(subnet)
    instance.Tags = [tagging.name(instance_title), tagging.env_name()]
    template.add_resource(instance)
    template.add_output(Output('MessageServerInstanceId',
                               Description="Messaging Server Instance ID",
                               Value=Ref(instance)))
    build_eip(prefix, template, vpc, instance)
    return instance


def build_eip(prefix, template, vpc, instance):
    """
    Adds an Elastic IP to the template and its value to the CF outputs.
    """
    eip = ec2.EIP("%sEIP" % prefix)
    eip.InstanceId = Ref(instance)
    eip.Domain = "vpc"
    if isinstance(vpc, ec2.VPC):
        eip.DependsOn = resource_title.vpc_gateway_title(prefix)
    template.add_resource(eip)
    template.add_output(Output('MessageServerHost',
                               Description="Messaging Service Host Public IP",
                               Value=Ref(eip)
                              )
                       )
