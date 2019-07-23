#!/usr/bin/env node

const { GlobalConfig } = require('../../../config');
const { printMessage, formatMessage } = require('../../../messages');
const { safeExit } = require('../../../utility');
const Operation = require('../operation');

const messages = require('./messages');

const handler = () => {
  GlobalConfig.load();
  printMessage(
    formatMessage(messages.printConfig, {
      config: JSON.stringify(GlobalConfig, null, 4),
    }),
  );
  safeExit();
};

const operation = {
  name: 'config',
  flag: 'c',
  description: 'display configuration',
  args: [],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
