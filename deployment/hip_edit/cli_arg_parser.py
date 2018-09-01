"""
CLI option parser
"""
from argparse import ArgumentParser


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


    def parse_args(self, args=None):
        """
        Modifies the generated options.
        """
        options = self.parser.parse_args(args)
        self._set_key_name(options)
        self._set_update_or_create_predicate(options)
        return options


    def _set_key_name(self, options):
        if getattr(options, 'key_name') is None:
            setattr(options, 'key_name', "%sKeyPair" % options.name)

    def _set_update_or_create_predicate(self, options):
        setattr(options, 'stack_operation', options.mode)
        if options.stack_operation == 'update_or_create':
            setattr(options, 'update_or_create', True)
        else:
            setattr(options, 'update_or_create', False)
