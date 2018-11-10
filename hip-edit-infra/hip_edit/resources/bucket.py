"""
S3 and CloudFront.
"""
from troposphere import GetAtt, Output
from troposphere.s3 import Bucket, PublicRead, WebsiteConfiguration

from hip_edit import resource_title


def build(prefix, template, suffix=None):
    """
    Adds S3 and CloudFront elements to CF template.
    """
    s3bucket = template.add_resource(Bucket(
        "%sS3Bucket" % prefix,
        AccessControl=PublicRead,
        WebsiteConfiguration=WebsiteConfiguration(
            IndexDocument="index.html"
        ),
        BucketName=resource_title.bucket_name(prefix, suffix)
    ))

    template.add_output([
        Output(
            "WebsiteURL",
            Value=GetAtt(s3bucket, "WebsiteURL"),
            Description="URL for website hosted on S3"
        )
    ])
