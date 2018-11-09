"""
Unit tests
"""
import unittest
from hip_edit import cli_arg_parser

class CliArgParserTest(unittest.TestCase):
    """
    cli_arg_parser.py
    """

    def setUp(self):
        self.services_parser = cli_arg_parser.services_arg_parser(name='Pluto', region='us-west-1')
        self.sam_parser = cli_arg_parser.sam_arg_parser(name='Pluto', region='us-west-1')
        self.web_parser = cli_arg_parser.web_arg_parser(name='Pluto', region='us-west-1')


    def test_parser_options_defaults(self):
        """
        Tests if all parser options are configured correctly.
        """
        options = self.services_parser.parse_args(args='KeyPair'.split())
        assert options.name == 'Pluto'
        assert options.region == 'us-west-1'
        assert options.instance_type is None
        assert options.dry_run is False
        assert options.verbose is False
        assert options.stack_operation == 'update_or_create'


    def test_parser_options_independent_overrides(self):
        """
        Tests if parser options are configured correctly only when independent options are overridden.
        """
        argv = '-n Mars -r us-east-1 -t cx4.large -d -V --mode delete KeyPair'.split()
        options = self.services_parser.parse_args(args=argv)
        assert options.name == 'Mars'
        assert options.region == 'us-east-1'
        assert options.instance_type == 'cx4.large'
        assert options.dry_run is True
        assert options.verbose is True
        assert options.stack_operation == 'delete'


    def test_services_users(self):
        """
        Tests for activemq users
        """
        argv = 'KeyPair --amq-users admins:zoe publishers:sara publishers:bob guests:fred guests:alice'.split()
        options = self.services_parser.parse_args(args=argv)
        assert 'zoe' in options.amq_users
        assert 'sara' in options.amq_users
        assert 'bob' in options.amq_users
        assert 'fred' in options.amq_users
        assert 'alice' in options.amq_users


    def test_services_groups(self):
        """
        Tests for activemq groups
        """
        argv = 'KeyPair --amq-users admins:zoe publishers:sara publishers:bob guests:fred guests:alice'.split()
        options = self.services_parser.parse_args(args=argv)
        assert 'admins' in options.amq_groups
        assert 'zoe' in options.amq_groups['admins']
        assert 'publishers' in options.amq_groups
        assert 'sara' in options.amq_groups['publishers']
        assert 'bob' in options.amq_groups['publishers']
        assert 'guests' in options.amq_groups
        assert 'fred' in options.amq_groups['guests']
        assert 'alice' in options.amq_groups['guests']
