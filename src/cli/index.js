#!/usr/bin/env node

const path = require('path');

const fse = require('fs-extra');
const isEmpty = require('lodash/isEmpty');
const camelCase = require('lodash/camelCase');
const lowerCase = require('lodash/lowerCase');
const { printMessage, formatMessage } = require('formatted-messages');

const version = require('../../version');
const { GlobalConfig } = require('../config');
const { Operations, OperationTypes } = require('../program');
const {
  ScriptTypes,
  PROGRAM_NAME,
  PATH_TO_LOCAL_YAML,
  PATH_TO_LOCAL_SIMPLE_YAML,
  PATH_TO_LOCAL_JSON,
  PATH_TO_LOCAL_SIMPLE_JSON,
  PATH_TO_PACKAGE_JSON,
  PACKAGE_JSON_SCRIPTS_PROPERTY,
} = require('../constants');
const Parser = require('../parser');
const { commander } = require('../shims/commander');
const {
  isEmptyString,
  isValidParametersLength,
  safeExit,
  isValidYamlFileName,
  hasPackageJsonFile,
  loadJsonFile,
} = require('../utility');
const globalMessages = require('../messages');
const Menu = require('../menu');

const messages = require('./messages');

/**
 * Validate arguments length
 *
 * @param {Operation} operation - operation to validate arguments against
 * @param {string[]} args       - arguments to validate
 */
const validateArgumentLength = (operation, args) => {
  const minimumArgumentsLength = operation.args.filter(arg => arg.required).length;
  const maximumArgumentsLength = operation.args.length;
  if (
    !isValidParametersLength({
      actual: args.length,
      min: minimumArgumentsLength,
      max: maximumArgumentsLength,
    })
  ) {
    printMessage(
      formatMessage(messages.invalidNumberOfArgs, {
        command: operation.name,
        minimum: minimumArgumentsLength,
        maximum: maximumArgumentsLength,
        actual: args.length,
      }),
    );
    safeExit();
  }
};

/**
 * Get arguments
 *
 * @returns {string[]} args - arguments parsed from process
 */
const getArguments = () => {
  const args = process.argv.slice(2);
  return args.filter(arg => arg.indexOf('--') === -1 && arg.indexOf('-') !== 0);
};

/**
 * Return true if any of the operations passed are mutually exclusive
 *
 * @param {Operation[]} operations                   - operations to test for mutual exclusivity
 *
 * @returns {boolean} hasMutuallyExclusiveOperations - true if any of the operations are mutually exclusive
 */
const hasMutuallyExclusiveOperations = operations =>
  operations.some(operation =>
    operations.some(otherOperation => {
      if (operation !== otherOperation && !operation.whitelist.includes(otherOperation.name)) {
        printMessage(
          formatMessage(messages.invalidWhitelisted, {
            flag: operation.name,
            otherFlag: otherOperation.name,
          }),
        );
        return true;
      }
      return false;
    }),
  );

/**
 * Get operations from commander
 *
 * @returns {Operation[]} operations - operations parsed from commander
 */
const getOperationsFromCommander = () => {
  const operations = [];
  Object.keys(OperationTypes).forEach(operationType => {
    const operation = Operations.get(OperationTypes[operationType]);
    if (camelCase(operation.name) in commander) {
      operations.push(operation);
    }
  });
  return operations;
};

/**
 * Return the local cbf file if it exists
 *
 * @returns {string} localCbfFile - local cbf file or an empty string if none exists
 */
const getLocalCbfFileName = () => {
  if (fse.pathExistsSync(PATH_TO_LOCAL_JSON)) {
    return PATH_TO_LOCAL_JSON;
  }
  if (fse.pathExistsSync(PATH_TO_LOCAL_SIMPLE_JSON)) {
    return PATH_TO_LOCAL_SIMPLE_JSON;
  }
  if (fse.pathExistsSync(PATH_TO_LOCAL_YAML)) {
    return PATH_TO_LOCAL_YAML;
  }
  if (fse.pathExistsSync(PATH_TO_LOCAL_SIMPLE_YAML)) {
    return PATH_TO_LOCAL_SIMPLE_YAML;
  }
  return '';
};

