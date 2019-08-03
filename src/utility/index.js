#!/usr/bin/env node

const os = require('os');
const path = require('path');

const fse = require('fs-extra');
const chalk = require('chalk');
const yaml = require('yamljs');
const { printMessage, formatMessage } = require('formatted-messages');
const isString = require('lodash/isString');
const isEmpty = require('lodash/isEmpty');
const isPlainObject = require('lodash/isPlainObject');

const {
  ScriptTypes,
  SCRIPTS_DIRECTORY_PATH,
  PATH_TO_PACKAGE_JSON,
  BACK_COMMAND,
  QUIT_COMMAND,
  CHOICE_DOCUMENTATION,
  KEY_SEPARATOR,
  SIMPLE_SCRIPT_OPTION_SEPARATOR,
  JSON_SPACES_FORMATTING,
} = require('../constants');
const { prompts } = require('../shims/inquirer');

const messages = require('./messages');

/**
 * Returns true if variable is an empty string
 *
 * @param {*} variable              - a variable to be tested to see if it is an empty string
 *
 * @returns {boolean} isEmptyString - true if the variable passed was an empty string and false otherwise
 */
const isEmptyString = variable => isString(variable) && isEmpty(variable);

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
 * @param {string} errorMessage - an error message to display to the user when throwing the error
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
 * @param {string} string                 - string to check for whitespace
 *
 * @returns {boolean} endsWithWhitespace - true if string contained white space; false otherwise
 */
const endsWithWhitespace = string => string !== string.trim();

/**
 * Replace the whitespace with the provided character and return string
 *
 * @param {string} string      - string to replace whitespace in
 * @param {string} delimiter   - string to replace whitespace with
 *
 * @returns {string} newString - string without whitespace
 */
const replaceWhitespace = (string, delimiter) => {
  const newString = `${string}`;
  return newString.replace(/\s+/g, delimiter);
};

/**
 * Return the first key in an object
 *
 * @param {object} object     - the object to get the first key from
 *
 * @returns {string} firstKey - the first key encountered
 */
const getFirstKey = object => {
  const keys = Object.keys(object);
  return keys[0] ? keys[0] : null;
};

/**
 * Return the name of the key (which is just the last word after the last period)
 *
 * @param {string} key    - key to use to return the name from
 *
 * @returns {string} name - the name of the key
 */
const getNameFromKey = key => key.split(KEY_SEPARATOR).pop();

/**
 * Return the key of the parent (the key is everything before the last occurrence of a period)
 *
 * @param {string} key         - key to use to return the parent key from
 *
 * @returns {string} parentKey - the key of the parent
 */
const getParentKey = key => key.substr(0, key.lastIndexOf(KEY_SEPARATOR));

/**
 * Gets the option keys from a complete key
 *
 * @param {string} key            - complete key to parse for option keys
 *
 * @returns {string[]} optionKeys - options keys parse from complete key
 */
const getOptionsKeysFromKey = key => {
  const optionKeys = [];
  let partialKey = key;
  const re = new RegExp(SIMPLE_SCRIPT_OPTION_SEPARATOR, 'g');
  let optionKey = partialKey
    .substring(0, partialKey.lastIndexOf(SIMPLE_SCRIPT_OPTION_SEPARATOR))
    .replace(re, KEY_SEPARATOR);
  while (!isEmptyString(optionKey)) {
    optionKeys.push(optionKey);
    partialKey = partialKey.substring(0, partialKey.lastIndexOf(SIMPLE_SCRIPT_OPTION_SEPARATOR));
    optionKey = partialKey
      .substring(0, partialKey.lastIndexOf(SIMPLE_SCRIPT_OPTION_SEPARATOR))
      .replace(re, KEY_SEPARATOR);
  }
  return optionKeys;
};

/**
 * Returns true if script is a simple script and false otherwise
 *
 * @param {string} fileName          - name of file to check if is simple
 *
 * @returns {boolean} isSimpleScript - true if script is simple and false otherwise
 */
const isSimpleScript = fileName => fileName.split('.').includes(ScriptTypes.SIMPLE);

/**
 * Returns true if script is a advanced script and false otherwise
 *
 * @param {string} fileName            - name of file to check if is simple
 *
 * @returns {boolean} isAdvancedScript - true if script is advanced and false otherwise
 */
const isAdvancedScript = fileName => fileName.split('.').includes(ScriptTypes.ADVANCED);

