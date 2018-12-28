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
            'npm_config_messaging_host',
            'npm_config_messaging_password',
            'npm_config_auth_agent_passcode'
        ]


    def __str__(self):
        return self.__repr__()


    def __repr__(self):
        return self._build_data.__repr__()


    def lambda_vars(self):
        """
        List of known variables.
        """
        return self._lambda_vars


    def get(self, name, group_key=None):
        """
        Value if name is known, None otherwise.
        """
        value = None
        ctx = self._context()
        if name == 'npm_config_messaging_host':
            value = ctx['services']['MessageServerHost']
        elif name == 'ApiUrl':
            value = ctx['sam']['ApiUrl']
        elif group_key is not None:
            if isinstance(group_key, str):
                value = ctx[group_key].get(name)
            elif isinstance(group_key, (list, tuple)):
                for k in group_key:
                    ctx = ctx[k]
                value = ctx[name]
        else:
            value = ctx.get('sam', {}).get(name) or ctx.get('services', {}).get(name)

        return value


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
        ctx = self._context()
        if isinstance(group_key, (list, tuple)):
            for k in group_key:
                if k not in ctx:
                    ctx[k] = {}
                ctx = ctx[k]

        else:
            if group_key not in self._context():
                ctx[group_key] = {}
            ctx = ctx[group_key]

        for output_dict in outputs:
            if isinstance(output_dict, dict):
                name = output_dict['OutputKey']
                value = output_dict['OutputValue']
            elif isinstance(output_dict, tuple):
                name = output_dict[0]
                value = output_dict[1]
            ctx[name] = value

        return self


    def save(self):
        """
        Saves the internal context to file
        """
        yaml.dump(self._context(), stream=file(self.file_path, 'w'), default_flow_style=False)
        return self
