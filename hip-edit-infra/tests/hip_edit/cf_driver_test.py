"""
Tests for master.py
"""
from __future__ import print_function
from collections import namedtuple
import unittest
import botocore
from mock import MagicMock
from hip_edit import cf_template_builder
from hip_edit import cf_driver

FIELD_NAMES = ['name', 'region', 'instance_type', 'key_name', 'domain_suffix', 'vpc_id', 'subnet_id',
               'stack_halt']
CliOptions = namedtuple('CliOptions', FIELD_NAMES)

def _make_cli_options(name='Plop',
                      region='eu-west-1',
                      instance_type='t2.micro',
                      key_name='plop',
                      domain_suffix=None,
                      vpc_id=None,
                      subnet_id=None,
                      stack_halt=MagicMock(return_value=False)):

    return CliOptions(
        name=name,
        region=region,
        instance_type=instance_type,
        key_name=key_name,
        domain_suffix=domain_suffix,
        vpc_id=vpc_id,
        subnet_id=subnet_id,
        stack_halt=stack_halt
    )



class CfDriverTests(unittest.TestCase):
    """
    cf_driver.py tests
    """

    def setUp(self):
        self.cli_options = _make_cli_options()
        self.template = cf_template_builder.build(self.cli_options)


    def test_valid_cf_template(self):
        """Tests if the generated CF template is valid."""
        assert self.template is not None


    def test_creation_success(self):
        """CF stack creation in success path."""
        ite = iter([None, -2, -1, 0])
        initial_state = {
            'Stacks': [{
                'StackId': 'MockStack-1',
                'StackStatus': 'CREATE_IN_PROGRESS'
            }]
        }
        def _describe_stacks(*_args, **_kwargs):
            val = ite.next()
            if val is None:
                raise botocore.exceptions.ClientError({}, 'mock')
            elif val == -1:
                initial_state['Stacks'][0]['Outputs'] = [{
                    'Key': 'yada', 'Value': 'yada'
                }]
            elif val == 0:
                initial_state['Stacks'][0]['StackStatus'] = 'CREATE_COMPLETE'

            return initial_state

        client = MagicMock()
        client.describe_stacks = MagicMock(side_effect=_describe_stacks)
        client.create_stack = MagicMock(return_value={'StackId': 'MockStack-1'})

        cf_driver.update_or_create_cf_template(__name__, self.template, client=client, retry_seconds=0)


    def test_creation_failure_with_rollback_success(self):
        """CF stack creation in rollback path."""
        states_ite = iter([None, 'CREATE_IN_PROGRESS', 'CREATE_FAILED', 'ROLLBACK_IN_PROGRESS', 'ROLLBACK_COMPLETE'])
        initial_state = {
            'Stacks': [{'StackStatus': 'CREATE_IN_PROGRESS'}]
        }
        def _describe_stacks(*_args, **_kwargs):
            cur_state = states_ite.next()
            if cur_state is None:
                raise botocore.exceptions.ClientError({}, 'mock')
            else:
                initial_state['Stacks'][0]['StackStatus'] = cur_state
                return initial_state

        client = MagicMock()
        client.describe_stacks = MagicMock(side_effect=_describe_stacks)
        client.create_stack = MagicMock(return_value={'StackId': 'MockStack-1'})

        cf_driver.update_or_create_cf_template(__name__, self.template, client=client, retry_seconds=0)


    def test_update_success(self):
        """CF stack update in success path."""
        states_ite = iter(['UPDATE_IN_PROGRESS', 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS', 'UPDATE_COMPLETE'])
        initial_state = {
            'Stacks': [{
                'StackId': 'MockStack-1',
                'StackStatus': None
            }]
        }
        def _describe_stacks(*_args, **_kwargs):
            initial_state['Stacks'][0]['StackStatus'] = states_ite.next()
            return initial_state

        client = MagicMock()
        client.describe_stacks = MagicMock(side_effect=_describe_stacks)
        client.update_stack = MagicMock(return_value={'StackId': 'MockStack-1'})

        cf_driver.update_or_create_cf_template(__name__, self.template, client=client, retry_seconds=0)


    def test_stack_halt(self):
        """Should not attach the EIP"""
        self.cli_options = _make_cli_options(stack_halt=MagicMock(return_value=True))
        template = cf_template_builder.build(self.cli_options)
        assert 'MessageServerHost' not in template.to_dict()['Outputs']
