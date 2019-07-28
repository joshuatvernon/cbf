#!/usr/bin/env node

const isString = require('lodash/isString');
const { printMessage, formatMessage } = require('formatted-messages');

const globalMessages = require('../messages');
const { ScriptKeys, BACK_COMMAND, QUIT_COMMAND } = require('../constants');
const { Script, Option, Command, Directory } = require('../config/script');
const {
  getFirstKey,
  getNameFromKey,
  isValidYamlFileName,
  loadYamlFile,
  isValidVariablesShape,
  forceExit,
} = require('../utility');

const messages = require('./messages');

const addDirectoryToScript = ({ script, yamlFile, key }) => {
  const directory = new Directory(yamlFile.directory);
  script.updateDirectory({
    directoryKey: key,
    directory,
  });
};

const addCommandToScript = ({ script, yamlFile, yamlFileName, key }) => {
  const directives = [];
  if (isString(yamlFile.command)) {
    directives.push(yamlFile.command);
  } else {
    let line = 1;
    while (line in yamlFile.command) {
      directives.push(yamlFile.command[line]);
      line += 1;
    }
  }

  const command = new Command({
    directives,
  });

  if (ScriptKeys.MESSAGE in yamlFile) {
    command.updateMessage(yamlFile.message);
  }

  if (ScriptKeys.VARIABLES in yamlFile) {
    if (isValidVariablesShape(yamlFile.variables)) {
      command.updateVariables(yamlFile.variables);
    } else {
      const error = formatMessage(messages.incorrectlyFormattedVariables);
      printMessage(
        formatMessage(messages.errorParsingYamlFile, {
          yamlFileName,
          error,
        }),
      );
      forceExit();
    }
  }

  script.updateCommand({
    commandKey: key,
    command,
  });
};

/**
 * Add an option
 * @param script
 * @param yamlFile
 * @param key
 */
const addOptionToScript = ({ script, yamlFile, yamlFileName, key }) => {
  const optionsKeys = Object.keys(yamlFile.options);
  const choices = [];

  optionsKeys.forEach(optionsKey => {
    // eslint-disable-next-line no-use-before-define
    parseScriptRecurse({
      script,
      yamlFile: yamlFile.options[optionsKey],
      yamlFileName,
      key: `${key}.${optionsKey}`,
    });
    choices.push(optionsKey);
  });

  if (key !== script.getName()) {
    // Add back command as second last option
    choices.push(BACK_COMMAND);
  }
  // Add quit command as last option
  choices.push(QUIT_COMMAND);

  const name = getNameFromKey(key);
  const option = new Option({
    name,
    choices,
  });

  if (ScriptKeys.MESSAGE in yamlFile) {
    option.updateMessage(yamlFile.message);
  }

  script.updateOption({
    optionKey: key,
    option,
  });
};

/**
 * Helper to recursively parse script
 *
 * @param Script script       - name of the new script
 * @param Object yamlFile     - the script converted from the yaml file
 * @param String yamlFileName - name of the yaml file
 * @param string key          - current yamlFile key to be parsed
 */
const parseScriptRecurse = ({ script, yamlFile, yamlFileName, key }) => {
  if (ScriptKeys.DIRECTORY in yamlFile) {
    addDirectoryToScript({ script, yamlFile, key });
  }
  if (ScriptKeys.COMMAND in yamlFile) {
    addCommandToScript({ script, yamlFile, yamlFileName, key });
  } else if (ScriptKeys.OPTION in yamlFile) {
    addOptionToScript({ script, yamlFile, yamlFileName, key });
  }
};

class Parser {
  /**
   * Parse a yaml file into commands, options, messages and directories
   *
   * @param Object yamlFileName - the name of the yaml file to be loaded and parsed
   */
  static getScript(yamlFileName) {
    if (!isValidYamlFileName(yamlFileName)) {
      printMessage(formatMessage(globalMessages.invalidYamlFile, { yamlFileName }));
      forceExit();
    }
    const yamlFile = loadYamlFile(yamlFileName);
    const scriptName = getFirstKey(yamlFile);
    const script = new Script({
      name: scriptName,
    });
    parseScriptRecurse({
      script,
      yamlFile: yamlFile[script.getName()],
      yamlFileName,
      key: scriptName,
    });
    return script;
  }
}

module.exports = Parser;
