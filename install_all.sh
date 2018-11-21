#!/usr/bin/env bash
# Installs dependencies for all modules

pip install --upgrade pip || exit $?

npm install npm@latest -g || exit $?

cd hip-edit-infra
pip install -r requirements.txt || exit $?

cd ../hip-edit-server
npm install || exit $?

cd ../hip-edit-web
npm install || exit $?

exit 0
