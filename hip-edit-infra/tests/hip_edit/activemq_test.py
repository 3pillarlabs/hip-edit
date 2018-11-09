"""
Tests for activemq.py
"""
from __future__ import print_function
import unittest
from os import path
from mock import MagicMock
from hip_edit import activemq


class ActiveMQTests(unittest.TestCase):
    """
    activemq.py tests
    """
    def setUp(self):
        self.ssh_client = MagicMock()
        self.distribution = activemq.factory('bitnami')
        self.templates_path = path.abspath('./artifacts/activemq')


    def test_configure_users(self):
        """Tests configuration of users.properties"""
        mock_stdout = open('./tests/fixtures/bitnami_credentials', 'r')
        self.ssh_client.exec_command = MagicMock(return_value=(None, mock_stdout, None))

        users = ('joe', 'mary')
        user_tuples = activemq.configure_users(self.ssh_client, self.distribution, self.templates_path, users)
        for user in users:
            assert next((ut for ut in user_tuples if ut[0] == user), None) is not None
        for _user, password in user_tuples:
            assert password is not None


    def test_configure_groups(self):
        """Tests configuration of groups.properties"""
        self.ssh_client.exec_command = MagicMock(return_value=(None, None, None))
        groups = dict(publishers=['alice', 'bob'], guests=['charlie'])
        groups_users = activemq.configure_groups(self.ssh_client, self.distribution, self.templates_path, groups)
        assert 'publishers' in groups_users
        assert  groups_users['publishers'] == 'alice,bob'
        assert 'guests' in groups_users
        assert groups_users['guests'] == 'charlie'
