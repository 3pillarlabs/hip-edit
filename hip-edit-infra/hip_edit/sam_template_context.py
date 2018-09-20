"""
Context for SAM template.
"""
class SamTemplateContext(object):
    """
    Context strings and values.
    """
    def __init__(self, kv_dict):
        self.context = kv_dict
