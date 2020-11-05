#!/usr/bin/env node

const fse = require('fs-extra');
const isEmpty = require('lodash/isEmpty');
const { printMessage, formatMessage } = require('formatted-messages');

const { SCRIPTS_DIRECTORY_PATH } = require('../../../constants');
const { GlobalConfig } = require('../../../config');
const globalMessages = require('../../../messages');
const { safeExit } = require('../../../utility');
const Menu = require('../../../menu');
const { Argument, Operation } = require('../operation');

const messages = require('./messages');

const OPERATION_NAME = 'print';
const OPERATION_FLAG = 'p';
const OPERATION_DESCRIPTION = 'print a saved script';

/**
 * Prints a script as a yaml file
 *
 * @param {string} scriptName - the name of the script to be printed
 */
const printScript = scriptName => {
  let scriptPath = '';
  if (fse.existsSync(`${SCRIPTS_DIRECTORY_PATH}/${scriptName}.yml`)) {
    // Print script
    scriptPath = `${SCRIPTS_DIRECTORY_PATH}/${scriptName}.yml`;
  } else if (fse.existsSync(`${SCRIPTS_DIRECTORY_PATH}/${scriptName}.simple.yml`)) {
    // Print simple script
    scriptPath = `${SCRIPTS_DIRECTORY_PATH}/${scriptName}.simple.yml`;
  }
  if (scriptPath) {
    fse
      .readFile(scriptPath)
      .then(script => {
        printMessage(
          formatMessage(messages.printScript, {
            script,
            scriptName,
          }),
        );
      })
      .catch(error => {
        printMessage(
          formatMessage(messages.errorPrintingScript, {
            error,
            scriptName,
          }),
        );
      });
  } else {
    printMessage(
      formatMessage(globalMessages.scriptDoesNotExist, {
        scriptName,
      }),
    );
  }
};

/**
 * Run the print operation
 *
 * @param {string[]} args - arguments passed to the print operation
 */
const run = args => {
  GlobalConfig.load();
  if (isEmpty(GlobalConfig.getScriptNames())) {
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
    if (GlobalConfig.hasScript(scriptName)) {
      printScript(scriptName);
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

const scriptNameArgument = new Argument({ name: 'script name', required: false });
const operation = {
  name: OPERATION_NAME,
  flag: OPERATION_FLAG,
  description: OPERATION_DESCRIPTION,
  args: [scriptNameArgument],
  whitelist: [],
  run,
};

module.exports = new Operation(operation);
