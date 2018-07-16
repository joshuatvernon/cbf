#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const yaml = require('yamljs');
const chalk = require('chalk');
const rx = require('rxjs');
const fse = require('fs-extra');
const { spawn } = require('child_process');
const prompts = new rx.Subject();
const configFilePath = __dirname + '/config.json';

// config
let config = {
    shell: '/bin/bash',
    scripts: {}
}

// current script
let currentScript = {
    name: '',
    questions: {},
    commands: {},
    directories: {}
}

/**
 * Message factory
 */
const message = (function () {
    return function (messageType, ...args) {
        let message = '';
        switch (messageType) {
            case 'menu':
                message = 'Run a script or display help?';
                break;
            case 'shellSet':
                // args[0] = shell to be set
                message = `Shell was set to ${chalk.blue.bold(args[0])}`;
                break;
            case 'commandMessage':
                // args[0] = command message to be printed
                message = '\n' + args[0] + '\n';
                break;
            case 'runCommand':
                // args[0] = command to be run, args[1] = directory to run command in
                message = `\nRunning: ${chalk.blue.bold(args[0])} in ${chalk.blue.bold(args[1])}\n`;
                break;
            case 'printConfig':
                // args[0] = config
                message = `pyr Config:\n${chalk.blue.bold(JSON.stringify(args[0], null, 4))}`;
                break;
            case 'savedScript':
                // args[0] = saved script
                message = `Saved script as ${chalk.blue.bold(args[0])}\n\nUse ${chalk.blue.bold(`pyr -r ${args[0]}`)} to run it`;
                break;
            case 'scriptNotReplaced':
                // args[0] = script to be replaced
                message = `${chalk.blue.bold(args[0])} script not replaced; exiting pyr`;
                break;
            case 'listScripts':
                // args[0] = scripts
                for (let scriptName in config.scripts) {
                    message += `${chalk.blue.bold(scriptName)}\n`;
                }
                // remove trailing newline
                message = message.replace(/\n$/, "");
                break;
            case 'shouldDelete':
                // args[0] = script to be deleted
                message = `Delete ${chalk.blue.bold(args[0])} script (this action cannot be undone)?`;
                break;
            case 'shouldDeleteScript':
                message = 'Delete all scripts (this action cannot be undone)?';
                break;
            case 'scriptNotDeleted':
                // args[0] = script to be deleted
                message = `${chalk.blue.bold(args[0])} script not deleted; exiting pyr`;
                break;
            case 'noScriptsToDelete':
                message = 'There are currently no scripts to delete; exiting pyr';
                break;
            case 'scriptsNotDeleted':
                message = 'Scripts not deleted; exiting pyr';
                break;
            case 'deletedScript':
                // args[0] = deleted script
                message = `Deleted ${chalk.blue.bold(args[0])} script; exiting pyr`;
                break;
            case 'duplicateScript':
                // args[0] = pre-existing script
                message = `A script with the name ${chalk.blue.bold(args[1])} already exists.\n\nTry running ${chalk.blue.bold(`pyr -u ${args[0]} ${args[1]}`)}`;
                break;
            case 'quit':
                message = 'Bye ✌️';
        }
        return message;
    }
}());

/**
 * Error message factory
 */
