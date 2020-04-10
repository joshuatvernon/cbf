#!/usr/bin/env node

const isString = require('lodash/isString');
const { printMessage, formatMessage } = require('formatted-messages');

const globalMessages = require('../messages');
const { CurrentOperatingModes } = require('../operating-modes');
const {
  ScriptKeys,
  ScriptTypes,
  OperatingModes,
  BACK_COMMAND,
  QUIT_COMMAND,
  KEY_SEPARATOR,
  SIMPLE_SCRIPT_OPTION_SEPARATOR,
} = require('../constants');
const { Script, Option, Command, Directory } = require('../config/script');
const {
  isEmptyString,
  getFirstKey,
  getNameFromKey,
  isValidYamlFileName,
  isValidJsonFileName,
  loadYamlFile,
  loadJsonFile,
  isValidVariablesShape,
  getUndocumentedChoices,
  getOptionsKeysFromKey,
  getNameFromSimpleScriptKey,
  isAnOptionAndCommand,
  getScriptType,
  forceExit,
} = require('../utility');

const messages = require('./messages');

/**
 * Add a directory to the script
 *
 * @param {object} param        - object parameter
 * @param {Script} param.script - the script to add the directory to
 * @param {object} param.file   - the file to get the directory from to add to the script
 * @param {string} param.key    - the current key of file to get the directory from to add to the script
 */
const addDirectoryToAdvancedScript = ({ script, file, key }) => {
  const directory = new Directory(file.directory);
  script.updateDirectory({
    directoryKey: key,
    directory,
  });
};

/**
 * Add a command to the script
 *
 * @param {object} param          - object parameter
 * @param {Script} param.script   - the script to add a command to
 * @param {object} param.file     - the file that contains the command to be added to the script
 * @param {string} param.fileName - the name of the file with the command to add into the script
 * @param {string} param.key      - the current key of the file to get the command from
 */
const addCommandToAdvancedScript = ({ script, file, fileName, key }) => {
  const directives = [];
  if (isString(file.command)) {
    directives.push(file.command);
  } else {
    let line = 1;
    while (line in file.command) {
      directives.push(file.command[line]);
      line += 1;
    }
  }

  const command = new Command({
    directives,
  });

  if (ScriptKeys.MESSAGE in file) {
    command.updateMessage(file.message);
  }

  if (ScriptKeys.VARIABLES in file) {
    if (isValidVariablesShape(file.variables)) {
      command.updateVariables(file.variables);
    } else {
      const error = formatMessage(messages.incorrectlyFormattedVariables);
      const message = isValidYamlFileName(fileName)
        ? formatMessage(messages.errorParsingYamlFile, {
            yamlFileName: fileName,
            error,
          })
        : formatMessage(messages.errorParsingJsonFile, {
            jsonFileName: fileName,
            error,
          });
      printMessage(message);
      forceExit();
    }
  }

  script.updateCommand({
    commandKey: key,
    command,
  });
};

/**
 * Throws an error and stops parsing an advanced script if a script key is used as an option
 *
 * @param {object} param            - object parameter
 * @param {string} param.fileName   - name of file being parsed
 * @param {string} param.optionsKey - option key to check
 * @param {string} param.parentKey  - parent key to use in error message if invalid
 */
const checkIfAdvancedOptionKeyIsValid = ({ fileName, optionsKey, parentKey }) => {
  Object.values(ScriptKeys).forEach(scriptKey => {
    if (optionsKey === scriptKey) {
      printMessage(
        formatMessage(messages.scriptKeyUsedAsOption, {
          fileName,
          parentKey,
          scriptKey,
        }),
      );
      forceExit();
    }
  });
};

/**
 * Add an option to the script
 *
 * @param {object} param          - object parameter
 * @param {Script} param.script   - the script to add an option to
 * @param {object} param.file     - the file that contains the options to be added to the script
 * @param {string} param.fileName - the name of the file with the options to add into the script
 * @param {string} param.key      - the current key of the file to get the options from
 */
