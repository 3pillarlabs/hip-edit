"""
Builds the VPC, a key pair and a single instance
"""
import time
import boto3
import botocore
from hip_edit import key_pair_builder
from hip_edit import log

logger = log.get_stream_logger(__name__)


def execute(cli_options, template):
    """
    Build, validate and execute the CF template.

    :param cli_options: dictionary with CLI options
    :param template: CF Template instance
    """
    stack_name = "%sStack" % cli_options.name
    if not cli_options.dry_run:
        _build_key_pair(key_name=cli_options.key_name)
        if cli_options.update_or_create:
            update_or_create_cf_template(stack_name, template, role_arn=cli_options.role_arn)
        else:
            _delete_cf_stack(stack_name, role_arn=cli_options.role_arn)
            # TODO delete key_pair
    else:
        logger.debug(template.to_yaml())
        _check_credentials()
        _validate_cf_template(template)


def _build_key_pair(key_name):
    key_pair_builder.build(key_name)


def update_or_create_cf_template(stack_name, template,
                                 client=boto3.client('cloudformation'),
                                 retry_seconds=10,
                                 role_arn=None):
    """
    Updates or creates the resources represented in the cloud formation template.
    """
    stack_id = None
    try:
        response = client.describe_stacks(StackName=stack_name)
        logger.debug(response)
        stack_id = response['Stacks'][0]['StackId']
    except botocore.exceptions.ClientError as error:
        logger.debug(error)

    if stack_id is None:
        stack_id = _create_cf_stack(stack_name, template, client, role_arn)
    else:
        if _update_cf_stack(stack_id, template, client, role_arn) is False:
            return

    _wait_to_completion(stack_id, client, retry_seconds=retry_seconds)


def _update_cf_stack(stack_id, template, client, role_arn=None):
    try:
        response = client.update_stack(
            StackName=stack_id,
            TemplateBody=template.to_yaml(),
            RoleARN=role_arn
        )
        stack_id = response['StackId']
        logger.info("Updating stack %s" % stack_id)
        return True
    except botocore.exceptions.ClientError:
        logger.info("No updates are to be performed.")
        return False


def _create_cf_stack(stack_name, template, client, role_arn=None):
    response = client.create_stack(
        StackName=stack_name,
        TemplateBody=template.to_yaml(),
        RoleARN=role_arn
    )
    stack_id = response['StackId']
    logger.info("Creating stack %s..." % stack_id)
    return stack_id


def _delete_cf_stack(stack_name,
                     client=boto3.client('cloudformation'),
                     retry_seconds=10,
                     role_arn=None):
    client.delete_stack(
        StackName=stack_name,
        RoleARN=role_arn
    )
    _wait_to_completion(stack_name, client, retry_seconds)


TERMINAL_STATES = [
    'UPDATE_COMPLETE',
    'UPDATE_ROLLBACK_COMPLETE',
    'CREATE_COMPLETE',
    'ROLLBACK_COMPLETE',
    'ROLLBACK_FAILED',
    'UPDATE_ROLLBACK_FAILED'
]

def _wait_to_completion(stack_id, client, retry_seconds=10):
    outputs_count = 0
    while True:
        response = None
        try:
            response = client.describe_stacks(StackName=stack_id)
        except botocore.exceptions.ClientError as error:
            logger.info("Stack '%s' does not exist" % stack_id)
            break

        logger.debug(response)
        stack = response['Stacks'][0]
        status = stack['StackStatus']
        outputs = stack['Outputs'] if 'Outputs' in stack else []
        if len(outputs) > outputs_count:
            logger.info("Status: %s, Outputs: %s" % (status, outputs))
            outputs_count = len(outputs)
        else:
            logger.info("Status: %s" % status)

        if status in TERMINAL_STATES:
            break

        if retry_seconds > 0:
            logger.debug("Retry in %d seconds..." % retry_seconds)
            time.sleep(retry_seconds)


def _validate_cf_template(template, client=boto3.client('cloudformation')):
    response = client.validate_template(TemplateBody=template.to_yaml())
    logger.info(response)

def _check_credentials(client=boto3.client('iam')):
    # TODO: check RoleARN
    response = client.get_user()
    logger.info(response)
