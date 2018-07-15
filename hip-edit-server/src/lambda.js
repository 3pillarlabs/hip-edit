'use strict';

const express = require('express');
const awsServerlessExpress = require('aws-serverless-express');
const factory = require('./app').factory;
const decorateApp = require('./app-decorator');

const app = factory(decorateApp(express()));
const server = awsServerlessExpress.createServer(app, null, null);

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
