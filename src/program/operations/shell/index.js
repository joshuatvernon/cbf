#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../../../config');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');
const { safeExit } = require('../../../utility');
const Operation = require('../operation');

const messages = require('./messages');

const getShellQuestion = () => ({
  type: InquirerPromptTypes.LIST,
  name: 'shell',
  message: formatMessage(messages.shellQuestion),
  choices: ['sh', 'bash', 'zsh'],
});

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

  prompts.next(getShellQuestion());
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