const addOptionToAdvancedScript = ({ script, file, fileName, key }) => {
  const optionsKeys = Object.keys(file.options);
  const choices = [];

  optionsKeys.forEach(optionsKey => {
    checkIfAdvancedOptionKeyIsValid({ fileName, optionsKey, parentKey: key });
    // eslint-disable-next-line no-use-before-define
    parseAdvancedScript({
      script,
      file: file.options[optionsKey],
      fileName,
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

  if (ScriptKeys.MESSAGE in file) {
    option.updateMessage(file.message);
  }

  script.updateOption({
    optionKey: key,
    option,
  });
};

/**
 * Recursively parse an advanced script
 *
 * @param {object} param          - object parameter
 * @param {Script} param.script   - the advanced script parsed from the file
 * @param {object} param.file     - the file to parse the advanced script from
 * @param {string} param.fileName - name of the file
 * @param {string} param.key      - current file key to be parsed
 */
const parseAdvancedScript = ({ script, file, fileName, key }) => {
  if (ScriptKeys.DIRECTORY in file) {
    addDirectoryToAdvancedScript({ script, file, key });
  }
  if (ScriptKeys.COMMAND in file) {
    addCommandToAdvancedScript({ script, file, fileName, key });
  } else if (ScriptKeys.OPTIONS in file) {
    addOptionToAdvancedScript({ script, file, fileName, key });
  }
};

/**
 * Returns choices from keys
 *
 * @param {object} param             - object parameter
 * @param {string[]} param.keys      - keys to parse choices from
 * @param {string} param.startingKey - part of key to ignore
 *
 * @returns {string[]} choices       - choices parsed from keys
 */
const getChoicesFromSimpleScriptKeys = ({ keys, startingKey = '' }) => {
  return (
    keys
      // Filter keys that don't start with the starting key
      .filter(key => {
        if (key.indexOf(`${startingKey.replace(/\./g, SIMPLE_SCRIPT_OPTION_SEPARATOR)}:`) === 0) {
          return true;
        }
        if (key === startingKey.replace(/\./g, SIMPLE_SCRIPT_OPTION_SEPARATOR)) {
          return true;
        }
        return startingKey === '';
      })
      // Remove starting key from keys
      .map(key => {
        if (!isEmptyString(startingKey)) {
          if (key === startingKey.replace(/\./g, SIMPLE_SCRIPT_OPTION_SEPARATOR)) {
            return getNameFromSimpleScriptKey(key);
          }
          const re = new RegExp(`${startingKey.replace(/\./g, SIMPLE_SCRIPT_OPTION_SEPARATOR)}:`);
          return key.replace(re, '');
        }
        return key;
      })
      // Get just the choices from keys e.g. 'abc:def' => 'abc'
      .map(key => {
        if (key.includes(SIMPLE_SCRIPT_OPTION_SEPARATOR)) {
          return key.substring(0, key.indexOf(SIMPLE_SCRIPT_OPTION_SEPARATOR));
        }
        return key;
      })
      // Remove empty strings
      .filter(key => !isEmptyString(key))
      // Remove duplicates
      .filter((key, index, arr) => arr.indexOf(key) === index)
  );
};

/**
 * Add or update option in simple script
 *
 * @param {object} param           - object parameter
 * @param {Script} param.script    - script to add or update with option
 * @param {string} param.optionKey - key of the option to either add or update
 * @param {string[]} param.choices - choices to add to update option with
 */
const addOrUpdateOptionToSimpleScript = ({ script, optionKey, choices }) => {
  const option = new Option({ name: optionKey, choices });
  if (!script.hasOption(optionKey)) {
    script.addOption({ optionKey, option });
  } else {
    const originalChoices = getUndocumentedChoices(script.getOption(optionKey).getChoices());
    const unionChoices = [...new Set([...originalChoices, ...option.getChoices()])];
    option.updateChoices(unionChoices);
    script.updateOption({ optionKey, option });
  }
};

/**
 * Add a command to simple script
 *
 * @param {object} param        - object parameter
 * @param {Script} param.script - simple script to a command to
 * @param {object} param.file   - file to parse the command from
 * @param {string} param.key    - key to use to parse the command from the file
 * @param {string[]} param.keys - keys used to check if the command is also an option
 */
const addCommandToSimpleScript = ({ script, file, key, keys, npmAlias }) => {
  const re = new RegExp(SIMPLE_SCRIPT_OPTION_SEPARATOR, 'g');
  let commandKey = `${script.getName()}.${key.replace(re, KEY_SEPARATOR)}`;
  if (isAnOptionAndCommand({ key, keys })) {
    // Command is also an option, store the command one level deeper so it will be in the correct options choices list
    commandKey += `${KEY_SEPARATOR}${getNameFromSimpleScriptKey(key)}`;
  }
  const directive = file[key];
  const directives = [directive];
  const hiddenDirectives = [];
  if (CurrentOperatingModes.includes(OperatingModes.RUNNING_PACKAGE_JSON)) {
    const hiddenDirective = `${npmAlias} run ${key}`;
    hiddenDirectives.push(hiddenDirective);
  }
  const command = new Command({ directives, hiddenDirectives });
  script.addCommand({ commandKey, command });
};

/**
 * Parse a simple script
 *
 * @param {object} param                 - object parameter
 * @param {Script} param.script          - the simple script parsed from the file
 * @param {object|string} param.file     - the file to parse the simple script from
 * @param {object|string} param.npmAlias - the NPM alias to use in the hidden directive to call the command with
 *
 * @returns {Script} script              - the simple script parsed from the file
 */
const parseSimpleScript = ({ script, file, npmAlias }) => {
  if (isString(file)) {
    const command = new Command({ directives: [file] });
    script.addCommand({ commandKey: script.getName(), command });
    return script;
  }

  const keys = Object.keys(file);

  // Add top level option to script
  addOrUpdateOptionToSimpleScript({
    script,
    optionKey: script.getName(),
    choices: [...getChoicesFromSimpleScriptKeys({ keys }), QUIT_COMMAND],
  });

  keys.forEach(key => {
    // Add command
    addCommandToSimpleScript({
      script,
      file,
      key,
      keys,
      npmAlias,
    });

    // Add options
    const optionKeys = getOptionsKeysFromKey(key);
    optionKeys.forEach(optionKey => {
      // Add option
      const choices = [
        ...getChoicesFromSimpleScriptKeys({ keys, startingKey: optionKey }),
        BACK_COMMAND,
        QUIT_COMMAND,
      ];
      addOrUpdateOptionToSimpleScript({
        script,
        choices,
        optionKey: `${script.getName()}${KEY_SEPARATOR}${optionKey}`,
      });
    });
  });
  return script;
};

class Parser {
  /**
   * Parse a yaml file into commands, options, messages, variables and directories
   *
   * @param {string} fileName - the name of the yaml file to be loaded and parsed
   *
   * @returns {Script} script - the script loaded into memory
   */
  static getScriptFromYamlFile(fileName) {
    if (!isValidYamlFileName(fileName)) {
      printMessage(formatMessage(globalMessages.invalidYamlFile, { fileName }));
      forceExit();
    }
    const yamlFile = loadYamlFile(fileName);
    const name = getFirstKey(yamlFile);
    const script = new Script({
      name,
    });
    const scriptType = getScriptType(fileName);
    if (scriptType === ScriptTypes.SIMPLE) {
      parseSimpleScript({
        script,
        file: yamlFile[script.getName()],
      });
    } else {
      parseAdvancedScript({
        script,
        fileName,
        file: yamlFile[script.getName()],
        key: name,
      });
    }
    return script;
  }

  /**
   * Parse a json file int commands, options, messages, variables and directories
   *
   * @param {object} param                   - object parameter
   * @param {string} param.fileName          - the name of the json file to be loaded and parsed
   * @param {string} param.scriptStartingKey - the key to start at e.g. 'scripts' in a NPM package.json file
   * @param {string} param.scriptType        - the type of script to parse (simple or advanced)
   * @param {string} param.npmAlias          - the NPM alias used to build the hidden directive used to call the command
   *
   * @returns {Script} script                - the script loaded into memory
   */
  static getScriptFromJsonFile({
    fileName,
    scriptType = getScriptType(fileName),
    scriptStartingKey = '',
    npmAlias,
  }) {
    if (!isValidJsonFileName(fileName)) {
      printMessage(formatMessage(globalMessages.invalidJsonFile, { fileName }));
      forceExit();
    }
    const jsonFile = loadJsonFile(fileName);
    const name =
      scriptStartingKey && isString(scriptStartingKey) ? scriptStartingKey : getFirstKey(jsonFile);
    const script = new Script({
      name,
    });
    if (!(script.getName() in jsonFile)) {
      printMessage(
        formatMessage(messages.missingScriptStartingKey, {
          fileName,
          scriptStartingKey: script.getName(),
        }),
      );
      forceExit();
    }
    if (scriptType === ScriptTypes.SIMPLE) {
      parseSimpleScript({
        script,
        file: jsonFile[script.getName()],
        npmAlias,
      });
    } else {
      parseAdvancedScript({
        script,
        fileName,
        file: jsonFile[script.getName()],
        key: name,
      });
    }
    return script;
  }
}

module.exports = Parser;
