#!/usr/bin/env node

const isEmpty = require('lodash/isEmpty');

const { GlobalConfig } = require('../../../config');
const { Parser } = require('../../../parser');
const { printMessage, formatMessage } = require('../../../messages');
const globalMessages = require('../../../messages/messages');
const { safeExit, isValidYamlFileName } = require('../../../utility');
const Menu = require('../../../menu');
const Operation = require('../operation');

const loadAndRunCbfFile = ymlFilename => {
  Parser.runScript(ymlFilename);
};

const handler = args => {
  GlobalConfig.load();
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    if (isEmpty(args)) {
      printMessage(formatMessage(globalMessages.noSavedScripts));
      safeExit();
    } else {
      const ymlFilename = args[0];
      loadAndRunCbfFile(ymlFilename);
    }
  } else if (isEmpty(args)) {
    const menu = new Menu({
      operationName: operation.name,
      operationRun: operation.run,
    });
    menu.run();
  } else {
    const scriptNameOrYmlFilename = args[0];
    if (isValidYamlFileName(scriptNameOrYmlFilename)) {
      const ymlFilename = args[0];
      loadAndRunCbfFile(ymlFilename);
    } else {
      const script = GlobalConfig.getScript(scriptNameOrYmlFilename);
      if (script) {
        script.run();
      } else {
        printMessage(
          formatMessage(globalMessages.scriptDoesNotExist, {
            scriptName: scriptNameOrYmlFilename,
          }),
        );
        safeExit();
      }
    }
  }
};

const operation = {
  name: 'run',
  flag: 'r',
  description: 'run a previously saved script',
  args: [
    {
      name: 'script name',
      required: false,
    },
  ],
  whitelist: ['documented'],
  run: handler,
};

module.exports = new Operation(operation);
