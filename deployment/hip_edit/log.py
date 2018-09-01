"""
Log helpers
"""
import logging

def get_stream_logger(name, fmt=logging.BASIC_FORMAT):
    """
    Builds a stream logger with root logging level.
    """
    formatter = logging.Formatter(fmt)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger = logging.getLogger(name)
    logger.addHandler(console_handler)
    return logger
