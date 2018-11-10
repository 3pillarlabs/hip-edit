#!/usr/bin/env bash

# Installs dependencies for all modules

pip install --upgrade pip
npm install npm@latest -g

cd hip-edit-infra
pip install -r requirements.txt

cd ../hip-edit-server
npm install

cd ../hip-edit-web
npm install
