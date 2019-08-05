#!/usr/bin/env node

const isEmpty = require('lodash/isEmpty');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../../../config');
const globalMessages = require('../../../messages');
const { safeExit } = require('../../../utility');
const { Operation } = require('../operation');

/**
 * Run the list operation
 */
const run = () => {
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
  run,
};

module.exports = new Operation(operation);
