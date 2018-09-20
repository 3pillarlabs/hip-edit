"""
Serverless Application Model builder and driver.
"""
from __future__ import print_function
import logging
from hip_edit import cli_arg_parser
from hip_edit import sam_deployer
from hip_edit.build_context import BuildContext


def main():
    """
    Entry point.
    """
    cli_options = cli_arg_parser.sam_arg_parser().parse_args()
    logging.root.setLevel(logging.DEBUG if cli_options.verbose else logging.INFO)
    build_context = BuildContext()
    outputs = sam_deployer.main(cli_options, build_context)
    if outputs is not None:
        build_context.add('sam', outputs).save()


if __name__ == '__main__':
    main()
