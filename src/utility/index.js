#!/usr/bin/env node

const os = require('os');
const path = require('path');

const fse = require('fs-extra');
const chalk = require('chalk');
const yaml = require('yamljs');
const isString = require('lodash/isString');
const isPlainObject = require('lodash/isPlainObject');
const { printMessage, formatMessage } = require('formatted-messages');

const { SCRIPTS_DIRECTORY_PATH, BACK_COMMAND, QUIT_COMMAND } = require('../constants');
const { prompts } = require('../shims/inquirer');

const messages = require('./messages');

/**
 * Listens for uncaught exceptions and prints the error to the console and exits
 */
const uncaughtExceptionListener = () => {
  process.on('uncaughtException', error => {
    // eslint-disable-next-line no-console
    console.error('Uncaught Exception thrown\n', error);
    process.exit(1);
  });
};

/**
 * Listens for unhandled rejections and prints the error to the console and exits
 */
const unhandledRejectionListener = () => {
  process.on('unhandledRejection', (reason, p) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection at promise\n', p, reason);
    process.exit(1);
  });
};

/**
 * Cleans up and then exits program
 */
const safeExit = () => {
  prompts.complete();
};

/**
 * Force exits program
 */
const forceExit = () => {
  prompts.complete();
  process.exit();
};

/**
 * Throw an error with an optional error message
 *
 * @param string errorMessage - an error message to display to the user when throwing the error
 */
const throwError = (errorMessage = '') => {
  if (errorMessage) {
    throw new Error(errorMessage);
  }
  throw new Error('Unknown error');
};

/**
 * Return true if string contains any whitespace and false otherwise
 *
 * @param string string                 - string to check for whitespace
 *
 * @returns  boolean endsWithWhitespace - true if string contained white space; false otherwise
 */
const endsWithWhitespace = string => string !== string.trim();

/**
 * Replace the whitespace with the provided character and return string
 *
 * @param string string       - string to replace whitespace in
 * @param string delimiter    - string to replace whitespace with
 *
 * @returns string newString  - string without whitespace
 */
const replaceWhitespace = (string, delimiter) => {
  const newString = `${string}`;
  return newString.replace(/\s+/g, delimiter);
};

/**
 * Print json for debugging
 *
 * @param Object obj object to be printed as coloured JSON
 * @param string colour colour to print the JSON
 */
const printJson = (obj, colour) => {
  // eslint-disable-next-line no-console
  console.log(chalk[colour].bold(JSON.stringify(obj, null, 4)));
};

/**
 * Return the first key in an object
 *
 * @param Object object     - the object to get the first key from
 *
 * @returns string firstKey - the first key encountered
 */
const getFirstKey = object => {
  const keys = Object.keys(object);
  return keys[0] ? keys[0] : null;
};

/**
 * Return the name of the key (which is just the last word after the last period)
 *
 * @param string key    - key to use to return the name from
 *
 * @returns string name - the name of the key
 */
const getNameFromKey = key => key.split('.').pop();

/**
 * Return the key of the parent (the key is everything before the last occurrence of a period)
 *
 * @param string key         - key to use to return the parent key from
 *
 * @returns string parentKey - the key of the parent
 */
const getParentKey = key => key.substr(0, key.lastIndexOf('.'));

/**
 * Check if a file path ends in a valid .yaml file name
 *
 * @param string fileName   - a yaml file name to validate
 *
 * @returns boolean isValid - true if file is a valid yaml file path
 */
const isValidYamlFileName = fileName => /.*\.yml/.test(fileName);

/**
 * Load a yaml file into the program
 *
 * @param {string} yamlFileName - yaml file to load
 *
 * @returns {Object} yamlFile   - yaml file
 */
const loadYamlFile = yamlFileName => {
  let yamlFile;
  try {
    yamlFile = yaml.load(yamlFileName);
  } catch (exception) {
    printMessage(
      formatMessage(messages.errorLoadingYamlFile, {
        yamlFileName,
        exception,
      }),
    );
    forceExit();
  }
  return yamlFile;
};

/**
 * Save a yaml file
 *
 * @param yamlFileName              - name of the yaml file to save
 * @param yamlFile                  - yaml file to be saved
 *
 * @returns {Promise} yamlFileSaved - a promise that the yaml file has been saved
 */
const saveYamlFile = (yamlFileName, yamlFile) => {
  return new Promise((resolve, reject) => {
    try {
      const name = getFirstKey(yamlFile);
      const filePath = `${SCRIPTS_DIRECTORY_PATH}/${name}.yml`;
      const yamlString = yaml.stringify(yamlFile, 10, 2);
      fse.outputFileSync(filePath, yamlString);
      resolve();
    } catch (exception) {
      reject(exception);
    }
  });
};

/**
 * Delete a yaml file
 *
 * @param yamlFileName - name of yaml file to be deleted
 *
 * @returns {Promise}  - a promise that the yaml file has been deleted
 */
