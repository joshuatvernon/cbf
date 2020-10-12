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
const { GlobalConfig } = require('../../../config');
const { hasPackageJsonFile, safeExit } = require('../../../utility');
const { CurrentOperatingModes } = require('../../../operating-modes');
const { Argument, Operation } = require('../operation');

const messages = require('./messages');

/**
 * Run the package.json operation
 *
 * @param {string[]} args - arguments passed to the save operation
 */
const run = args => {
  const filterProperties = args[0] ? args[0] : '';
  GlobalConfig.load();
  const npmAlias = GlobalConfig.getNPMAlias();
  CurrentOperatingModes.add(OperatingModes.RUNNING_PACKAGE_JSON);
  if (!hasPackageJsonFile()) {
    printMessage(formatMessage(messages.noPackageJsonFile));
    safeExit();
  } else {
    const script = Parser.getScriptFromJsonFile({
      fileName: PATH_TO_PACKAGE_JSON,
      scriptType: ScriptTypes.SIMPLE,
      scriptStartingKey: PACKAGE_JSON_SCRIPTS_PROPERTY,
      filterProperties: filterProperties.split(','),
      npmAlias,
    });
    printMessage(formatMessage(globalMessages.runningScriptsFromPackageJson));
    script.run();
  }
};

const argument = new Argument({ name: 'comma separated props', required: false });
const operation = {
  name: 'json',
  flag: 'j',
  description: 'run scripts in a package.json file',
  args: [argument],
  whitelist: ['documented', 'dry-run'],
  run,
};

module.exports = new Operation(operation);
