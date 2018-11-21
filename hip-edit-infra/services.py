"""
Builds the infrastructure for Hip Edit backing services.
"""
from __future__ import print_function
import logging
from os import path
from hip_edit import activemq
from hip_edit import cli_arg_parser
from hip_edit import cf_template_builder
from hip_edit import cf_driver
from hip_edit import log
from hip_edit.build_context import BuildContext

LOGGER = log.get_stream_logger(__name__)

def main():
    """
    Entry point
    """
    cli_options = cli_arg_parser.services_arg_parser().parse_args()
    logging.root.setLevel(logging.DEBUG if cli_options.verbose else logging.INFO)
    if not cli_options.stack_down():
        if cli_options.stack_halt():
            if confirm("""You are going to stop the ActveMQ instance and release the EIP forever.
                       Is this what you want?""") != 'yes':
                LOGGER.info('No changes made.')
                return
        template = cf_template_builder.build(cli_options)
    else:
        if confirm("""You are going to destroy all stack resources and
                   this operation can not be done. Is this what you want?""") != 'yes':
            LOGGER.info('No changes made.')
            return
        template = None
    outputs = cf_driver.execute(cli_options, template)
    if outputs is None or cli_options.stack_down():
        return
    build_ctx = BuildContext()
    build_ctx.add('services', outputs).save()
    activemq_instance_id = build_ctx.get('MessageServerInstanceId', group_key='services')
    if cli_options.stack_up():
        activemq.check_instance_status(instance_id=activemq_instance_id)
        hostname = build_ctx.get('npm_config_messaging_host')
        outputs = activemq.configure(cli_options, hostname,
                                     templates_path=path.abspath('./artifacts/activemq'),
                                     distribution_type='bitnami')
        build_ctx.add(('services', 'activemq', 'users'), outputs).save()
    else:
        activemq.halt_instance(instance_id=activemq_instance_id)



def confirm(message, prompt=' ([no]/yes) '):
    """Prints a message and returns user input."""
    print("\n".join((s.strip() for s in message.split("\n"))), end='')
    return raw_input(prompt)



if __name__ == '__main__':
    main()