const error = (function () {
    return function (errorType, ...args) {
        let errorMessage = '';
        switch (errorType) {
            case 'noSavedScripts':
                errorMessage = `You have no saved scripts.\n\nYou can save a script by using ${chalk.blue.bold('pyr -s [path to .yml file]')}`;
                break;
            case 'errorDeletingScript':
                // args[0] = script to be deleted
                errorMessage = `Error deleting ${chalk.blue.bold(args[0])} script; exiting pyr`;
                break;
            case 'scriptTagNameDoesNotMatch':
                // args[0] = new script name, args[1] = .yml file name, args[2] = script to be updated
                errorMessage = `script tag in ${chalk.blue.bold(args[0])} script in ${chalk.blue.bold(args[1])} does not match the ${chalk.blue.bold(args[2])} script you are trying to update`;
                break;
            case 'scriptToBeUpdatedDoesNotExist':
                // args[0] = current script, args[1] = .yml file name
                errorMessage = `${chalk.blue.bold(args[0])} script doesn\'t exist to be updated\n\nTry saving it as a new script by running ${chalk.blue.bold(`pyr -s ${args[1]}`)}`;
                break;
            case 'noYmlFile':
                errorMessage = `No path to .yml file passed in\n\nTry rerunning with ${chalk.blue.bold('pyr -s [path to .yml file]')}`;
                break;
            case 'incorrectYmlFile':
                // args[0] = .yml file name
                errorMessage = `${chalk.blue.bold(args[0])} is an incorrect .yml filename`;
                break;
            case 'scriptDoesNotExist':
                // args[0] = script to be run
                errorMessage = `There is currently no saved script with the name ${chalk.blue.bold(args[0])}\n\nTry resaving it by using ${chalk.blue.bold('pyr -s [path to .yml file]')}`;
                break;
            case 'errorRunningCommand':
                // args[0] = command to be run, args[1] = error message
                errorMessage = `\n\nError executing ${chalk.blue.bold(args[0])} command\n\n${chalk.red.bold(args[1])}`;
                break;
            default:
                errorMessage = `There was an unknown error; feel free to report this on ${chalk.blue.bold('https://www.npmjs.com/')} or ${chalk.blue.bold('https://wwww.github.com/')}`;
        }
        return errorMessage;
    }
}());

/**
 * Run a command in the configured shell and exit if a sigint is received
 *
 * @argument commandKey the key of the command to be run
 */
const runCommand = (commandKey) => {

    command = config.scripts[currentScript.name]['commands'][commandKey]['command'];

    printCommandMessageIfPresent(commandKey);

    const commandDir = getDirToCDInto(commandKey);

    console.log(message('runCommand', command, commandDir));

    // prepend command to change directory to
    command = 'cd ' + commandDir + ' && ' + command;

    let child_process = spawn(command, {shell: config.shell, stdio: 'inherit', detached: true}, (err, stdout, stderr) => {
        if (err) {
            console.log(error('errorRunningCommand', command, err));
            prompts.complete;
            process.exit();
        }
    });

    child_process.on('exit', () => {
        console.log(chalk.blue.bold('\npyr exited'));
    });

    process.on('SIGINT', () => {
        process.kill(-child_process.pid, 'SIGINT');
    });
}

/**
 * If a message was passed in with a command print it to stdout
 *
 * @argument commandKey key of command to find command message
 */
const printCommandMessageIfPresent = (commandKey) => {
    if (config.scripts[currentScript.name]['commands'][commandKey].hasOwnProperty('message')) {
        console.log(message('commandMessage', config.scripts[currentScript.name]['commands'][commandKey]['message']));
    }
}

/**
 * Return the directory to change into to run the command
 *
 * @argument key - the key to command to be used to get the closest related ancestor that defines a directory to run the command in
 */
const getDirToCDInto = (key) => {
    if (key === '') {
        // no matching directory to cd into in parent path
        return '';
    }

    if (config.scripts[currentScript.name]['directories'].hasOwnProperty(key)) {
        // found directory in parent path cd into it and return
        return config.scripts[currentScript.name]['directories'][key];
    }

    const parentKey = getParentKey(key);
    return getDirToCDInto(parentKey);
}

/**
 * Prompt the user to choose a shell
 */
const whichShell = () => {
    inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        config.shell = `/bin/${answer}`;
        saveConfig();
        console.log('\n' + message('shellSet', config.shell));
        prompts.complete();
    }, (err) => {
        console.warn(err);
    }, () => {});

    prompts.next({
        type: 'list',
        name: 'whichShell',
        message: 'Which shell would you like to use?',
        choices: ['sh', 'bash', 'zsh']
    });
}

