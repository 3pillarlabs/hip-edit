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
        self.parser = cli_arg_parser.build(name='Pluto', region='us-west-1')


    def test_parser_options_defaults(self):
        """
        Tests if all parser options are configured correctly.
        """
        options = self.parser.parse_args(args='./template.yml ./dist 3pillar-eng-apps'.split())
        assert options.name == 'Pluto'
        assert options.region == 'us-west-1'
        assert options.instance_type is None
        assert options.key_name == 'PlutoKeyPair'
        assert options.dry_run is False
        assert options.verbose is False
        assert options.stack_operation == 'update_or_create'
        assert options.sam_template_path == './template.yml'
        assert options.app_dist_path == './dist'


    def test_parser_options_independent_overrides(self):
        """
        Tests if parser options are configured correctly only when independent options are overridden.
        """
        argv = '-n Mars -r us-east-1 -t cx4.large -d -V --mode delete ./template.yml ./dist 3pillar-eng-apps'.split()
        options = self.parser.parse_args(args=argv)
        assert options.name == 'Mars'
        assert options.region == 'us-east-1'
        assert options.instance_type == 'cx4.large'
        assert options.key_name == 'MarsKeyPair'
        assert options.dry_run is True
        assert options.verbose is True
        assert options.stack_operation == 'delete'
