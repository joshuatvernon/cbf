#!/usr/bin/env node

const isEmpty = require('lodash/isEmpty');

const { GlobalConfig } = require('../../../config');
const { formatMessage, printMessage } = require('../../../messages');
const globalMessages = require('../../../messages/messages');
const { safeExit } = require('../../../utility');
const Operation = require('../operation');

const handler = () => {
  GlobalConfig.load();
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    printMessage(formatMessage(globalMessages.noSavedScripts));
  } else {
    // print out script names and paths
    const scriptNames = Object.keys(GlobalConfig.getScripts()).map(key =>
      GlobalConfig.getScript(key).getName(),
    );
    printMessage(formatMessage(globalMessages.listScripts, { scripts: scriptNames }));
  }

  safeExit();
};

const operation = {
  name: 'list',
  flag: 'l',
  description: 'list previously saved scripts',
  args: [],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
