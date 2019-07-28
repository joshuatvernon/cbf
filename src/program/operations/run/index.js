#!/usr/bin/env node

const path = require('path');

const isEmpty = require('lodash/isEmpty');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../../../config');
const Parser = require('../../../parser');
const globalMessages = require('../../../messages');
const { safeExit, isValidYamlFileName } = require('../../../utility');
const Menu = require('../../../menu');
const Operation = require('../operation');

const loadAndRunCbfFile = yamlFileName => {
  const script = Parser.getScript(yamlFileName);
  printMessage(
    formatMessage(globalMessages.loadedScript, {
      scriptName: script.getName(),
      yamlFileName: path.basename(yamlFileName),
    }),
  );
  script.run();
};

const run = args => {
  GlobalConfig.load();
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    if (isEmpty(args)) {
      printMessage(formatMessage(globalMessages.noSavedScripts));
      safeExit();
    } else {
      const yamlFilename = args[0];
      loadAndRunCbfFile(yamlFilename);
    }
  } else if (isEmpty(args)) {
    const menu = new Menu({
      operationName: operation.name,
      operationRun: operation.run,
    });
    menu.run();
  } else {
    const scriptNameOrYamlFileName = args[0];
    if (isValidYamlFileName(scriptNameOrYamlFileName)) {
      loadAndRunCbfFile(scriptNameOrYamlFileName);
    } else {
      const script = GlobalConfig.getScript(scriptNameOrYamlFileName);
      if (script) {
        script.run();
      } else {
        printMessage(
          formatMessage(globalMessages.scriptDoesNotExist, {
            scriptName: scriptNameOrYamlFileName,
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
  run,
};

module.exports = new Operation(operation);