/**
 * Load a local cbf file into memory and run it
 *
 * @param {string} fileName - name of the local cbf file to load and run
 */
const loadAndRunLocalCbfFile = fileName => {
  const script = isValidYamlFileName(fileName)
    ? Parser.getScriptFromYamlFile(fileName)
    : Parser.getScriptFromJsonFile({ fileName });
  printMessage(
    formatMessage(globalMessages.loadedScript, {
      scriptName: script.getName(),
      fileName: path.basename(fileName),
    }),
  );
  script.run();
};

/**
 * Run menu if there are any saved scripts and help otherwise
 */
const runMenuOrHelp = () => {
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    commander.help();
  } else {
    const runOperation = Operations.get(OperationTypes.RUN);
    const menu = new Menu({
      operationName: runOperation.name,
      operationRun: runOperation.run,
    });
    menu.run();
  }
};

/**
 * Run scripts from package.json
 */
const runScriptsFromPackageJson = () => {
  const script = Parser.getScriptFromJsonFile({
    fileName: PATH_TO_PACKAGE_JSON,
    scriptStartingKey: PACKAGE_JSON_SCRIPTS_PROPERTY,
    scriptType: ScriptTypes.SIMPLE,
  });
  printMessage(formatMessage(globalMessages.runningScriptsFromPackageJson));
  script.run();
};

/**
 * Handle when no operations are passed to commander by running from local cbf, package.json or running the menu or help
 */
const handleNoOperations = () => {
  const localCbfFileName = getLocalCbfFileName();
  if (!isEmptyString(localCbfFileName)) {
    loadAndRunLocalCbfFile(localCbfFileName);
  } else if (hasPackageJsonFile()) {
    const packageJson = loadJsonFile(PATH_TO_PACKAGE_JSON);
    if (PACKAGE_JSON_SCRIPTS_PROPERTY in packageJson) {
      runScriptsFromPackageJson();
    } else {
      runMenuOrHelp();
    }
  } else {
    runMenuOrHelp();
  }
};

/**
 * Handle arguments passed to commander
 */
const handleArguments = () => {
  const operations = getOperationsFromCommander();

  if (isEmpty(operations)) {
    handleNoOperations();
  } else {
    if (hasMutuallyExclusiveOperations(operations)) {
      safeExit();
    }

    const args = getArguments();

    // Validate the arguments for all operations except `documented` and `dry-run` which can be used in
    // conjunction with the `run` operation
    const nonDocumentedOrDryRunOperations = operations.filter(
      operation =>
        operation !== Operations.get(OperationTypes.DOCUMENTED) &&
        operation !== Operations.get(OperationTypes.DRY_RUN),
    );
    nonDocumentedOrDryRunOperations.forEach(operation => validateArgumentLength(operation, args));

    operations.forEach(operation => operation.run(args));

    if (isEmpty(nonDocumentedOrDryRunOperations)) {
      handleNoOperations();
    }
  }
};

/**
 * Format the arguments for commander
 *
 * @param {Argument[]} args        - arguments to be formatted
 *
 * @returns {string} formattedArgs - formatted arguments
 */
const formatArguments = args =>
  args.map(arg => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)).join(' ');

/**
 * Add formatted operations to commander
 */
const addOperationsToCommander = () => {
  Object.keys(OperationTypes).forEach(operationType => {
    const { flag, name, args, description } = Operations.get(OperationTypes[operationType]);
    let messageOptions = {
      flag,
      name,
    };
    if (!isEmpty(args)) {
      messageOptions = {
        ...messageOptions,
        args: formatArguments(args),
      };
    }
    const details = formatMessage(messages.operationDetails, messageOptions);
    commander.option(details, `${lowerCase(description)}`);
  });
};

/**
 * Initialise commander
 */
const init = () => {
  commander.version(version);
  commander.name(
    formatMessage(messages.name, {
      programName: PROGRAM_NAME,
    }),
  );
  commander.usage(formatMessage(messages.usage));
  addOperationsToCommander();
  commander.parse(process.argv);
  handleArguments();
};

module.exports = {
  init,
};
