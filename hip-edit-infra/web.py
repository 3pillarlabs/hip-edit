"""
Webapp deployer.
"""
from __future__ import print_function
from os import path
import logging
from hip_edit import cli_arg_parser
from hip_edit import web_app_deployer
from hip_edit.build_context import BuildContext


def main():
    """
    Entry point.
    """
    cli_options = cli_arg_parser.web_arg_parser().parse_args()
    logging.root.setLevel(logging.DEBUG if cli_options.verbose else logging.INFO)
    if cli_options.create_prod_env:
        build_context = BuildContext()
        prod_conf_path = path.join(cli_options.app_path, cli_options.prod_file_path)
        web_app_deployer.write_prod_env(build_context, out_file_path=prod_conf_path)
    else:
        app_dist_path = path.join(cli_options.app_path, cli_options.dist_dir)
        web_app_deployer.main(cli_options.name, app_dist_path, suffix=cli_options.domain_suffix)



if __name__ == '__main__':
    main()
