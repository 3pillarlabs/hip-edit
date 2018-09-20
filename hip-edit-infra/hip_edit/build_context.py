"""
Build context.
"""
import os
import yaml


class BuildContext(object):
    """
    Collectible context for build and deployment steps.
    """
    def __init__(self, file_path='.build_context.yml'):
        self.file_path = file_path
        self._build_data = None
        self._lambda_vars = [
            'npm_config_messaging_host'
        ]


    def lambda_vars(self):
        """
        List of known variables.
        """
        return self._lambda_vars


    def lambda_var_get(self, name):
        """
        Value if name is known, None otherwise.
        """
        if name == 'npm_config_messaging_host':
            return self._context()['services']['MessageServerHost']
        elif name == 'ApiUrl':
            return self._context()['sam']['ApiUrl']
        return None


    def _context(self):
        if self._build_data is None:
            if os.path.exists(self.file_path):
                self._build_data = yaml.load(file(self.file_path, 'r'))
            else:
                self._build_data = {}
        return self._build_data


    def add(self, group_key, outputs):
        """
        Adds each output to the internal context, keyed by the group key
        """
        if group_key not in self._context():
            self._context()[group_key] = {}
        for output_dict in outputs:
            name = output_dict['OutputKey']
            value = output_dict['OutputValue']
            self._context()[group_key][name] = value
        return self


    def save(self):
        """
        Saves the internal context to file
        """
        yaml.dump(self._context(), stream=file(self.file_path, 'w'), default_flow_style=False)
        return self
