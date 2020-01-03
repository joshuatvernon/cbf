#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../../../config');
const { OperatingModes } = require('../../../constants');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');
const { safeExit } = require('../../../utility');
const { CurrentOperatingModes } = require('../../../operating-modes');
const { Operation } = require('../operation');

const messages = require('./messages');

/**
 * Handle the users answer to whether or not all scripts should be deleted
 *
 * @param {boolean} answer        - answer to whether or not all scripts should be deleted
 * @param {Subscriber} subscriber - subscriber to unsubscribe from after completing operation
 */
const handleShouldDeleteAllScriptsAnswer = (answer, subscriber) => {
  if (answer === false) {
    printMessage(formatMessage(messages.scriptsNotDeleted));
    subscriber.unsubscribe();
    safeExit();
  } else {
    const dryRun = CurrentOperatingModes.includes(OperatingModes.DRY_RUN);
    if (dryRun) {
      printMessage(formatMessage(messages.dryRun));
      safeExit();
      return;
    }
    GlobalConfig.removeAllScripts();
    GlobalConfig.removeAllScriptNames();
    GlobalConfig.save();
    printMessage(formatMessage(messages.deletedAllScripts));
    subscriber.unsubscribe();
    safeExit();
  }
};

/**
 * Prompt the user asking whether all scripts should be deleted
 */
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

/**
 * Run the delete all operation
 */
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
  whitelist: ['dry-run'],
  run,
};

module.exports = new Operation(operation);
