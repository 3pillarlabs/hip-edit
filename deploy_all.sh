#!/usr/bin/env bash

# Deploys all module dependencies
key_dir_path="~/.ssh"
key_name="BouncyBotKeyPair"
key_file="${key_name}.pem"

mkdir -p $key_dir_path || exit $?
chmod 700 $key_dir_path || exit $?
aws s3 cp s3://3pillar-eng-tools-secrets/${key_file} ${key_dir_path}/${key_file}
chmod 400 ${key_dir_path}/${key_file}

cd hip-edit-server
npm run build-lambda || exit $?

cd ../hip-edit-infra

python services.py --name EngTools -s 3pillar-eng -u $CF_ROLE_ARN $* \
--vpc-id $SERVICES_VPC_ID --subnet-id $SERVICES_SUBNET_ID ${key_name} \
--amq-users publishers:$PUBLISHER_USER guests:$CONSUMER_USER || exit $?

npm_config_messaging_user=$PUBLISHER_USER python sam.py --name EngTools -u $CF_ROLE_ARN $* \
../hip-edit-server/template.yml 3pillar-eng-apps || exit $?

npm_config_messaging_user=$CONSUMER_USER python web.py --name EngTools -e ../hip-edit-web $* || exit $?

cd ../hip-edit-web
npm run build || exit $?

cd ../hip-edit-infra
python web.py ../hip-edit-web -s 3pillar-eng --name EngTools $* || exit $?

exit 0
