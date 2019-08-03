#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../../../config');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');
const { safeExit } = require('../../../utility');
const { Operation } = require('../operation');

const messages = require('./messages');

/**
 * Handle the answer to whether or not the shell should be updated
 *
 * @param {string} answer - the shell script the user chose to update the shell in the config with
 */
const handleAnswerShellQuestion = answer => {
  const shell = `/bin/${answer}`;

  GlobalConfig.updateShell(shell);
  GlobalConfig.save();

  printMessage(
    formatMessage(messages.shellSet, {
      shell: GlobalConfig.getShell(),
    }),
  );
};

/**
 * Run the shell operation
 */
const run = () => {
  const subscriber = inquirerPrompts.subscribe(
    ({ answer }) => {
      handleAnswerShellQuestion(answer);
      subscriber.unsubscribe();
      safeExit();
    },
    noop,
    noop,
  );

  prompts.next({
    type: InquirerPromptTypes.LIST,
    name: 'shell',
    message: formatMessage(messages.shellQuestion),
    choices: ['sh', 'bash', 'zsh'],
  });
};

const operation = {
  name: 'shell',
  flag: 'S',
  description: 'set which shell commands should be run within',
  args: [],
  whitelist: [],
  run,
};

module.exports = new Operation(operation);