/**
 * Checks the file name for `.simple` to determine whether or not it is a simple or advanced script
 *
 * @param {string} fileName     - file name used to check if script is a simple or advanced script
 *
 * @returns {string} scriptType - the scripts type
 */
const getScriptType = fileName =>
  isSimpleScript(fileName) ? ScriptTypes.SIMPLE : ScriptTypes.ADVANCED;

/**
 * Check if a file path ends in a valid .yaml file name
 *
 * @param {string} fileName               - a yaml file name to validate
 *
 * @returns {boolean} isValidYamlFileName - true if file is a valid yaml file path
 */
const isValidYamlFileName = fileName => /.*\.yml/.test(fileName);

/**
 * Load a yaml file into the program
 *
 * @param {string} yamlFileName - name of yaml file to load into memory
 *
 * @returns {object} yamlFile   - yaml file to be loaded into memory
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
 * @param {string} yamlFileName     - name of the yaml file to save
 * @param {object} yamlFile         - yaml file to be saved
 *
 * @returns {Promise} yamlFileSaved - a promise that the yaml file has been saved
 */
const saveYamlFile = (yamlFileName, yamlFile) => {
  return new Promise((resolve, reject) => {
    try {
      const name = getFirstKey(yamlFile);
      const filePath = `${SCRIPTS_DIRECTORY_PATH}/${name}${
        isSimpleScript(yamlFileName) ? '.simple' : ''
      }.yml`;
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
 * @param {string} yamlFileName              - name of yaml file to be deleted
 *
 * @returns {Promise} yamlFileDeletedPromise - a promise that the yaml file has been deleted
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
 * Check if a file path ends in a valid json file name
 *
 * @param {string} fileName               - a json file name to validate
 *
 * @returns {boolean} isValidJsonFileName - true if file is a valid json file path
 */
const isValidJsonFileName = fileName => /.*\.json/.test(fileName);

/**
 * Save a json file
 *
 * @param {string} jsonFileName     - name of json file to be saved
 * @param {object} jsonFile         - json object to be saved to file
 *
 * @returns {Promise} jsonFileSaved - a promise that the json file has been saved
 */
const saveJsonFile = (jsonFileName, jsonFile) => {
  return new Promise((resolve, reject) => {
    try {
      const name = getFirstKey(jsonFile);
      const filePath = `${SCRIPTS_DIRECTORY_PATH}/${name}${
        isSimpleScript(jsonFileName) ? '.simple' : ''
      }.json`;
      fse.outputJsonSync(filePath, jsonFile, {
        spaces: JSON_SPACES_FORMATTING,
      });
      resolve();
    } catch (exception) {
      reject(exception);
    }
  });
};

/**
 * Delete a json file
 *
 * @param {string} jsonFileName       - name of the json file to be deleted
 *
 * @returns {Promise} jsonFileDeleted - a promise that the json file has been deleted
 */
const deleteJsonFile = jsonFileName => {
  return new Promise((resolve, reject) => {
    try {
      fse.removeSync(jsonFileName);
      resolve();
    } catch (exception) {
      reject(exception);
    }
  });
};

/**
 * Load a json file into the program
 *
 * @param {string} jsonFileName - name of json file to load into memory
 *
 * @returns {object} jsonFile   - json file
 */
const loadJsonFile = jsonFileName => {
  let jsonFile;
  try {
    jsonFile = fse.readJsonSync(jsonFileName);
  } catch (exception) {
    printMessage(
      formatMessage(messages.errorLoadingJsonFile, {
        jsonFileName,
        exception,
      }),
    );
    forceExit();
  }
  return jsonFile;
};

/**
 * Returns true if object only has string values
 *
 * @param {object} obj                                  - object to check properties are all strings
 *
 * @returns {boolean} valuesInKeyValuePairAreAllStrings - true if all properties are strings
 */
const valuesInKeyValuePairAreAllStrings = obj => Object.values(obj).every(value => isString(value));

/**
 * Returns true if the object is a valid variables object shape
 *
 * @param {object} variables  - variables to be validated
 *
 * @returns {boolean} isValid - true if variables is a valid shape; false otherwise
 */
const isValidVariablesShape = variables =>
  isPlainObject(variables) && valuesInKeyValuePairAreAllStrings(variables);

/**
 * Return choice with command directive stripped
 *
 * @param {string} documentedChoice     - documented choice to be undocumented
 *
 * @returns {string} undocumentedChoice - choice with documented command directive stripped
 */
const getUndocumentedChoice = documentedChoice => {
  let undocumentedChoice = documentedChoice;
  CHOICE_DOCUMENTATION.forEach(choiceDocumentation => {
    if (documentedChoice.indexOf(choiceDocumentation) !== -1) {
      [undocumentedChoice] = documentedChoice.split(` ${choiceDocumentation}`);
    }
  });
  return undocumentedChoice;
};

/**
 * Returns undocumented choices
 *
 * @param {string[]} documentedChoices     - a list of documented choices to become undocumented
 * @returns {string[]} undocumentedChoices - a list of undocumented choices
 */
const getUndocumentedChoices = documentedChoices =>
  documentedChoices.map(documentedChoice => getUndocumentedChoice(documentedChoice));

/**
 * Return choices with command directives appended to commands
 *
 * @param {object} param              - object parameter
 * @param {Script} param.script       - script to lookup options and commands
 * @param {string} param.optionKey    - key of the option having it's choices documented
 * @param {string} param.choice       - choice to be documented
 * @param {boolean} param.documented  - is in documented mode
 * @param {number} param.index        - index of choice to be documented;
 *
 * @returns {string} documentedChoice - choice with command directives appended to commands
 */
const getDocumentedChoice = ({ script, optionKey, choice, documented, index }) => {
  if (!script) {
    const scriptDocumentationSymbols = ['♚', '♛', '♜', '♝', '♞', '♟'];
    // No script has been passed must be in menu, decorate choice as a script
    return `${choice} ${chalk.magenta.bold(
      scriptDocumentationSymbols[index % scriptDocumentationSymbols.length],
    )}`;
  }
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
 * @param {object} param                 - object parameter
 * @param {Script} param.script          - script to lookup options and commands
 * @param {string} param.optionKey       - key of the option having it's choices documented
 * @param {string[]} param.choices       - choices to be documented
 * @param {boolean} param.documented     - is in documented mode
 *
 * @returns {string[]} documentedChoices - choices with command directives appended to commands
 */
const getDocumentedChoices = ({
  script = undefined,
  optionKey = '',
  choices = [],
  documented = false,
}) =>
  choices.map((choice, index) =>
    getDocumentedChoice({ script, optionKey, choice, documented, index }),
  );

/**
 * Returns true if params length is valid and false otherwise
 *
 * @param {object} param        - object parameter
 * @param {number} param.actual - actual param length
 * @param {number} param.exact  - exact param length expected
 * @param {number} param.min    - minimum param length expected
 * @param {number} param.max    - maximum param length expected
 *
 * @returns {boolean} validLength - true if param length is valid; false otherwise
 */
const isValidParametersLength = ({
  actual,
  min = undefined,
  max = undefined,
  exact = undefined,
}) => {
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
 * Returns true if a package.json file exists
 *
 * @returns {boolean} hasPackageJsonFile - true if a package.json file exists
 */
const hasPackageJsonFile = () => fse.pathExistsSync(PATH_TO_PACKAGE_JSON);

/**
 * If path is a relative path; resolve it and return absolute path
 *
 * @param {string} relativePath   - a relative path to be converted to an absolute path
 *
 * @returns {string} absolutePath - an absolute path converted from the relative path
 */
const absolutePath = relativePath => {
  if (relativePath[0] === '~') {
    return path.resolve(path.join(os.homedir(), relativePath.slice(1)));
  }
  return relativePath;
};

module.exports = {
  isEmptyString,
  uncaughtExceptionListener,
  unhandledRejectionListener,
  absolutePath,
  safeExit,
  forceExit,
  isValidParametersLength,
  getUndocumentedChoices,
  getUndocumentedChoice,
  getDocumentedChoices,
  endsWithWhitespace,
  replaceWhitespace,
  isValidYamlFileName,
  saveYamlFile,
  loadYamlFile,
  deleteYamlFile,
  isValidJsonFileName,
  saveJsonFile,
  loadJsonFile,
  deleteJsonFile,
  getFirstKey,
  getNameFromKey,
  getParentKey,
  getOptionsKeysFromKey,
  throwError,
  isValidVariablesShape,
  isSimpleScript,
  isAdvancedScript,
  getScriptType,
  hasPackageJsonFile,
};
