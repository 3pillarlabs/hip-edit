"""
Builds the infrastructure for Hip Edit backing services.
"""
from __future__ import print_function
import logging
from hip_edit import cli_arg_parser
from hip_edit import cf_template_builder
from hip_edit import cf_driver
from hip_edit.build_context import BuildContext


def main():
    """
    Entry point
    """
    cli_options = cli_arg_parser.services_arg_parser().parse_args()
    logging.root.setLevel(logging.DEBUG if cli_options.verbose else logging.INFO)
    template = cf_template_builder.build(cli_options)
    outputs = cf_driver.execute(cli_options, template)
    build_ctx = BuildContext()
    build_ctx.add('services', outputs).save()


if __name__ == '__main__':
    main()
