#!/usr/bin/env node

const noop = require('lodash/noop');
const isEmpty = require('lodash/isEmpty');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../../../config');
const globalMessages = require('../../../messages');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');
const { safeExit } = require('../../../utility');
const Menu = require('../../../menu');
const Operation = require('../operation');

const messages = require('./messages');

/**
 * Prompt the user whether or not the delete the current script
 */
const shouldDeleteScript = scriptName => {
  const subscriber = inquirerPrompts.subscribe(
    ({ answer }) => {
      if (answer === false) {
        printMessage(
          formatMessage(messages.scriptNotDeleted, {
            scriptName,
          }),
        );
        subscriber.unsubscribe();
        safeExit();
      } else {
        GlobalConfig.removeScript(scriptName);
        GlobalConfig.removeScriptName(scriptName);
        GlobalConfig.save();
        printMessage(
          formatMessage(messages.deletedScript, {
            scriptName,
          }),
        );
        subscriber.unsubscribe();
        safeExit();
      }
    },
    noop,
    noop,
  );

  prompts.next({
    type: InquirerPromptTypes.CONFIRM,
    name: 'shouldDelete',
    message: formatMessage(messages.shouldDelete, {
      scriptName,
    }),
    default: false,
  });
};

const run = args => {
  GlobalConfig.load();
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    printMessage(formatMessage(globalMessages.noSavedScripts));
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
      printMessage(
        formatMessage(globalMessages.scriptDoesNotExist, {
          scriptName,
        }),
      );
      safeExit();
    }
  }
};

const operation = {
  name: 'delete',
  flag: 'd',
  description: 'delete a previously saved script',
  args: [
    {
      name: 'script name',
      required: false,
    },
  ],
  whitelist: [],
  run,
};

module.exports = new Operation(operation);
