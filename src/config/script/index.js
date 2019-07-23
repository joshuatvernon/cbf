#!/usr/bin/env node

const cloneDeep = require('lodash/cloneDeep');
const isEmpty = require('lodash/isEmpty');
const isString = require('lodash/isString');

const isEmptyString = s => isString(s) && isEmpty(s);

const {
  BACK_COMMAND,
  QUIT_COMMAND,
  ADD_COMMAND,
  DEFAULT_SHELL,
  Modification,
} = require('../../constants');
const { CurrentOperatingMode, OperatingMode } = require('../../operating-mode');
const {
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

class Script {
  constructor({ name = '', options = {}, commands = {}, directories = {} } = {}) {
    this.name = name;
    this.options = options;
    this.commands = commands;
    this.directories = directories;
  }

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
   * @argument string shell - the shell to run the command within
   */
  run(shell = DEFAULT_SHELL) {
    return new Promise(resolve => {
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
              let option = this.getOption(key);
              if (!option.getMessage()) {
                // Option didn't have a message; set the default message
                option = Option.copy(option);
                option.updateMessage('Choose an option');
              }
              prompts.next(option);
              break;
            }
            case ADD_COMMAND:
              subscriber.unsubscribe();
              resolve({
                modification: Modification.ADD_COMMAND,
                optionKey: key,
              });
              break;
            default:
              // eslint-disable-next-line no-param-reassign
              answer = getUndocumentedChoice(answer);
              if (endsWithWhitespace(answer)) {
                // eslint-disable-next-line no-param-reassign
                answer = replaceWhitespace(answer, '.');
              }
              key = `${key}.${answer}`;
              if (this.getOption(key)) {
                let option = this.getOption(key);
                if (!option.getMessage()) {
                  // Option didn't have a message; set the default message
                  option = Option.copy(option);
                  option.updateMessage('Choose an option');
                }

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
        },
        error => {
          // eslint-disable-next-line no-console
          console.warn(error);
        },
        () => {},
      );

      if (this.getOption(key)) {
        let option = this.getOption(key);
        if (!option.getMessage()) {
          // Option didn't have a message; set the default message
          option = Option.copy(option);
          option.updateMessage('Choose an option');
        }
        prompts.next(option);
      } else if (this.getCommand(key)) {
        const command = this.getCommand(key);
        const directory = this.getDirectoryOrClosestParentDirectory(key);
        command.run({
          shell,
          directory,
        });
      }
    });
  }

  /**
   * Return the script name
   *
   * @returns script name
   */
  getName() {
    return this.name;
  }

  /**
   * Update the script name
   *
   * @argument string name - script name
   */
  updateName(name) {
    this.name = name;
  }

  /**
   * Return options in the script
   *
   * @returns script options
   */
  getOptions() {
    return this.options;
  }

  /**
   * Updates the scripts options
   *
   * @argument Option[] options - script options
   */
  updateOptions(options) {
    this.options = options;
  }

  /**
   * Return a specific option if it exists in the script
   *
   * @returns a specific option
   */
  getOption(optionKey) {
    const option = this.options[optionKey];

    if (option) {
      // Add documentation to option
      const documentedOption = Option.copy(option);
      const documented = CurrentOperatingMode.get() === OperatingMode.RUNNING_WITH_DOCUMENTATION;
      const documentedChoices = getDocumentedChoices(
        this,
        optionKey,
        documentedOption.getChoices(),
        documented,
      );
      documentedOption.updateChoices(documentedChoices);

      return documentedOption;
    }

    return null;
  }

  /**
   * Add an option to the script
   *
   * @argument string optionKey - the key of the option to be added to the script
   * @argument Option option - the option to be added to the script
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
   * @argument string optionKey - the key of the option to be updated in the script
   * @argument Option option - the option to be updated in the script
   */
  updateOption({ optionKey, option }) {
    this.options[optionKey] = option;
  }

  /**
   * Remove an option from the script
   *
   * @argument string optionKey - the key of the option to be removed from the script
   */
  removeOption(optionKey) {
    delete this.options[optionKey];
  }

  /**
   * Return commands in the script
   *
   * @returns script commands
   */
  getCommands() {
    return this.commands;
  }

  /**
   * Updates the scripts commands
   *
   * @argument Command[] commands - script commands
   */
  updateCommands(commands) {
    this.commands = commands;
  }

  /**
   * Return a specific command if it exists in the script
   *
   * @returns a specific command
   */
  getCommand(commandKey) {
    return this.commands[commandKey];
  }

  /**
   * Add an command to the script
   *
   * @argument string commandKey - the key of the command to be added to the script
   * @argument Command command - the command to be added to the script
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
   * @argument string commandKey - the key of the command to be updated in the script
   * @argument Command command - the command to be updated in the script
   */
  updateCommand({ commandKey, command }) {
    this.commands[commandKey] = command;
  }

  /**
   * Remove an command from the script
   *
   * @argument string commandKey - the key of the command to be removed from the script
   */
  removeCommand(commandKey) {
    delete this.commands[commandKey];
  }

  /**
   * Return directories in the script
   *
   * @returns script directories
   */
  getDirectories() {
    return this.directories;
  }

  /**
   * Updates the scripts directories
   *
   * @argument Directory{} directories - script directories
   */
  updateDirectories(directories) {
    this.directories = directories;
  }

  /**
   * Return the directory or closest parent directory
   *
   * @argument directoryKey - the directory key used to find the directory or closest parent
   * directory to run the command in
   */
  getDirectoryOrClosestParentDirectory(directoryKey) {
    if (isEmptyString(directoryKey)) {
      return '';
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
   * @returns a specific directory
   */
  getDirectory(directoryKey) {
    return this.directories[directoryKey];
  }

  /**
   * Add an directory to the script
   *
   * @argument string directoryKey - the key of the directory to be added to the script
   * @argument Directory directory - the directory to be added to the script
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
   * @argument string directoryKey - the key of the directory to be updated in the script
   * @argument Directory directory - the directory to be updated in the script
   */
  updateDirectory({ directoryKey, directory }) {
    this.directories[directoryKey] = directory;
  }

  /**
   * Remove an directory from the script
   *
   * @argument string directoryKey - the key of the directory to be removed from the script
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