/**
 * Print json for debugging
 *
 * @argument obj object to be printed as coloured JSON
 * @argument colour colour to print the JSON
 */
const printJson = (obj, colour) => {
    return console.log(chalk[colour].bold(JSON.stringify(script, null, 4)));
}

/**
 * Check if a file path ends in a valid .yaml file name
 *
 * @argument fileName a .yaml file name to validate
 */
const isValidYamlFileName = (fileName) => {
    return /.*\.yml/.test(fileName);
}

/**
 * Load a .yaml file into the program
 *
 * @argument ymlFileName .yaml file to load
 */
const loadYmlFile = (ymlFileName) => {
    return yaml.load(ymlFileName);
}

/**
 * Return true if the current script is saved to config
 */
const doesScriptExist = () => {
    if (currentScript.name in config.scripts) {
        return true;
    }
    return false;
}

/**
 * Return the first key in an object
 *
 * @argument object the object to get the first key from
 */
const getFirstKey = (object) => {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            return key;
        }
    }
}

/**
 * Print the config file to the console
 */
const displayConfig = () => {
    console.log(message('printConfig', config));
}

/**
 * Save the config
 */
const saveConfig = () => {
    fse.outputJsonSync(configFilePath, config, {spaces: 4});
}

/**
 * Load the config
 */
const loadConfig = () => {
    // load config
    if (fse.existsSync(configFilePath)) {
        // get config
        config = JSON.parse(fse.readFileSync(configFilePath, 'utf8'));
    } else {
        // save default config
        saveConfig();
    }
}

/**
 * List the scripts saved in the config
 */
const listScripts = () => {
    if (Object.keys(config.scripts).length === 0) {
        console.log(error('noSavedScripts'));
    } else {
        // print out script names and paths
        console.log(message('listScripts', config.scripts));
    }
}

/**
 * Prompt the user whether or not the delete the current script
 */
const shouldDeleteScript = () => {
    inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        if (answer === false) {
            console.log(message('scriptNotDeleted', currentScript.name));
            prompts.complete();
        } else {
            deleteScript(currentScript.name);
            prompts.complete();
        }
    }, (err) => {
        console.warn(err);
    }, () => {});

    prompts.next({
        type: 'confirm',
        name: 'shouldDelete',
        message: message('shouldDelete', currentScript.name),
        default: false
    });
}

/**
 * Prompt the user wther or not to delete all the scripts in the config
 */
const shouldDeleteAllScripts = () => {
    if (!hasScripts()) {
        // no scripts to delete
        console.log(message('noScriptsToDelete'));
    } else {
        inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
            if (answer === false) {
                console.log(message('scriptsNotDeleted'));
                prompts.complete();
            } else {
                deleteAllScripts();
                prompts.complete();
            }
        }, (err) => {
            console.warn(err);
        }, () => {});

        prompts.next({
            type: 'confirm',
            name: 'shouldDeleteAll',
            message: message('shouldDeleteScript'),
        });
    }
}

/**
 * Return true if the config has scripts currently saved
 */
const hasScripts = () => {
    if (Object.keys(config.scripts).length === 0 && config.scripts.constructor === Object) {
        return false;
    }
    return true;
}

/**
 * Print out the current script
 *
 * TODO change this whole function to print out the .yml file (reverse engineered from the .json file)
 */
const printScript = () => {
    console.log(chalk.blue.bold(currentScript.name) + ' script:\n');

    console.log('Questions:');
    printJson(config.scripts[currentScript.name]['questions'], 'cyan');

    console.log('\nCommands:');
    printJson(config.scripts[currentScript.name]['commands'], 'green');

    console.log('\nCommand Directories:');
    printJson(config.scripts[currentScript.name]['directories'], 'blue');
}

/**
 * Delete a script in the config
 */
