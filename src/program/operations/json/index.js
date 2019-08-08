#!/usr/bin/env node

const { printMessage, formatMessage } = require('formatted-messages');

const globalMessages = require('../../../messages');
const Parser = require('../../../parser');
const {
  ScriptTypes,
  PATH_TO_PACKAGE_JSON,
  PACKAGE_JSON_SCRIPTS_PROPERTY,
  OperatingModes,
} = require('../../../constants');
const { hasPackageJsonFile, safeExit } = require('../../../utility');
const { CurrentOperatingModes } = require('../../../operating-modes');
const { Operation } = require('../operation');

const messages = require('./messages');

/**
 * Run the package.json operation
 */
const run = () => {
  CurrentOperatingModes.add(OperatingModes.RUNNING_PACKAGE_JSON);
  if (!hasPackageJsonFile()) {
    printMessage(formatMessage(messages.noPackageJsonFile));
    safeExit();
  } else {
    const script = Parser.getScriptFromJsonFile({
      fileName: PATH_TO_PACKAGE_JSON,
      scriptType: ScriptTypes.SIMPLE,
      scriptStartingKey: PACKAGE_JSON_SCRIPTS_PROPERTY,
    });
    printMessage(formatMessage(globalMessages.runningScriptsFromPackageJson));
    script.run();
  }
};

const operation = {
  name: 'json',
  flag: 'j',
  description: 'run scripts in a package.json file',
  args: [],
  whitelist: ['documented'],
  run,
};

module.exports = new Operation(operation);
