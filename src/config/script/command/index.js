#!/usr/bin/env node

const {
  spawn,
} = require('child_process');
const fse = require('fs-extra');
const cloneDeep = require('lodash/cloneDeep');
const noop = require('lodash/noop');

const {
  DEFAULT_SHELL,
} = require('../../../constants');
const {
  print,
  ERROR,
  MESSAGE,
} = require('../../../messages');
const {
  absolutePath,
  throwError,
  safeExit,
  forceExit,
} = require('../../../utility');
const {
  prompts,
  inquirerPrompts,
} = require('../../../shims/inquirer');

class Command {
  constructor({
    variables = [],
    directives = [],
    message = '',
  } = {}) {
    if (variables !== []) {
      this.variables = variables;
    }
    if (directives !== []) {
      this.directives = directives;
    }
    if (message !== '') {
      this.message = message;
    }
  }

  static copy(command) {
    if (!(command instanceof Command)) {
      throwError(`Command.copy expects a Command instance but instead received a ${(command).constructor.name} instance`);
    }
    return cloneDeep(command);
  }

  /**
   * Prompts the user for values for the command variables and saves them to the command directives
   *
   * @returns Promise updatedDirectivesWithVariables - a promise that all the command directives have been updated with command variables
   */
  updateDirectivesWithVariables() {
    const promises = [];

    const variables = this.getVariables();

    // Setup subscriber to receive the answers and save the directives
    const subscriber = inquirerPrompts.subscribe(({ name: { variable, resolve }, answer }) => {
      const variableRegex = new RegExp(`${variable}`, 'g');
      const updatedDirectives = this.getDirectives().map(directive => directive.replace(variableRegex, answer));
      this.updateDirectives(updatedDirectives);
      resolve();
    }, noop, noop);

    Object.keys(variables).forEach((variable) => {
      // Ask question
      promises.push(new Promise((resolve) => {
        prompts.next({
          type: 'input',
          name: {
            variable,
            resolve,
          },
          message: variables[variable],
          default: '',
        });
      }));
    });

    return Promise.all(promises).then(() => subscriber.unsubscribe());
  }

  /**
     * Run the command
     */
  run({
    shell = DEFAULT_SHELL,
    directory,
  }) {
    let path = '';
    if (directory) {
      path = absolutePath(directory.getPath());
      if (!fse.existsSync(path)) {
        print(ERROR, 'noSuchDirectory', directory.getPath());
        forceExit();
      }
    }

    this.updateDirectivesWithVariables().then(() => {
      // Join directives
      const directive = this.getDirectives().join(' && ');
      if (this.getMessage()) {
        print(MESSAGE, 'commandMessage', this.getMessage());
      }
      if (directory) {
        print(MESSAGE, 'runCommand', this.getDirectives(), directory.getPath());
      } else {
        print(MESSAGE, 'runCommand', this.getDirectives());
      }

      // If the directive will run `cbf` we safe exit the parent running `cbf`
      if (directive.indexOf('cbf') !== -1) {
        safeExit();
      }

      const childProcess = spawn(
        directive, {
          cwd: path,
          shell,
          stdio: 'inherit',
          detached: true,
        },
        (err) => {
          if (err) {
            print(ERROR, 'errorRunningCommand', this.getDirectives(), err);
            safeExit();
          }
        },
      );

      childProcess.on('exit', safeExit);
      childProcess.on('error', (err) => {
        print(ERROR, 'errorRunningCommand', this.getDirectives(), err);
        safeExit();
      });
      process.on('SIGINT', () => {
        process.kill(-childProcess.pid, 'SIGINT');
      });
    });
  }

  /**
   * Returns the command variables
   *
   * @returns the command variables
   */
  getVariables() {
    return this.variables;
  }

  /**
   * Updates the command variables
   *
   * @argument string[] variables - variables to update the command variables
   */
  updateVariables(variables) {
    this.variables = variables;
  }

  /**
   * Returns the command directives
   *
   * @returns the command directives
   */
  getDirectives() {
    return this.directives;
  }

  /**
   * Updates the command directives
   *
   * @argument string[] directives - directives to update the command directives
   */
  updateDirectives(directives) {
    this.directives = directives;
  }

  /**
   * Returns message of the command
   *
   * @returns message of the command
   */
  getMessage() {
    return this.message;
  }

  /**
   * Updates the message of the command
   *
   * @argument string message - message to update the command message
   */
  updateMessage(message) {
    this.message = message;
  }

  /**
     * Returns directory of the command
     *
     * @returns directory of the command
     */
  getDirectory() {
    return this.directory;
  }

  /**
   * Updates the directory of the command
   *
   * @argument string directory - directory to update the command directory
   */
  updateDirectory(directory) {
    this.directory = directory;
  }
}

module.exports = Command;
