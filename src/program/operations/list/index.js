#!/usr/bin/env node

const {
  GlobalConfig,
} = require('../../../config');
const {
  print,
  ERROR,
  MESSAGE,
} = require('../../../messages');
const {
  safeExit,
} = require('../../../utility');
const Operation = require('../operation');

const handler = () => {
  GlobalConfig.load();
  if (Object.keys(GlobalConfig.getScripts()).length === 0) {
    print(ERROR, 'noSavedScripts');
  } else {
    // print out script names and paths
    const scriptNames = Object.keys(GlobalConfig.getScripts())
      .map(key => GlobalConfig.getScript(key).getName());
    print(MESSAGE, 'listScripts', ...scriptNames);
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