const deleteYamlFile = yamlFileName => {
  return new Promise((resolve, reject) => {
    try {
      fse.removeSync(yamlFileName);
      resolve();
    } catch (exception) {
      reject(exception);
    }
  });
};

/**
 * Returns true if object only has string values
 *
 * @param {Object} obj - object to check properties are all strings
 * @returns {boolean}  - true if all properties are strings
 */
const valuesInKeyValuePairAreAllStrings = obj => Object.values(obj).every(value => isString(value));

/**
 * Returns true if the object is a valid variables object shape
 *
 * @param {Object} variables  - variables to be validated
 *
 * @returns {boolean} isValid - true if variables is a valid shape; false otherwise
 */
const isValidVariablesShape = variables =>
  isPlainObject(variables) && valuesInKeyValuePairAreAllStrings(variables);

/**
 * Return choice with command directive stripped
 *
 * @param string documentedChoice     - documented choice to be undocumented
 *
 * @returns string undocumentedChoice - choice with documented command directive stripped
 */
const getUndocumentedChoice = documentedChoice => {
  if (documentedChoice.indexOf(chalk.blue.bold('→')) !== -1) {
    return documentedChoice.split(` ${chalk.blue.bold('→')}`)[0];
  }
  if (documentedChoice.indexOf(chalk.blue.bold('↓')) !== -1) {
    return documentedChoice.split(` ${chalk.blue.bold('↓')}`)[0];
  }
  return documentedChoice;
};

/**
 * Returns undocumented choices
 *
 * @param string[] documentedChoices     - a list of documented choices to become undocumented
 * @returns string[] undocumentedChoices - a list of undocumented choices
 */
const getUndocumentedChoices = documentedChoices =>
  documentedChoices.map(documentedChoice => getUndocumentedChoice(documentedChoice));

/**
 * Return choices with command directives appended to commands
 *
 * @param Script script             - script to lookup options and commands
 * @param string optionKey          - key of the option having it's choices documented
 * @param string choice             - choice to be documented
 * @param boolean documented        - is in documented mode
 *
 * @returns string documentedChoice - choice with command directives appended to commands
 */
const getDocumentedChoice = (script, optionKey, choice, documented) => {
  const commandKey = `${optionKey}.${choice}`;
  const command = script.getCommand(commandKey);
  if (documented && command) {
    const directives = command.getDirectives();
    if (directives.length === 1) {
      return `${choice} ${chalk.blue.bold('→')} ${chalk.green.bold(directives[0])}`;
    }
    return `${choice} ${chalk.blue.bold('→')} ${chalk.green.bold(directives[0])} . . .`;
  }
  if (choice.indexOf(BACK_COMMAND) !== -1 || choice.indexOf(QUIT_COMMAND) !== -1) {
    return choice;
  }
  if (!command) {
    return `${choice} ${chalk.blue.bold('↓')}`;
  }
  return choice;
};

/**
 * Return choices with command directives appended to commands
 *
 * @param Script script                - script to lookup options and commands
 * @param string optionKey             - key of the option having it's choices documented
 * @param string[] choices             - choices to be documented
 * @param boolean documented           - is in documented mode
 *
 * @returns string[] documentedChoices - choices with command directives appended to commands
 */
const getDocumentedChoices = (script, optionKey, choices, documented) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  choices.map(choice => getDocumentedChoice(script, optionKey, choice, documented));

/**
 * Returns true if params length is valid and false otherwise
 *
 * @param Number actual         - actual param length
 * @param Number exact          - exact param length expected
 * @param Number min            - minimum param length expected
 * @param Number max            - maximum param length expected
 *
 * @returns boolean validLength - true if param length is valid; false otherwise
 */
const isValidParametersLength = ({ actual, min, max, exact }) => {
  let validLength = true;
  if (typeof exact !== 'undefined' && exact !== actual) {
    validLength = false;
  }
  if (typeof min !== 'undefined' && min > actual) {
    validLength = false;
  }
  if (typeof max !== 'undefined' && max < actual) {
    validLength = false;
  }
  return validLength;
};

/**
 * If path is a relative path; resolve it and return absolute path
 *
 * @param string relativePath    - a relative path to be converted to an absolute path
 *
 * @returns string absolutePath  - an absolute path converted from the relative path
 */
const absolutePath = relativePath => {
  if (relativePath[0] === '~') {
    return path.resolve(path.join(os.homedir(), relativePath.slice(1)));
  }
  return relativePath;
};

module.exports = {
  uncaughtExceptionListener,
  unhandledRejectionListener,
  absolutePath,
  safeExit,
  forceExit,
  isValidParametersLength,
  getUndocumentedChoices,
  getUndocumentedChoice,
  getDocumentedChoices,
  printJson,
  endsWithWhitespace,
  replaceWhitespace,
  isValidYamlFileName,
  saveYamlFile,
  loadYamlFile,
  deleteYamlFile,
  getFirstKey,
  getNameFromKey,
  getParentKey,
  throwError,
  isValidVariablesShape,
};
