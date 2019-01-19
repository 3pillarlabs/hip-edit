'use strict';

const authAws = require('./modules/auth/aws-handler');

exports.handler = authAws.createHandler();
