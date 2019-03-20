#!/usr/bin/env node

const lodash = require('lodash');

const { ADD_COMMAND, DEFAULT_SHELL, Modification } = require('src/constants');
const { CurrentOperatingMode, OperatingMode } = require('src/operating-mode');
const {
  containsWhitespace,
  getParentKey,
  replaceWhitespace,
  throwError,
  getUndocumentedChoice,
  getDocumentedChoices,
  safeExit
} = require('src/utility');
const {
    prompts,
    inquirerPrompts
} = require('src/shims/inquirer');
const Command = require('src/config/script/command');
const Directory = require('src/config/script/directory');
const Option = require('src/config/script/option');

class Script {

    constructor({
        name = '',
        options = {},
        commands = {},
        directories = {}
    } = {}) {
        this.name = name;
        this.options = options;
        this.commands = commands;
        this.directories = directories;
    }

    static copy(script) {
        if (!(script instanceof Script)) {
            throwError(`Script.copy expects a Script instance but instead recieved a ${(script).constructor.name} instance`);
        }
        return lodash.cloneDeep(script);
    }

    /**
     * Runs the script
     */
    run(shell = DEFAULT_SHELL) {
        return new Promise((resolve, reject) => {
            let key = this.getName();

            const subscriber = inquirerPrompts.subscribe(({
                answer
            }) => {
                switch(answer) {
                    case 'quit':
                        subscriber.unsubscribe();
                        safeExit();
                        break;
                    case 'back':
                        key = getParentKey(key);
                        const documented = CurrentOperatingMode.get() === OperatingMode.RUNNING_WITH_DOCUMENTATION;
                        const option = this.getOption(key, documented);
                        prompts.next(option);
                        break;
                    case ADD_COMMAND:
                        subscriber.unsubscribe();
                        resolve({
                            modification: Modification.ADD_COMMAND,
                            optionKey: key
                        });
                        break;
                    default:
                        if (CurrentOperatingMode.get() === OperatingMode.RUNNING_WITH_DOCUMENTATION) {
                            answer = getUndocumentedChoice(answer);
                        }
                        if (containsWhitespace(answer)) {
                            answer = replaceWhitespace(answer, '.');
                        }
                        key = `${key}.${answer}`;
                        if (this.getOption(key)) {
                            const documented = CurrentOperatingMode.get() === OperatingMode.RUNNING_WITH_DOCUMENTATION;

                            let option = this.getOption(key, documented);
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
                                shell: shell,
                                directory: directory
                            });
                        }
                }
            }, (err) => {
                console.warn(err);
            }, () => {});

            if (this.getOption(key)) {
                const documented = CurrentOperatingMode.get() === OperatingMode.RUNNING_WITH_DOCUMENTATION;
                const option = this.getOption(key, documented);
                prompts.next(option);
            } else if (this.getCommand(key)) {
                const command = this.getCommand(key);
                const directory = this.getDirectoryOrClosestParentDirectory(key);
                command.run({
                    shell: shell,
                    directory: directory
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
    getOption(optionKey, documented) {
        const option = this.options[optionKey];
        if (documented) {
            const documentedOption = Option.copy(option);
            const documentedChoices = getDocumentedChoices(this, optionKey, documentedOption.getChoices());
            documentedOption.updateChoices(documentedChoices);
            return documentedOption;
        }
        return option;
    }

    /**
     * Add an option to the script
     *
     * @argument string optionKey - the key of the option to be added to the script
     * @argument Option option - the option to be added to the script
     */
    addOption({
        optionKey,
        option
    }) {
        if (this.options.hasOwnProperty(optionKey)) {
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
    updateOption({
        optionKey,
        option
    }) {
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
    addCommand({
        commandKey,
        command
    }) {
        if (this.commands.hasOwnProperty(commandKey)) {
            throwError(`${this.name} script already has a ${directoryKey} command`);
        }
        this.commands[commandKey] = command;
    }

    /**
     * Update an command in the script
     *
     * @argument string commandKey - the key of the command to be updated in the script
     * @argument Command command - the command to be updated in the script
     */
    updateCommand({
        commandKey,
        command
    }) {
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
     * @argument directoryKey - the directory key used to find the directory or closest parent directory to run the command in
     */
    getDirectoryOrClosestParentDirectory(directoryKey) {
        if (directoryKey === '') {
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
    addDirectory({
        directoryKey,
        directory
    }) {
        if (this.directories.hasOwnProperty(directoryKey)) {
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
    updateDirectory({
        directoryKey,
        directory
    }) {
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
    Script: Script,
    Option: Option,
    Command: Command,
    Directory: Directory
};
