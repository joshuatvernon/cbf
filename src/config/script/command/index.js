#!/usr/bin/env node

const { spawn } = require('child_process');

const fse = require('fs-extra');
const noop = require('lodash/noop');
const cloneDeep = require('lodash/cloneDeep');
const isEmpty = require('lodash/isEmpty');
const { printMessage, formatMessage } = require('formatted-messages');

const { DEFAULT_SHELL, PROGRAM_NAME } = require('../../../constants');
const {
  isEmptyString,
  absolutePath,
  throwError,
  safeExit,
  forceExit,
} = require('../../../utility');
const { prompts, inquirerPrompts, InquirerPromptTypes } = require('../../../shims/inquirer');

const messages = require('./messages');

/**
 * Handle an error while running a command
 *
 * @param {object} param              - object parameter
 * @param {Error|string} param.error  - error that occurred while running command
 * @param {string[]} param.directives - directives ran that caused error
 */
const handleCommandError = ({ error, directives }) => {
  if (directives.length === 1) {
    printMessage(formatMessage(messages.errorRunningCommand, { command: directives[0], error }));
  } else {
    printMessage(formatMessage(messages.errorRunningCommands, { commands: directives, error }));
  }
  safeExit();
};

class Command {
  /**
   * Construct a command
   *
   * @param {object} param                    - object parameter
   * @param {string[]} param.variables        - the commands variables
   * @param {string[]} param.directives       - the commands directives
   * @param {string[]} param.hiddenDirectives - the commands hidden directives
   * @param {string} param.message            - the commands message
   */
  constructor({ variables = [], directives = [], hiddenDirectives = [], message = '' } = {}) {
    this.variables = variables;
    this.directives = directives;
    this.hiddenDirectives = hiddenDirectives;
    if (!isEmptyString(message)) {
      this.message = message;
    }
  }

  /**
   * Return a copy of the command
   *
   * @param {Command} command         - command to be copied
   *
   * @returns {Command} copiedCommand - copied command
   */
  static copy(command) {
    if (!(command instanceof Command)) {
      throwError(
        `Command.copy expects a Command instance but instead received a ${command.constructor.name} instance`,
      );
    }
    return cloneDeep(command);
  }

  /**
   * Prompts the user for values for the command variables and saves them to the command directives
   *
   * @returns {Promise} updatedDirectivesWithVariables - a promise that all the command directives have been updated with command variables
   */
  updateDirectivesWithVariables() {
    const promises = [];

    const variables = this.getVariables();

    // Setup subscriber to receive the answers and save the directives
    const subscriber = inquirerPrompts.subscribe(
      ({ name: { variable, resolve }, answer }) => {
        const variableRegex = new RegExp(`${variable}`, 'g');
        const updatedDirectives = this.getDirectives().map(directive =>
          directive.replace(variableRegex, answer),
        );
        this.updateDirectives(updatedDirectives);
        resolve();
      },
      noop,
      noop,
    );

    Object.keys(variables).forEach(variable => {
      // Ask question
      promises.push(
        new Promise(resolve => {
          prompts.next({
            type: InquirerPromptTypes.INPUT,
            name: {
              variable,
              resolve,
            },
            message: variables[variable],
            default: '',
          });
        }),
      );
    });

    return Promise.all(promises).then(() => subscriber.unsubscribe());
  }

  /**
   * Run the command
   *
   * @param {object} param              - object parameter
   * @param {string} param.shell        - shell to run the command in
   * @param {Directory} param.directory - directory to run the command in
   */
  run({ shell = DEFAULT_SHELL, directory }) {
    const path = absolutePath(directory.getPath());
    if (!isEmptyString(path)) {
      if (!fse.pathExistsSync(path)) {
        printMessage(formatMessage(messages.noSuchDirectory, { path: directory.getPath() }));
        forceExit();
      }
    }

    this.updateDirectivesWithVariables().then(() => {
      if (this.getMessage()) {
        printMessage(formatMessage(messages.commandMessage, { message: this.getMessage() }));
      }
      const directives = this.getDirectives();
      if (directory && directives.length === 1) {
        printMessage(
          formatMessage(messages.runCommandInPath, {
            command: directives[0],
            path: directory.getPath(),
          }),
        );
      } else if (directory && directives.length > 1) {
        printMessage(
          formatMessage(messages.runCommandsInPath, {
            commands: directives[0],
            path: directory.getPath(),
          }),
        );
      } else if (!directory && directives.length === 1) {
        printMessage(formatMessage(messages.runCommand, { command: directives[0] }));
      } else if (!directory && directives.length > 1) {
        printMessage(formatMessage(messages.runCommands, { commands: directives }));
      }

      // Join directives
      const directive = !isEmpty(this.getHiddenDirectives())
        ? this.getHiddenDirectives().join(' && ')
        : this.getDirectives().join(' && ');

      // If the directive will run `cbf` we safe exit the parent running `cbf`
      if (directive.indexOf(PROGRAM_NAME) !== -1) {
        safeExit();
      }

      const childProcess = spawn(
        directive,
        {
          cwd: path,
          shell,
          stdio: 'inherit',
          detached: true,
        },
        error => {
          if (error) {
            handleCommandError({ error, directives });
          }
        },
      );

      childProcess.on('exit', safeExit);
      childProcess.on('error', error => {
        handleCommandError({ error, directives });
      });
      process.on('SIGINT', () => {
        process.kill(-childProcess.pid, 'SIGINT');
      });
    });
  }

  /**
   * Returns the command variables
   *
   * @returns {string[]} variables - the command variables
   */
  getVariables() {
    return this.variables;
  }

  /**
   * Updates the command variables
   *
   * @param {string[]} variables - variables to update the command variables
   */
  updateVariables(variables) {
    this.variables = variables;
  }

  /**
   * Returns the command directives
   *
   * @returns {string[]} directives - the command directives
   */
  getDirectives() {
    return this.directives;
  }

  /**
   * Updates the command directives
   *
   * @param {string[]} directives - directives to update the command directives
   */
  updateDirectives(directives) {
    this.directives = directives;
  }

  /**
   * Returns the command hidden directives used to store directives to be run but not documented
   *
   * @returns {string[]} hiddenDirectives - directives to be ran but not documented
   */
  getHiddenDirectives() {
    return this.hiddenDirectives;
  }

  /**
   * Updates the command hidden directives
   *
   * @param {string[]} hiddenDirectives - directives to be ran but no documented
   */
  updateHiddenDirectives(hiddenDirectives) {
    this.hiddenDirectives = hiddenDirectives;
  }

  /**
   * Returns message of the command
   *
   * @returns {string} message - message of the command
   */
  getMessage() {
    return this.message;
  }

  /**
   * Updates the message of the command
   *
   * @param {string} message - message to update the command message
   */
  updateMessage(message) {
    this.message = message;
  }
}

module.exports = Command;
