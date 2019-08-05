#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const globalMessages = require('../../../messages');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');
const { GlobalConfig } = require('../../../config');
const {
  getFirstKey,
  isValidYamlFileName,
  isValidJsonFileName,
  loadYamlFile,
  saveYamlFile,
  deleteYamlFile,
  loadJsonFile,
  saveJsonFile,
  deleteJsonFile,
  safeExit,
} = require('../../../utility');
const { Operation, Argument } = require('../operation');
const { SCRIPTS_DIRECTORY_PATH } = require('../../../constants');

const messages = require('./messages');

/**
 * Prompt the user whether a script should be updated
 *
 * @param {string} scriptName            - name of script to be updated
 * @returns {Promise} shouldUpdateScript - promise of an answer to whether the script should be updated or not
 */
const shouldUpdateScript = scriptName => {
  return new Promise(resolve => {
    const subscriber = inquirerPrompts.subscribe(
      ({ answer }) => {
        subscriber.unsubscribe();
        resolve(answer);
      },
      noop,
      noop,
    );

    prompts.next({
      type: InquirerPromptTypes.CONFIRM,
      name: 'shouldUpdateScript',
      message: formatMessage(messages.shouldUpdateScript, { scriptName }),
      default: false,
    });
  });
};

/**
 * Save script to config
 *
 * @param {string} scriptName - name of script to save to config
 */
const saveScript = scriptName => {
  GlobalConfig.addScriptName(scriptName);
  GlobalConfig.save();
  printMessage(formatMessage(messages.savedScript, { scriptName }));
};

/**
 * Delete script file
 *
 * @param {string} scriptName - name of script to delete
 */
const deleteScript = scriptName => {
  deleteYamlFile(`${SCRIPTS_DIRECTORY_PATH}/${scriptName}.simple.yml`);
  deleteYamlFile(`${SCRIPTS_DIRECTORY_PATH}/${scriptName}.yml`);
  deleteJsonFile(`${SCRIPTS_DIRECTORY_PATH}/${scriptName}.simple.json`);
  deleteJsonFile(`${SCRIPTS_DIRECTORY_PATH}/${scriptName}.json`);
};

/**
 * Run the save operation
 *
 * @param {string[]} args - arguments passed to the save operation
 */
const run = args => {
  const fileName = args[0];

  if (isValidYamlFileName(fileName)) {
    const yamlFile = loadYamlFile(fileName);
    const scriptName = getFirstKey(yamlFile);

    GlobalConfig.load();
    if (GlobalConfig.hasScript(scriptName)) {
      // Check if user wants to update the script
      shouldUpdateScript(scriptName).then(answer => {
        if (answer) {
          // Delete any previously saved scripts with the same name
          deleteScript(scriptName);
          // Update script
          saveYamlFile(fileName, yamlFile)
            .then(printMessage(formatMessage(messages.updatedScript, { scriptName })))
            .catch(error => {
              printMessage(formatMessage(messages.errorUpdatingScript, { scriptName, error }));
            });
        } else {
          // DO NOT update script
          printMessage(formatMessage(messages.didNotUpdateScript, { scriptName }));
          safeExit();
        }
      });
    } else {
      // Save script
      saveYamlFile(fileName, yamlFile)
        .then(() => saveScript(scriptName))
        .catch(error => {
          printMessage(formatMessage(messages.errorSavingScript, { scriptName, error }));
        });
    }
  } else if (isValidJsonFileName(fileName)) {
    const jsonFile = loadJsonFile(fileName);
    const scriptName = getFirstKey(jsonFile);

    GlobalConfig.load();
    if (GlobalConfig.hasScript(scriptName)) {
      shouldUpdateScript(scriptName).then(answer => {
        if (answer) {
          // Delete any previously saved scripts with the same name
          deleteScript(scriptName);
          // Update script
          saveJsonFile(fileName, jsonFile)
            .then(printMessage(formatMessage(messages.updatedScript, { scriptName })))
            .catch(error => {
              printMessage(
                formatMessage(messages.errorUpdatingScript, {
                  scriptName,
                  error,
                }),
              );
            });
        } else {
          // Do NOT update script
          printMessage(formatMessage(messages.didNotUpdateScript, { scriptName }));
          safeExit();
        }
      });
    } else {
      // Save script
      saveJsonFile(fileName, jsonFile)
        .then(() => saveScript(scriptName))
        .catch(error => {
          printMessage(formatMessage(messages.errorSavingScript, { scriptName, error }));
        });
    }
  } else if (fileName === true) {
    // No path to yaml or json file passed
    printMessage(formatMessage(messages.noScriptFile));
    safeExit();
  } else {
    printMessage(formatMessage(globalMessages.invalidScriptFile, { fileName }));
    safeExit();
  }
  safeExit();
};

const pathToScriptFile = new Argument({ name: 'path to script file', required: true });
const operation = {
  name: 'save',
  flag: 's',
  description: 'process and save a script from a yaml or json file',
  args: [pathToScriptFile],
  whitelist: [],
  run,
};

module.exports = new Operation(operation);
