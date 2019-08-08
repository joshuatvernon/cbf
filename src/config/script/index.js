#!/usr/bin/env node

const cloneDeep = require('lodash/cloneDeep');
const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const {
  OperatingModes,
  BACK_COMMAND,
  QUIT_COMMAND,
  DEFAULT_SHELL,
  KEY_SEPARATOR,
} = require('../../constants');
const { CurrentOperatingModes } = require('../../operating-modes');
const {
  isEmptyString,
  endsWithWhitespace,
  getParentKey,
  replaceWhitespace,
  throwError,
  getUndocumentedChoice,
  getDocumentedChoices,
  safeExit,
} = require('../../utility');
const { prompts, inquirerPrompts } = require('../../shims/inquirer');

const Command = require('./command');
const Directory = require('./directory');
const Option = require('./option');
const messages = require('./messages');

class Script {
  /**
   * Construct a script
   *
   * @param {object} param                  - object parameter
   * @param {string} param.name             - the scripts name
   * @param {Option[]} param.options        - the scripts options
   * @param {Command[]} param.commands      - the scripts commands
   * @param {Directory[]} param.directories - the scripts directories
   */
  constructor({ name = '', options = [], commands = [], directories = [] } = {}) {
    this.name = name;
    this.options = options;
    this.commands = commands;
    this.directories = directories;
  }

  /**
   * Return a copy of the script
   *
   * @param {Script} script         - script to be copied
   *
   * @returns {Script} copiedScript - copied script
   */
  static copy(script) {
    if (!(script instanceof Script)) {
      throwError(
        `Script.copy expects a Script instance but instead received a ${script.constructor.name} instance`,
      );
    }
    return cloneDeep(script);
  }

  /**
   * Runs the script
   *
   * @param {string} shell - the shell to run the command within
   */
  run(shell = DEFAULT_SHELL) {
    let key = this.getName();

    const subscriber = inquirerPrompts.subscribe(
      ({ answer }) => {
        switch (getUndocumentedChoice(answer)) {
          case QUIT_COMMAND:
            subscriber.unsubscribe();
            safeExit();
            break;
          case BACK_COMMAND: {
            key = getParentKey(key);
            prompts.next(this.getOption(key));
            break;
          }
          default:
            // eslint-disable-next-line no-param-reassign
            answer = getUndocumentedChoice(answer);
            if (endsWithWhitespace(answer)) {
              // eslint-disable-next-line no-param-reassign
              answer = replaceWhitespace(answer, KEY_SEPARATOR);
            }
            key = `${key}.${answer}`;
            if (this.getOption(key)) {
              prompts.next(this.getOption(key));
            } else if (this.getCommand(key)) {
              const command = this.getCommand(key);
              const directory = this.getDirectoryOrClosestParentDirectory(key);
              command.run({
                shell,
                directory,
              });
            } else {
              printMessage(
                formatMessage(messages.answerNotFoundErrorWhileRunningScript, {
                  scriptName: this.getName(),
                  answer,
                }),
              );
              safeExit();
            }
        }
      },
      noop,
      noop,
    );

    const option = this.getOption(key);
    if (option) {
      prompts.next(option);
    } else if (this.getCommand(key)) {
      const command = this.getCommand(key);
      const directory = this.getDirectoryOrClosestParentDirectory(key);
      command.run({
        shell,
        directory,
      });
    }
  }

  /**
   * Return the script name
   *
   * @returns {string} script name
   */
  getName() {
    return this.name;
  }

  /**
   * Update the script name
   *
   * @param {string} name - script name
   */
  updateName(name) {
    this.name = name;
  }

  /**
   * Return options in the script
   *
   * @returns {Option[]} script options
   */
  getOptions() {
    return this.options;
  }

  /**
   * Updates the scripts options
   *
   * @param {Option[]} options - script options
   */
  updateOptions(options) {
    this.options = options;
  }

  /**
   * Return a specific option if it exists in the script
   *
   * @param {string} optionKey - option key to use to look for option in the script
   *
   * @returns {Option} option  - a specific option
   */
  getOption(optionKey) {
    const option = this.options[optionKey];

    if (option) {
      // Add documentation to option
      const documentedOption = Option.copy(option);
      const documented = CurrentOperatingModes.includes(OperatingModes.RUNNING_WITH_DOCUMENTATION);
      const documentedChoices = getDocumentedChoices({
        optionKey,
        documented,
        script: this,
        choices: documentedOption.getChoices(),
      });
      documentedOption.updateChoices(documentedChoices);

      return documentedOption;
    }

    return null;
  }