const deleteScript = () => {
    delete config.scripts[currentScript.name];
    saveConfig();
    console.log(message('deletedScript', currentScript.name));
}

/**
 * Delete all the scripts in the config
 */
const deleteAllScripts = () => {
    config.scripts = {};
    saveConfig();
}

/**
 * Save the current script
 */
const saveScript = () => {
    saveConfig();
    console.log(message('savedScript', currentScript.name));
}

/**
 * Parse the yaml script loaded in as a json object into commands, options, messages
 * and directories and store them as a script in the config
 *
 * @argument string script - the script loaded as JSON object converted from a .yaml file
 */
const processScript = (script) => {
    // recursively process the script into commands, messages, directories and options
    processScriptRecurse(script[currentScript.name], currentScript.name, currentScript.name);
}

/**
 * Helper to recursively parse script for processing
 *
 * @argument string script - the script loaded as JSON object converted from a .yaml file
 * @argument string key - current script key to be processed
 */
const processScriptRecurse = (script, key) => {
    if (script.hasOwnProperty('directory')) {
        config.scripts[currentScript.name].directories[key] = script['directory'];
    }

    if (script.hasOwnProperty('command')) {
        config.scripts[currentScript.name].commands[key] = { command: script['command'] };
        if (script.hasOwnProperty('message')) {
            config.scripts[currentScript.name].commands[key]['message'] = script['message'];
        }
    } else if (script.hasOwnProperty('options')) {
        let choices = [];
        for (var option in script['options']) {
            choices.push(option);
            processScriptRecurse(script['options'][option], key + '.' + option);
        }
        if (currentScript.name !== key) {
            // add default back option to every question to be able to second last option to go back
            choices.push('back');
        }
        // add default quit option to every question so as to be able to display last option as quitting pyr
        choices.push('quit');
        config.scripts[currentScript.name].questions[key] = {
            type: 'list',
            name: getNameFromKey(key),
            message: script['message'],
            choices: choices
        };
    }
}

/**
 * Return the name of the key (which is just the last word after the last period)
 *
 * @argument key - key to use to return the name from
 */
const getNameFromKey = (key) => {
    return key.split('.').pop();
}

/**
 * Return the key of the parent (the key is everything before the last occurance of a period)
 *
 * @argument key - key to use to return the parent key from
 */
const getParentKey = (key) => {
    return key.substr(0, key.lastIndexOf('.'));
}

/**
 * Run the current script
 */
const runScript = () => {
    let currentQuestion = currentScript.name;

    inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        if (answer === 'quit') {
            prompts.complete();
            process.exit();
        } else if (answer === 'back') {
            currentQuestion = getParentKey(currentQuestion);
            prompts.next(config.scripts[currentScript.name]['questions'][currentQuestion]);
        } else if (currentScript.name === '') {
            if (answer === 'help') {
                prompts.complete();
                program.help();
            } else {
                currentScript.name = answer;
                currentQuestion = answer;
                prompts.next(config.scripts[currentScript.name]['questions'][currentQuestion]);
            }
        } else {
            currentQuestion += '.' + answer;
            if (config.scripts[currentScript.name]['questions'].hasOwnProperty(currentQuestion)) {
                prompts.next(config.scripts[currentScript.name]['questions'][currentQuestion]);
            } else if (config.scripts[currentScript.name]['commands'].hasOwnProperty(currentQuestion)) {
                runCommand(currentQuestion);
            }
        }
    }, (err) => {
        console.warn(err);
    }, () => {
        console.log('Completed!')
    });

    if (currentScript.name === '') {
        prompts.next(getMenuQuestion());
    } else {
        prompts.next(config.scripts[currentScript.name]['questions'][currentScript.name]);
    }
}

/**
 * Return a question to prompt the user whether to a script, display help or quit
 */
