#!/usr/bin/env python

"""
Master / main entry point for setup and deployment
"""
from __future__ import print_function
import logging
from hip_edit import cli_arg_parser
from hip_edit import cf_template_builder
from hip_edit import cf_driver
from hip_edit import sam_deployer
from hip_edit import web_app_deployer


def main():
    """
    Orchestrate complete deployment.
    """
    cli_options = cli_arg_parser.build().parse_args()
    logging.root.setLevel(logging.DEBUG if cli_options.verbose else logging.INFO)
    # ../hip-edit-server/npm run clean-lambda dist-lambda
    template = cf_template_builder.build(cli_options)
    cf_driver.execute(cli_options, template)
    sam_deployer.main(cli_options.name,
                      template_path=cli_options.sam_template_path,
                      template_context=cli_options.sam_template_context.context,
                      bucket_name=cli_options.sam_bucket_name,
                      role_arn=cli_options.role_arn)
    # ../hip-edit-web/ng build -e prod
    web_app_deployer.main(cli_options.name, cli_options.app_dist_path, suffix=cli_options.domain_suffix)


if __name__ == '__main__':
    main()
