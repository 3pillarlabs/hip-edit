"""
AWS security group and ingress rules.
"""
from troposphere import ec2, Ref, Output

from hip_edit import tagging

def build(prefix, template, vpc):
    """
    Adds the security group and ingress rules to the CF template.
    """
    sg_name = "%sSecurityGroup" % prefix
    sg = ec2.SecurityGroup(title=sg_name)
    sg.GroupName = sg_name
    sg.GroupDescription = "Allows ingress for communication with ActiveMQ server"
    _build_ingress_rules(sg_name)
    sg.SecurityGroupIngress = _build_ingress_rules(security_group_name=sg_name)
    sg.Tags = [tagging.name(sg_name), tagging.env_name()]
    sg.VpcId = Ref(vpc)
    template.add_resource(sg)
    template.add_output(Output('SecurityGroup',
                               Description="Security Group",
                               Value=Ref(sg)))
    return sg


def _build_ingress_rules(security_group_name):
    return [
        _ingress_allow(security_group_name, port=61613, port_title='ActiveMQ STOMP port'),
        _ingress_allow(security_group_name, port=61614, port_title='ActiveMQ Websocket port'),
        _ingress_allow(security_group_name, port=22, port_title='SSH', index=2),
    ]


def _ingress_allow(security_group_name, port, port_title, index=1):
    return ec2.SecurityGroupRule(
        title="%sIngress%d" % (security_group_name, index),
        CidrIp='0.0.0.0/0',
        Description="Allow access to %s port from anywhere" % port_title,
        FromPort=port,
        ToPort=port,
        IpProtocol='tcp'
    )
