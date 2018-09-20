from troposphere import ec2, Ref, GetAtt, Output

from hip_edit import tagging
from hip_edit import resource_title


def build(prefix, template, vpc, subnet):
    title = "%sPublicRouteTable" % prefix
    table = ec2.RouteTable(title)
    table.VpcId = GetAtt(subnet, 'VpcId')
    table.Tags = [tagging.name(title), tagging.env_name()]
    template.add_resource(table)
    template.add_output(Output('PublicRouteTable',
                               Description="Public Route Table Identifier",
                               Value=Ref(table)))
    gw = add_igw(prefix, template, subnet)
    vpc_gw = associate_vpc_igw(prefix, template, subnet, gw)
    add_default_public_route(prefix, template, table, gw, vpc_gw)
    associate_route_table(prefix, template, subnet, table)


def add_igw(prefix, template, subnet):
    title = "%sInternetGateway" % prefix
    gw = ec2.InternetGateway(title)
    gw.Tags = [tagging.name(title), tagging.env_name()]
    gw.DependsOn = resource_title.vpc_title(prefix)
    template.add_resource(gw)
    template.add_output(Output('InternetGateway',
                               Description="InternetGateway",
                               Value=Ref(gw)))
    return gw


def associate_vpc_igw(prefix, template, subnet, gw):
    title = resource_title.vpc_gateway_title(prefix)
    vpc_gw = ec2.VPCGatewayAttachment(title)
    vpc_gw.InternetGatewayId = Ref(gw)
    vpc_gw.VpcId = GetAtt(subnet, 'VpcId')
    template.add_resource(vpc_gw)
    return vpc_gw


def add_default_public_route(prefix, template, route_table, igw, vpc_gw):
    title = "%sDefaultPublicRoute" % prefix
    r = ec2.Route(title)
    r.RouteTableId = Ref(route_table)
    r.GatewayId = Ref(igw)
    r.DestinationCidrBlock = '0.0.0.0/0'
    r.DependsOn = vpc_gw.title
    template.add_resource(r)


def associate_route_table(prefix, template, subnet, route_table):
    title = "%sPublicRouteTableAssociation" % prefix
    subnet_table = ec2.SubnetRouteTableAssociation(title)
    subnet_table.RouteTableId = Ref(route_table)
    subnet_table.SubnetId = Ref(subnet)
    template.add_resource(subnet_table)
