#!/usr/bin/env node

const noop = require('lodash/noop');
const isEmpty = require('lodash/isEmpty');

const {
  GlobalConfig,
} = require('../../../config');
const {
  print,
  Message,
  ERROR,
  MESSAGE,
} = require('../../../messages');
const {
  prompts,
  inquirerPrompts,
} = require('../../../shims/inquirer');
const {
  safeExit,
} = require('../../../utility');
const Menu = require('../../../menu');
const Operation = require('../operation');

/**
 * Prompt the user whether or not the delete the current script
 */
const shouldDeleteScript = (scriptName) => {
  const subscriber = inquirerPrompts.subscribe(({
    answer,
  }) => {
    if (answer === false) {
      print(MESSAGE, 'scriptNotDeleted', scriptName);
      subscriber.unsubscribe();
      safeExit();
    } else {
      GlobalConfig.removeScript(scriptName);
      GlobalConfig.save();
      print(MESSAGE, 'deletedScript', scriptName);
      subscriber.unsubscribe();
      safeExit();
    }
  }, noop, noop);

  prompts.next({
    type: 'confirm',
    name: 'shouldDelete',
    message: Message('shouldDelete', scriptName),
    default: false,
  });
};

const handler = (args) => {
  GlobalConfig.load();
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    print(ERROR, 'noSavedScripts');
    safeExit();
  } else if (isEmpty(args)) {
    const menu = new Menu({
      operationName: operation.name,
      operationRun: operation.run,
    });
    menu.run();
  } else {
    const scriptName = args[0];
    if (GlobalConfig.getScript(scriptName)) {
      shouldDeleteScript(scriptName);
    } else {
      print(ERROR, 'scriptDoesNotExist', scriptName);
      safeExit();
    }
  }
};

const operation = {
  name: 'delete',
  flag: 'd',
  description: 'delete a previously saved script',
  args: [{
    name: 'script name',
    required: false,
  }],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
