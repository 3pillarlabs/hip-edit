"""
Angular app deployment to S3.
"""
import awscli.clidriver
from hip_edit import resource_title


def main(prefix, dir_path, suffix=None):
    """
    Deploys contents of directory path to S3 bucket
    """
    bucket_name = resource_title.bucket_name(prefix, suffix)
    _copy_recursive(dir_path, bucket_name)


def _copy_recursive(dir_path, bucket_name, driver=awscli.clidriver.create_clidriver()):
    argv = "s3 cp {0} s3://{1} --recursive --acl public-read".format(dir_path, bucket_name).split()
    driver.main(args=argv)
