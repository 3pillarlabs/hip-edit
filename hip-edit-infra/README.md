# hip-edit-infra

This is the infrastructure code.

# Configuration

From zero to continuous deployment with AWS Code Pipeline -

0. Create an AWS account. Note that some services used may not be eligible for AWS free tier.
0. Create a key pair on AWS, and save the private key file.
0. Create a S3 bucket on AWS with default encryption.
0. Upload the private key file to this S3 bucket.
0. Create another S3 bucket to upload AWS CloudFormation or SAM templates.
0. Create an IAM Role that allows API gateway write access to CloudWatch, and then go to API Gateway > Settings, and save the ARN of the new role. Check the examples for reference.
0. Create an IAM Role that allows AWS Cloudformation to create AWS resources on your behalf. The fastest (and not recommended) way is to provide full administrative access to the role at the beginning and then trim the access.
0. Create an IAM Role that allows AWS Code Build access to various resources. Check the examples for reference.
0. Create a Code Build job, using the IAM role for Code Build, and set the following environment variables (and values):
    * ``KEY_PAIR_NAME``: The EC2 key pair that was created as the first step.
    * ``SECRETS_BUCKET_NAME``: S3 bucket where the EC2 key pair is stored.
    * ``PUBLISHER_USER``: ``hip_edit``
    * ``npm_config_messaging_editor_topic_domain``: `HipEdit.Editor`
    * ``CONSUMER_USER``: ``guest``
    * ``CF_ROLE_ARN``: The IAM Role ARN for CloudFormation to assume to create resources on your behalf.
    * ``SERVICES_VPC_ID``: (Optional). VPC ID if you want to use an existing VPC, instead of creating a new one.
    * ``SERVICES_SUBNET_ID``: (Optional). Subnet ID within the VPC if you want to use the subnet, instead of creating a new one.
    * ``npm_config_auth_app_host``: Host name of the SPA.
    * ``npm_config_auth_google_client_id``: Google web credentials client ID.
    * ``npm_config_auth_google_client_secret``: Google web credentials client secret.
    * ``npm_config_auth_google_callback_url``: ``https://API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/ga/auth/google/callback``
0. Create a Code Pipeline, create a Source from GitHub and attach to the Code Build.

# ActiveMQ EC2 Instance
The two resources that are billed even when the application is not in use are the EC2 instance and the Elastic IP (EIP) once the EC2 instance is shut down or terminated. In order to stop the instance and release the EIP -
```bash
python services.py halt --name EngTools -s 3pillar-eng -u $CF_ROLE_ARN \
--vpc-id $SERVICES_VPC_ID --subnet-id $SERVICES_SUBNET_ID $KEY_PAIR_NAME \
--amq-users publishers:$PUBLISHER_USER guests:$CONSUMER_USER
```

To bring back up all services, just execute the Code Build from the AWS CLI or Console.

## Examples

### API Gateway IAM Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### Code Build IAM Role

Multiple policiies are represented as an array of policies.
```json
[
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Resource": [
          "arn:aws:logs:REGION:ACCOUNT_ID:log-group:/aws/codebuild/CODE_BUILD_JOB_NAME",
          "arn:aws:logs:REGION:ACCOUNT_ID:log-group:/aws/codebuild/CODE_BUILD_JOB_NAME:*"
        ],
        "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
      },
      {
        "Effect": "Allow",
        "Resource": [
          "arn:aws:s3:::codepipeline-us-east-1-*"
        ],
        "Action": [
          "s3:PutObject",
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
      }
    ]
  },

  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "VisualEditor0",
        "Effect": "Allow",
        "Action": [
            "ec2:StartInstances",
            "ec2:StopInstances"
        ],
        "Resource": "arn:aws:ec2:*:*:instance/*"
      },
      {
        "Sid": "VisualEditor1",
        "Effect": "Allow",
        "Action": [
            "ec2:DescribeInstances",
            "ec2:DescribeInstanceAttribute",
            "ec2:DescribeInstanceStatus"
        ],
        "Resource": "*"
      }
    ]
  },

  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "VisualEditor0",
        "Effect": "Allow",
        "Action": "iam:PassRole",
        "Resource": "arn:aws:iam::ACCOUNT_ID:role/CloudFormationAdmin"
      }
    ]
  },

  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "VisualEditor0",
        "Effect": "Allow",
        "Action": "cloudformation:*",
        "Resource": "*"
      }
    ]
  },

  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "VisualEditor0",
        "Effect": "Allow",
        "Action": [
            "s3:ListAllMyBuckets",
            "s3:HeadBucket"
        ],
        "Resource": "*"
      },
      {
        "Sid": "VisualEditor1",
        "Effect": "Allow",
        "Action": "s3:*",
        "Resource": [
            "arn:aws:s3:::S3_BUCKET_FOR_CF_PKG",
            "arn:aws:s3:::ENCRYPTED_S3_BUCKET",
            "arn:aws:s3:::*/*"
        ]
      }
    ]
  }
]
```

### CloudFormation Admin Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```
