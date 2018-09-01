"""
Utility methods for creating Tags
"""
import os

preloaded_env = os.environ.get('BOUNCY_BOT_ENV', 'development')


def name(value):
    """
    Create a 'Name' tag.

    :param value: The name value
    """
    return pair('Name', value)


def pair(key, value):
    """ Tag for key, value pair. """
    return {'Key': key, 'Value': str(value)}


def env_name():
    """ Tag for current environment. """
    return pair('EnvironmentName', preloaded_env)
