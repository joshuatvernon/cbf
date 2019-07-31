#!/usr/bin/env node

/* eslint-disable */
const { uncaughtExceptionListener, unhandledRejectionListener } = require('./src/utility');
const { Env } = require('./src/constants');

if (process.env.NODE_ENV === Env.TEST) {
  uncaughtExceptionListener();
  unhandledRejectionListener();
}
/* eslint-enable */

const { init } = require('./src/cli');

init();
