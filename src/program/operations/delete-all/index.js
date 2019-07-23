#!/usr/bin/env node

const noop = require('lodash/noop');

const { GlobalConfig } = require('../../../config');
const { printMessage, formatMessage } = require('../../../messages');
const { prompts, inquirerPrompts } = require('../../../shims/inquirer');
const { safeExit } = require('../../../utility');
const Operation = require('../operation');

const messages = require('./messages');

const handleShouldDeleteAllScriptsAnswer = (answer, subscriber) => {
  if (answer === false) {
    printMessage(formatMessage(messages.scriptsNotDeleted));
    subscriber.unsubscribe();
    safeExit();
  } else {
    GlobalConfig.removeAllScripts();
    GlobalConfig.save();
    printMessage(formatMessage(messages.deletedAllScripts));
    subscriber.unsubscribe();
    safeExit();
  }
};

const shouldDeleteAllScripts = () => {
  const subscriber = inquirerPrompts.subscribe(
    ({ answer }) => {
      handleShouldDeleteAllScriptsAnswer(answer, subscriber);
    },
    noop,
    noop,
  );

  prompts.next({
    type: 'confirm',
    name: 'shouldDeleteAll',
    message: formatMessage(messages.shouldDeleteAllScripts),
    default: false,
  });
};

const handler = () => {
  GlobalConfig.load();
  if (Object.keys(GlobalConfig.getScripts()).length > 0) {
    shouldDeleteAllScripts();
  } else {
    printMessage(formatMessage(messages.noScriptsToDelete));
    safeExit();
  }
};

const operation = {
  name: 'delete-all',
  flag: 'A',
  description: 'delete all previously saved scripts',
  args: [],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
