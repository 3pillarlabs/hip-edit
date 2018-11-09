"""
Tests for build_context
"""
from os import path
import os
import tempfile
import unittest

import yaml

from hip_edit.build_context import BuildContext


class BuildContextTests(unittest.TestCase):
    """
    Tests for build_context
    """
    def setUp(self):
        self.file_obj = path.join(tempfile.tempdir, '.build_context.yml')
        self.build_context = BuildContext(file_path=self.file_obj)


    def test_get(self):
        """
        Tests getting values
        """
        context = dict(
            sam=dict(
                ApiUrl='https://f1.execute-api.us-east-1.amazonaws.com/ga/',
                LambdaArn='arn:aws:lambda:us-east-1:123:function:q-f-R0R'
            ),
            services=dict(
                InternetGateway='igw-123',
                MessageServerHost='50.25.34.12',
                PublicRouteTable='rtb-123'
            )
        )

        yaml.dump(context, stream=file(self.file_obj, 'w'), default_flow_style=False)
        assert self.build_context.get('ApiUrl') == context['sam']['ApiUrl']
        assert self.build_context.get('npm_config_messaging_host') == context['services']['MessageServerHost']


    def test_add_cf_outputs(self):
        """
        Tests addition of cloud formation outputs
        """
        message_server_host = dict(
            OutputKey='MessageServerHost',
            OutputValue='50.25.34.12')
        self.build_context.add('services', [message_server_host])
        assert self.build_context.get('npm_config_messaging_host') == message_server_host['OutputValue']


    def test_add_tuple_outputs(self):
        """
        Tests addition of key-value tuples
        """
        users = dict(john='cr4=y', alice='bcf45')
        self.build_context.add('services', users.items())
        assert self.build_context.get('john') == users['john']
        assert self.build_context.get('alice') == users['alice']


    def test_add_get_group_key(self):
        """
        Tests addition of key-value tuples with hierarchial group_key
        """
        users = dict(john='cr4=y', alice='bcf45')
        groups = dict(publishers=['john', 'alice'])
        self.build_context.add(('services', 'activemq', 'users'), users.items())
        self.build_context.add('activemq-groups', groups.items())
        assert self.build_context.get('john', group_key=('services', 'activemq', 'users')) == users['john']
        assert self.build_context.get('alice', group_key=('services', 'activemq', 'users')) == users['alice']
        assert self.build_context.get('publishers', group_key='activemq-groups') == groups['publishers']
