#!/usr/bin/env node

const { uncaughtExceptionListener, unhandledRejectionListener } = require('./src/utility');
const { init } = require('./src/cli');

uncaughtExceptionListener();
unhandledRejectionListener();
init();
