#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../../../config');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');
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
    GlobalConfig.removeAllScriptNames();
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
    type: InquirerPromptTypes.CONFIRM,
    name: 'shouldDeleteAll',
    message: formatMessage(messages.shouldDeleteAllScripts),
    default: false,
  });
};

const run = () => {
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
  run,
};

module.exports = new Operation(operation);
