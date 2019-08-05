#!/usr/bin/env node

const path = require('path');

const isEmpty = require('lodash/isEmpty');
const { printMessage, formatMessage } = require('formatted-messages');

const Parser = require('../../../parser');
const globalMessages = require('../../../messages');
const { GlobalConfig } = require('../../../config');
const { safeExit, isValidYamlFileName, isValidJsonFileName } = require('../../../utility');
const Menu = require('../../../menu');
const { Argument, Operation } = require('../operation');

/**
 * Load and run the cbf file
 *
 * @param {string} fileName - name of the file to load and run
 */
const loadAndRunScriptFile = fileName => {
  let script;
  if (isValidYamlFileName(fileName)) {
    script = Parser.getScriptFromYamlFile(fileName);
  } else if (isValidJsonFileName(fileName)) {
    script = Parser.getScriptFromJsonFile({ fileName });
  } else {
    printMessage(formatMessage(globalMessages.invalidScriptFile, { fileName }));
  }
  printMessage(
    formatMessage(globalMessages.loadedScript, {
      scriptName: script.getName(),
      fileName: path.basename(fileName),
    }),
  );
  script.run();
};

/**
 * Run the run operation
 *
 * @param {string[]} args - arguments passed to the run operation
 */
const run = args => {
  GlobalConfig.load();
  if (isEmpty(GlobalConfig.getScriptNames())) {
    // No saved scripts
    if (isEmpty(args)) {
      // No saved scripts and no file name passed
      printMessage(formatMessage(globalMessages.noSavedScripts));
      safeExit();
    } else {
      // Arguments passed
      const filename = args[0];
      if (isValidYamlFileName(filename) || isValidJsonFileName(filename)) {
        // Argument is valid yaml or json file -- load and run script
        loadAndRunScriptFile(filename);
      } else {
        // Argument is NOT a valid yaml or json file
        printMessage(formatMessage(globalMessages.invalidScriptFile, { filename }));
      }
    }
  } else if (isEmpty(args)) {
    // No arguments -- run menu
    const menu = new Menu({
      operationName: operation.name,
      operationRun: operation.run,
    });
    menu.run();
  } else {
    // Config has scripts and an argument was passed
    const scriptNameOrFileName = args[0];
    if (isValidYamlFileName(scriptNameOrFileName) || isValidJsonFileName(scriptNameOrFileName)) {
      // Argument is valid yaml or json file -- load and run script
      loadAndRunScriptFile(scriptNameOrFileName);
    } else {
      const script = GlobalConfig.getScript(scriptNameOrFileName);
      if (script) {
        // Argument is valid script name -- run script
        script.run();
      } else {
        // Argument is NOT a valid script name
        printMessage(
          formatMessage(globalMessages.scriptDoesNotExist, {
            scriptName: scriptNameOrFileName,
          }),
        );
        safeExit();
      }
    }
  }
};

const scriptNameArgument = new Argument({ name: 'script name', required: false });
const operation = {
  name: 'run',
  flag: 'r',
  description: 'run a previously saved script',
  args: [scriptNameArgument],
  whitelist: ['documented'],
  run,
};

module.exports = new Operation(operation);