  /**
   * Add an option to the script
   *
   * @param {object} param           - object parameter
   * @param {string} param.optionKey - the key of the option to be added to the script
   * @param {Option} param.option    - the option to be added to the script
   */
  addOption({ optionKey, option }) {
    if (optionKey in this.options) {
      throwError(`${this.name} script already has a ${optionKey} option`);
    }
    this.options[optionKey] = option;
  }

  /**
   * Update an option in the script
   *
   * @param {object} param           - object parameter
   * @param {string} param.optionKey - the key of the option to be updated in the script
   * @param {Option} param.option    - the option to be updated in the script
   */
  updateOption({ optionKey, option }) {
    this.options[optionKey] = option;
  }

  /**
   * Remove an option from the script
   *
   * @param {string} optionKey - the key of the option to be removed from the script
   */
  removeOption(optionKey) {
    delete this.options[optionKey];
  }

  /**
   * Return true if the script has the option
   *
   * @param {string} optionKey    - the option key to check for in the script
   *
   * @returns {boolean} hasOption - true if the script has an option with the same option key and false otherwise
   */
  hasOption(optionKey) {
    return Object.keys(this.options).includes(optionKey);
  }

  /**
   * Return commands in the script
   *
   * @returns {Command[]} commands - script commands
   */
  getCommands() {
    return this.commands;
  }

  /**
   * Updates the scripts commands
   *
   * @param {Command[]} commands - script commands
   */
  updateCommands(commands) {
    this.commands = commands;
  }

  /**
   * Return a specific command if it exists in the script
   *
   * @param {string} commandKey - command key to use to look for command in script
   *
   * @returns {Command} command - a specific command
   */
  getCommand(commandKey) {
    return this.commands[commandKey];
  }

  /**
   * Add an command to the script
   *
   * @param {object} param            - object parameter
   * @param {string} param.commandKey - the key of the command to be added to the script
   * @param {Command} param.command   - the command to be added to the script
   */
  addCommand({ commandKey, command }) {
    if (commandKey in this.commands) {
      throwError(`${this.name} script already has a ${commandKey} command`);
    }
    this.commands[commandKey] = command;
  }

  /**
   * Update an command in the script
   *
   * @param {object} param            - object parameter
   * @param {string} param.commandKey - the key of the command to be updated in the script
   * @param {Command} param.command   - the command to be updated in the script
   */
  updateCommand({ commandKey, command }) {
    this.commands[commandKey] = command;
  }

  /**
   * Remove an command from the script
   *
   * @param {string} commandKey - the key of the command to be removed from the script
   */
  removeCommand(commandKey) {
    delete this.commands[commandKey];
  }

  /**
   * Return directories in the script
   *
   * @returns {Directory[]} directories - script directories
   */
  getDirectories() {
    return this.directories;
  }

  /**
   * Updates the scripts directories
   *
   * @param {Directory[]} directories - script directories
   */
  updateDirectories(directories) {
    this.directories = directories;
  }

  /**
   * Return the directory or closest parent directory
   *
   * @param {string} directoryKey                           - the directory key used to find the directory or closest parent directory to run the command in
   *
   * @returns {Directory} closestDirectoryOrParentDirectory - closest directory or parent directory
   */
  getDirectoryOrClosestParentDirectory(directoryKey) {
    if (isEmptyString(directoryKey)) {
      return new Directory('');
    }

    const directory = this.getDirectory(directoryKey);
    if (directory) {
      return directory;
    }

    return this.getDirectoryOrClosestParentDirectory(getParentKey(directoryKey));
  }

  /**
   * Return a specific directory if it exists in the script
   *
   * @param {string} directoryKey   - directory key to look for directory in script with
   *
   * @returns {Directory} directory - a specific directory
   */
  getDirectory(directoryKey) {
    return this.directories[directoryKey];
  }

  /**
   * Add an directory to the script
   *
   * @param {object} param              - object parameter
   * @param {string} param.directoryKey - the key of the directory to be added to the script
   * @param {Directory} param.directory - the directory to be added to the script
   */
  addDirectory({ directoryKey, directory }) {
    if (directoryKey in this.directories) {
      throwError(`${this.name} script already has a ${directoryKey} directory`);
    }
    this.directories[directoryKey] = directory;
  }

  /**
   * Update an directory in the script
   *
   * @param {object} param              - object parameter
   * @param {string} param.directoryKey - the key of the directory to be updated in the script
   * @param {Directory} param.directory - the directory to be updated in the script
   */
  updateDirectory({ directoryKey, directory }) {
    this.directories[directoryKey] = directory;
  }

  /**
   * Remove an directory from the script
   *
   * @param {string} directoryKey - the key of the directory to be removed from the script
   */
  removeDirectory(directoryKey) {
    delete this.directories[directoryKey];
  }
}

module.exports = {
  Script,
  Option,
  Command,
  Directory,
};
