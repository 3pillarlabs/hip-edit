"""
Public subnet
"""
from troposphere import ec2, Ref, Output

from hip_edit import tagging, resource_title
from hip_edit.resources import routing


def build(prefix, template, vpc, cidr="172.168.1.0/24", index=1):
    """
    Build public subnet and contained resources
    """
    subnet_title = resource_title.subnet_title(prefix, index)
    subnet = ec2.Subnet(subnet_title)
    subnet.CidrBlock = cidr
    subnet.VpcId = Ref(vpc)
    subnet.Tags = [tagging.pair('Public', str(True)), tagging.name(subnet_title), tagging.env_name()]
    template.add_resource(subnet)
    template.add_output(Output('PublicSubnet',
                               Description="PublicSubnet",
                               Value=Ref(subnet)))
    routing.build(prefix, template, vpc, subnet)
    return subnet
