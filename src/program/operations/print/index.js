#!/usr/bin/env node

const isEmpty = require('lodash/isEmpty');
const chalk = require('chalk');

const { GlobalConfig } = require('../../../config');
const { printMessage, formatMessage } = require('../../../messages');
const globalMessages = require('../../../messages/messages');
const { printJson, safeExit } = require('../../../utility');
const Menu = require('../../../menu');
const Operation = require('../operation');

const OPERATION_NAME = 'print';
const OPERATION_FLAG = 'p';
const OPERATION_DESCRIPTION = 'print a saved script';

/**
 * Print a script
 *
 * TODO change this whole function to print out the .yml file reverse engineered from the .json file
 */
const printScript = script => {
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue.bold(script.getName())} script:\n`);

  // eslint-disable-next-line no-console
  console.log('Options:');
  printJson(script.getOptions(), 'cyan');

  // eslint-disable-next-line no-console
  console.log('\nCommands:');
  printJson(script.getCommands(), 'green');

  // eslint-disable-next-line no-console
  console.log('\nDirectories:');
  printJson(script.getDirectories(), 'blue');
};

const handler = args => {
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
    const script = GlobalConfig.getScript(scriptName);
    if (script) {
      printScript(script);
    } else {
      printMessage(
        formatMessage(globalMessages.scriptDoesNotExist, {
          scriptName,
        }),
      );
    }
    safeExit();
  }
};

const operation = {
  name: OPERATION_NAME,
  flag: OPERATION_FLAG,
  description: OPERATION_DESCRIPTION,
  args: [
    {
      name: 'script name',
      required: false,
    },
  ],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
