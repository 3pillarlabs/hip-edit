#!/usr/bin/env bash

# Deploys all module dependencies

cd hip-edit-server
npm run build-lambda

cd ../hip-edit-infra

python services.py --name EngTools -s 3pillar-eng -u $CF_ROLE_ARN $* \
--vpc-id $SERVICES_VPC_ID --subnet-id $SERVICES_SUBNET_ID BouncyBotKeyPair \
--amq-users publishers:$PUBLISHER_USER guests:$CONSUMER_USER

npm_config_messaging_user=$PUBLISHER_USER python sam.py --name EngTools -u $CF_ROLE_ARN $* \
../hip-edit-server/template.yml 3pillar-eng-apps

npm_config_messaging_user=$CONSUMER_USER python web.py --name EngTools -e ../hip-edit-web $*

cd ../hip-edit-web
npm run build

cd ../hip-edit-infra
python web.py ../hip-edit-web -s 3pillar-eng --name EngTools $*
