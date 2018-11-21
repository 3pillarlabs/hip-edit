"""
CLI option parser
"""
from argparse import ArgumentParser
from collections import defaultdict


def services_arg_parser(name='BouncyBot', region='us-east-1'):
    """
    Parser for Hip Edit services.
    """
    parser = ArgumentParser(description="Builds backing services for HipEdit deployment")
    _add_common_options(parser, name=name, region=region)
    parser.add_argument('-t', '--instance-type',
                        help='Instance type for the AMI'
                       )
    parser.add_argument('--amq-users',
                        nargs='+',
                        help='one or more ActiveMQ users to be configured in group-name:user-name format'
                       )
    parser.add_argument('--vpc-id',
                        help='Identifier of the VPC to use instead of creating a new one')
    parser.add_argument('--subnet-id',
                        help='Identifier of the subnet to use inside the VPC')
    parser.add_argument('key_name',
                        help='Key pair for which you have the private key to connect to the messaging server'
                       )
    return ParserProxy(parser)


def sam_arg_parser(name='BouncyBot', region='us-east-1'):
    """
    Parser for SAM deployer.
    """
    parser = ArgumentParser(description="Builds AWS Lambda and API Gateway for HipEdit deployment")
    _add_common_options(parser, name=name, region=region)
    parser.add_argument('sam_template_path',
                        help='Path to SAM template'
                       )
    parser.add_argument('sam_bucket_name',
                        help='S3 bucket name for SAM packaging and deployment'
                       )
    return parser


def web_arg_parser(name='BouncyBot', region='us-east-1'):
    """
    Parser for webapp deployer.
    """
    parser = ArgumentParser(description="Builds AWS Lambda and API Gateway for HipEdit deployment")
    _add_common_options(parser, name=name, region=region)
    parser.add_argument('-e', '--create-prod-env',
                        action='store_true',
                        default=False,
                        help='Create the production (prod) environment instead of deploying'
                       )
    parser.add_argument('-b', '--dist-dir',
                        default='dist',
                        help='Name of the build directory in the web app'
                       )
    parser.add_argument('-f', '--prod-file-path',
                        default='src/environments/environment.prod.ts',
                        help='Path to the prod configuration file relative to app_path argument'
                       )
    parser.add_argument('app_path',
                        help='Path to web application'
                       )
    return parser


def _add_common_options(parser, **kwargs):
    parser.add_argument('-c', '--command',
                        default='up',
                        choices=['up', 'down', 'halt'],
                        help='Stack operation to execute, default is "up"'
                       )
    parser.add_argument('-n', '--name',
                        default=kwargs['name'],
                        help='human friendly identifier to be prefixed to AWS resources'
                       )
    parser.add_argument('-r', '--region',
                        default=kwargs['region'],
                        help='AWS region to set up the infrastructure'
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
        self._set_stack_operation()
        self._set_amq_users_groups()
        return self.options


    def _set_key_name(self):
        if getattr(self.options, 'key_name') is None:
            setattr(self.options, 'key_name', "%sKeyPair" % self.options.name)


    def _set_stack_operation(self):
        setattr(self.options, 'stack_operation', self.options.command)

        def stack_up():
            """True if stack needs to be created or updated"""
            return self.options.command == 'up'


        def stack_down():
            """True if stack needs to be destroyed"""
            return self.options.command == 'down'


        def stack_halt():
            """True if stack needs to be halted"""
            return self.options.command == 'halt'

        setattr(self.options, stack_up.__name__, stack_up)
        setattr(self.options, stack_down.__name__, stack_down)
        setattr(self.options, stack_halt.__name__, stack_halt)


    def _set_amq_users_groups(self):
        if self.options.amq_users is None:
            return

        amq_groups_users = [tuple(e.split(':')) for e in self.options.amq_users]
        setattr(self.options, 'amq_users', tuple(set((e[1] for e in amq_groups_users))))

        def _function(accumulator, element):
            group, user = element
            accumulator[group].append(user)
            return accumulator

        setattr(self.options, 'amq_groups',
                reduce(_function, amq_groups_users, defaultdict(lambda: [])))
