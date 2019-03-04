#!/usr/bin/env node

const {
    spawn
} = require('child_process');
const lodash = require('lodash');

const {
    DEFAULT_SHELL
} = require('src/constants');
const {
    print,
    ERROR,
    MESSAGE
} = require('src/messages');
const {
    throwError,
    safeExit
} = require('src/utility');

class Command {

    constructor({
        directive = '',
        message = ''
    } = {}) {
        if (directive !== '') {
            this.directive = directive;
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
        directory = ''
    }) {
        if (this.getMessage()) {
            print(MESSAGE, 'commandMessage', this.getMessage());
        }

        let directive;
        if (directory) {
            const path = directory.getPath();
            print(MESSAGE, 'runCommand', this.getDirective(), path);
            directive = `cd ${path} && ${this.getDirective()}`;
        } else {
            print(MESSAGE, 'runCommand', this.getDirective());
            directive = this.getDirective();
        }

        const child_process = spawn(
            directive, {
                shell: shell,
                stdio: 'inherit',
                detached: true
            },
            (err, stdout, stderr) => {
                if (err) {
                    print(ERROR, 'errorRunningCommand', this.getDirective(), err);
                    safeExit();
                }
            }
        );

        child_process.on('exit', () => {
            safeExit();
        });

        process.on('SIGINT', () => {
            process.kill(-child_process.pid, 'SIGINT');
        });
    }

    /**
     * Returns the command directive
     *
     * @returns the command directive
     */
    getDirective() {
        return this.directive;
    }

    /**
     * Updates the command directive
     *
     * @argument string directive - directive to update the command directive
     */
    updateDirective(directive) {
        this.directive = directive;
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
