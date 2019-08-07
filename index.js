#!/usr/bin/env node

/* eslint-disable */
const { uncaughtExceptionListener, unhandledRejectionListener } = require('./src/utility');

// Add exception and rejection listeners which will print an unknown error if in prod env or a stack trace if in test env
uncaughtExceptionListener();
unhandledRejectionListener();
/* eslint-enable */

const { init } = require('./src/cli');

init();
