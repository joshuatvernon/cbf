#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const globalMessages = require('../../../messages');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');
const { GlobalConfig } = require('../../../config');
const {
  getFirstKey,
  isValidYamlFileName,
  loadYamlFile,
  saveYamlFile,
  safeExit,
} = require('../../../utility');
const Operation = require('../operation');

const messages = require('./messages');

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

const run = args => {
  const yamlFileName = args[0];

  if (isValidYamlFileName(yamlFileName)) {
    const yamlFile = loadYamlFile(yamlFileName);
    const scriptName = getFirstKey(yamlFile);

    GlobalConfig.load();
    if (GlobalConfig.hasScript(scriptName)) {
      // Check if user wants to update the script
      shouldUpdateScript(scriptName).then(answer => {
        if (answer) {
          // Update script
          saveYamlFile(yamlFileName, yamlFile)
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
      saveYamlFile(yamlFileName, yamlFile)
        .then(() => {
          GlobalConfig.addScriptName(scriptName);
          GlobalConfig.save();
          printMessage(formatMessage(messages.savedScript, { scriptName }));
        })
        .catch(error => {
          printMessage(formatMessage(messages.errorSavingScript, { scriptName, error }));
        });
    }
  } else if (yamlFileName === true) {
    printMessage(formatMessage(messages.noYamlFile));
    safeExit();
  } else {
    printMessage(formatMessage(globalMessages.invalidYamlFile, { yamlFileName }));
    safeExit();
  }
  safeExit();
};

const operation = {
  name: 'save',
  flag: 's',
  description: 'process and save a script',
  args: [
    {
      name: 'path to yaml file',
      required: true,
    },
  ],
  whitelist: [],
  run,
};

module.exports = new Operation(operation);
