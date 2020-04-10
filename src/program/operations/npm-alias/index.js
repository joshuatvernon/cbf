#!/usr/bin/env node

const noop = require('lodash/noop');
const {
  printMessage,
  formatMessage
} = require('formatted-messages');

const {
  GlobalConfig
} = require('../../../config');
const {
  prompts,
  inquirerPrompts,
  InquirerPromptTypes
} = require('../../../shims/inquirer');
const {
  safeExit
} = require('../../../utility');
const {
  Operation
} = require('../operation');

const messages = require('./messages');

/**
 * Handle the answer to what NPM alias should be set
 *
 * @param {string} npmAlias - the NPM alias the user chose to use when running scripts from a package.json
 */
const handleAnswerNPMAliasQuestion = npmAlias => {
  GlobalConfig.updateNPMAlias(npmAlias);
  GlobalConfig.save();

  printMessage(
    formatMessage(messages.npmAliasSet, {
      npmAlias: GlobalConfig.getNPMAlias(),
    }),
  );
};

/**
 * Run the npm-alias operation
 */
const run = () => {
  const subscriber = inquirerPrompts.subscribe(
    ({
      answer
    }) => {
      handleAnswerNPMAliasQuestion(answer);
      subscriber.unsubscribe();
      safeExit();
    },
    noop,
    noop,
  );

  prompts.next({
    type: InquirerPromptTypes.INPUT,
    name: 'npm-alias',
    message: formatMessage(messages.npmAliasQuestion)
  });
};

const operation = {
  name: 'npm-alias',
  flag: 'N',
  description: 'set an alias that should be ran instead of npm when running scripts in a package.json',
  args: [],
  whitelist: [],
  run,
};

module.exports = new Operation(operation);