const getMenuQuestion = () => {
    let choices = Object.keys(config.scripts);
    // add help and quit elements
    Array.prototype.push.apply(choices, ['help', 'quit']);
    return {
        type: 'list',
        name: 'menu',
        message: message('menu'),
        choices: choices
    };
}

/**
 * Save a new script to the config
 *
 * @argument script      script parsed from .yaml file
 * @argument ymlFileName name of the .yaml file that stored the script
 */
const newScript = (script, ymlFileName) => {
    if (!doesScriptExist()) {
        config.scripts[currentScript.name] = {
            questions: {},
            commands: {},
            directories: {}
        };
        processScript(script);
        saveScript();
    } else {
        console.log(message('duplicateScript', currentScript.name, ymlFileName));
    }
}

/**
 * Check if one of the options was passed
 */
const noOptionPassed = () => {
    if (!program.run && !program.save && !program.list && !program.delete && !program.deleteAll && !program.update && !program.print && !program.shell && !program.config) {
        return true;
    }
    return false;
}

/**
 * Run the script from the cli with the options passed
 */
const run = () => {
    loadConfig();

    if (noOptionPassed()) {
        if (hasScripts()) {
            runScript();
        } else {
            program.help();
        }
    } else {
        if (program.save) {
            // load .yml file
            const ymlFileName = program.save;
            if (isValidYamlFileName(ymlFileName)) {
                // get script name
                const script = loadYmlFile(ymlFileName);
                currentScript.name = getFirstKey(script);
                // process script into questions and commands
                newScript(script, ymlFileName);
            } else {
                if (ymlFileName === true) {
                    console.log(error('noYmlFile'));
                } else {
                    console.log(error('incorrectYmlFile', ymlFileName));
                }
            }
        }
        if (program.update) {
            const ymlFileName = process.argv[4];
            if (isValidYamlFileName(ymlFileName)) {
                const script = loadYmlFile(ymlFileName);
                currentScript.name = getFirstKey(script);
                if (currentScript.name !== program.update) {
                    console.log(error('scriptTagNameDoesNotMatch', currentScript.name, ymlFileName, program.update));
                    process.exit();
                }
                if (!doesScriptExist()) {
                    console.log(message('scriptDoesNotExist', currentScript.name));
                    process.exit();
                }
                // process script into questions and commands
                processScript(script);
                saveScript();
            } else {
                if (ymlFileName === true) {
                    console.log(error('noYmlFile'));
                } else {
                    console.log(error('incorrectYmlFile', ymlFileName));
                }
            }
        }
        if (program.run) {
            currentScript.name = program.run;
            if (doesScriptExist()) {
                runScript();
            } else {
                console.log(error('scriptDoesNotExist', currentScript.name));
            }
        }
        if (program.list) {
            listScripts();
        }
        if (program.delete) {
            currentScript.name = program.delete;
            doesScriptExist();
            shouldDeleteScript();
        }
        if (program.deleteAll) {
            shouldDeleteAllScripts();
        }
        if (program.print) {
            currentScript.name = program.print;
            if (doesScriptExist()) {
                printScript();
            } else {
                console.log(error('scriptDoesNotExist', currentScript.name));
            }
        }
        if (program.shell) {
            whichShell();
        }
        if (program.config) {
            displayConfig();
        }
    }
}
program
    .version('1.0.2')
    .usage('[options]')
    .option('-l --list', 'list previously saved scripts')
    .option('-s --save [path to .yml file]', 'process and save a script')
    .option('-u --update [script name] [path to .yml file]', 'process and update a script')
    .option('-r --run [script name]', 'run a previously saved script')
    .option('-d --delete [script name]', 'delete a previously saved script')
    .option('-A --deleteAll [script name]', 'delete all previously saved scripts')
    .option('-p --print [script name]', 'print a saved script')
    .option('-S --shell', 'set the which shell should run commands')
    .option('-c --config', 'display configuration')
    .parse(process.argv);

run();
