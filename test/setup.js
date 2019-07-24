#!/usr/bin/env node

const { uncaughtExceptionListener, unhandledRejectionListener } = require('../src/utility');

uncaughtExceptionListener();
unhandledRejectionListener();
