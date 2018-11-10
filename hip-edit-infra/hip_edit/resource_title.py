"""
Resource and titles
"""
import os
import re


VPC_GATEWAY_ATTACHMENT = "VPCGatewayAttachment"


def vpc_gateway_title(prefix):
    """
    The VPC gateway title.
    """
    return "%s%s" % (prefix, VPC_GATEWAY_ATTACHMENT)


def vpc_title(prefix):
    """
    VPC title
    """
    return "%sVPC" % prefix


def bucket_name(prefix, suffix=None):
    """
    DNS compliant bucket name.
    """
    if suffix:
        fmt_str, fmt_args = ("%sApp.%s", (prefix, suffix))
    else:
        fmt_str, fmt_args = ("%sApp", prefix)

    return "-".join([cp.lower() for cp in re.sub("([A-Z])", " \\1", fmt_str % fmt_args).split()])


def packaged_path(template_path, token='packaged'):
    """
    Converts a path like ../foo/bar/template.yml to ../foo/bar/template-packaged.yml
    """
    dn = os.path.dirname(template_path)
    bn = os.path.basename(template_path)
    fn, ext = re.split('\.', bn)
    fp = os.path.join(dn, fn)
    return "{0}-{1}.{2}".format(fp, token, ext)


def subnet_title(prefix, index=1):
    """Subnet title"""
    return "%sPublicSubnet%d" % (prefix, index)
