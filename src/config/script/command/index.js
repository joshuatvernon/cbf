#!/usr/bin/env node

const {
  spawn,
} = require('child_process');
const fse = require('fs-extra');
const lodash = require('lodash');

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

class Command {
  constructor({
    directives = [],
    message = '',
  } = {}) {
    if (directives !== []) {
      this.directives = directives;
    }
    if (message !== '') {
      this.message = message;
    }
  }

  static copy(command) {
    if (!(command instanceof Command)) {
      throwError(`Command.copy expects a Command instance but instead recieved a ${(command).constructor.name} instance`);
    }
    return lodash.cloneDeep(command);
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

    const directive = this.getDirectives().join(' && ');
    if (this.getMessage()) {
      print(MESSAGE, 'commandMessage', this.getMessage());
    }
    if (directory) {
      print(MESSAGE, 'runCommand', this.getDirectives(), directory.getPath());
    }

    // If the directive will run `cbf` we safe quit the parent running `cbf`
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
      print(ERROR, 'errorRunningCommand', this.getDirective(), err);
      safeExit();
    });
    process.on('SIGINT', () => {
      process.kill(-childProcess.pid, 'SIGINT');
    });
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
