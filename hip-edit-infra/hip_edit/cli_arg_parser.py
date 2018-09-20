"""
CLI option parser
"""
from argparse import ArgumentParser
from hip_edit.sam_template_context import SamTemplateContext

def build(name='BouncyBot', region='us-east-1'):
    """
    Builds an argument parser with default values.
    """
    parser = ArgumentParser(description="Builds AWS resources for HipEdit deployment")
    parser.add_argument('-m', '--mode',
                        default='update_or_create',
                        choices=['update_or_create', 'delete'],
                        help='Stack operation to execute'
                       )
    parser.add_argument('-n', '--name',
                        default=name,
                        help='human friendly identifier to be prefixed to AWS resources'
                       )
    parser.add_argument('-r', '--region',
                        default=region,
                        help='AWS region to set up the infrastructure'
                       )
    parser.add_argument('-t', '--instance-type',
                        help='Instance type for the AMI'
                       )
    parser.add_argument('-k', '--key-name',
                        help='KeyPair to create or use'
                       )
    parser.add_argument('-d', '--dry-run',
                        action='store_true',
                        default=False,
                        help='Only validate the Cloudformation templates'
                       )
    parser.add_argument('-V', '--verbose',
                        action='store_true',
                        default=False,
                        help='Verbose logging'
                       )
    parser.add_argument('-u', '--role-arn',
                        help='AWS Role to assume for CloudFormation'
                       )
    parser.add_argument('-s', '--domain-suffix',
                        help='Domain suffix for S3 bucket'
                       )
    parser.add_argument('--sam-template-account-id-token',
                        default='YOUR_ACCOUNT_ID',
                        help='Token in the SAM template to replace with the AWS account ID'
                       )
    parser.add_argument('--sam-template-region-token',
                        default='YOUR_AWS_REGION',
                        help='Token in the SAM template to replace with the AWS region'
                       )
    parser.add_argument('account_id',
                        help='AWS account ID'
                       )
    parser.add_argument('sam_template_path',
                        help='Path to SAM template'
                       )
    parser.add_argument('app_dist_path',
                        help='Path to App distribution directory'
                       )
    parser.add_argument('sam_bucket_name',
                        help='S3 bucket name for SAM packaging and deployment'
                       )


    return ParserProxy(parser)



class ParserProxy(object):
    """
    Proxy for the parser built.
    """

    def __init__(self, parser):
        self.parser = parser
        self.options = None


    def parse_args(self, args=None):
        """
        Modifies the generated options.
        """
        self.options = self.parser.parse_args(args)
        self._set_key_name()
        self._set_update_or_create_predicate()
        self._set_sam_template_context()
        return self.options


    def _set_key_name(self):
        if getattr(self.options, 'key_name') is None:
            setattr(self.options, 'key_name', "%sKeyPair" % self.options.name)


    def _set_update_or_create_predicate(self):
        setattr(self.options, 'stack_operation', self.options.mode)
        if self.options.stack_operation == 'update_or_create':
            setattr(self.options, 'update_or_create', True)
        else:
            setattr(self.options, 'update_or_create', False)


    def _set_sam_template_context(self):
        kv_dict = {
            self.options.sam_template_account_id_token: self.options.account_id,
            self.options.sam_template_region_token: self.options.region
        }
        setattr(self.options, 'sam_template_context', SamTemplateContext(kv_dict))
