#!/usr/bin/env node

const noop = require('lodash/noop');

const { GlobalConfig } = require('../../../config');
const { printMessage, formatMessage } = require('../../../messages');
const { prompts, inquirerPrompts } = require('../../../shims/inquirer');
const { safeExit } = require('../../../utility');
const Operation = require('../operation');

const messages = require('./messages');

const getShellQuestion = () => ({
  type: 'list',
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

const handler = () => {
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
  run: handler,
};

module.exports = new Operation(operation);
