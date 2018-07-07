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
    default: {
        setting: 'most-recent',
        defaultScriptName: '',
        mostRecentScriptName: ''
    },
    scripts: {}
}

// current script
let currentScript = {
    name: '',
    questions: {},
    commands: {},
    exitCommands: {}
}

let shouldContinueCheckFlag = false;

/**
 * Message factory
 */
let message = (function () {
    return function (messageType, ...args) {
        let message = '';
        switch (messageType) {
            case 'mostRecentScriptOrHelp':
                // args[0] = most recent script
                message = 'Run ' + chalk.blue.bold(args[0]) + ' or display help?';
                break;
            case 'shellSet':
                // args[0] = shell to be set
                message = 'Shell was set to ' + chalk.blue.bold(args[0]);
                break;
            case 'runCommand':
                // args[0] = command to be run
                message = 'Running: ' + chalk.blue.bold(args[0]);
                break;
            case 'printConfig':
                // args[0] = config
                message = 'deathstar Config:\n' + chalk.blue.bold(JSON.stringify(args[0], null, 4));
                break;
            case 'savedScript':
                // args[0] = saved script
                message = 'Saved script as ' + chalk.blue.bold(args[0]) + '\n\nUse ' + chalk.blue.bold('deathstar -r ' + args[0]) + ' to run it';
                break;
            case 'scriptNotReplaced':
                // args[0] = script to be replaced
                message = chalk.blue.bold(args[0]) + ' script not replaced; exiting deathstar';
                break;
            case 'listScripts':
                // args[0] = scripts
                for (let scriptName in config.scripts) {
                    message += chalk.blue.bold(scriptName) + '\n';
                }
                // remove trailing newline
                message = message.replace(/\n$/, "");
                break;
            case 'shouldDelete':
                // args[0] = script to be deleted
                message = 'Delete ' + chalk.blue.bold(args[0]) + ' script (this action cannot be undone)?';
                break;
            case 'shouldDeleteScript':
                message = 'Delete all scripts (this action cannot be undone)?';
                break;
            case 'scriptNotDeleted':
                // args[0] = script to be deleted
                message = chalk.blue.bold(args[0]) + ' script not deleted; exiting deathstar';
                break;
            case 'noScriptsToDelete':
                message = 'There are currently no scripts to delete; exiting deathstar';
                break;
            case 'scriptsNotDeleted':
                message = 'Scripts not deleted; exiting deathstar';
                break;
            case 'deletedScript':
                // args[0] = deleted script
                message = 'Deleted ' + chalk.blue.bold(args[0]) + ' script; exiting deathstar';
                break;
            case 'duplicateScript':
                // args[0] = pre-existing script
                message = 'A script with the name ' + chalk.blue.bold(args[1]) + ' already exists.\n\nTry running ' + chalk.blue.bold('deathstar -u ' + args[0] + ' ' + args[1]);
                break;
            case 'defaultScriptSet':
                // args[0] = default script
                message = 'Default script set to ' + chalk.blue.bold(args[0]);
        }
        return message;
    }
}());

/**
 * Error message factory
 */
let error = (function () {
    return function (errorType, ...args) {
        let errorMessage = '';
        switch (errorType) {
            case 'noSavedScripts':
                errorMessage = 'You have no saved scripts.\n\nYou can save a script by using ' + chalk.blue.bold('deathstar -s [path to .yml file]');
                break;
            case 'noDefaultScript':
                errorMessage = 'A default script has not been set yet\n\nTry setting it by using ' + chalk.blue.bold('deathstar -D');
                break;
            case 'errorDeletingScript':
                // args[0] = script to be deleted
                errorMessage = 'Error deleting ' + chalk.blue.bold(args[0]) + ' script; exiting deathstar';
                break;
            case 'scriptTagNameDoesNotMatch':
                // args[0] = new script name, args[1] = .yml file name, args[2] = script to be updated
                errorMessage = 'script tag in ' + chalk.blue.bold(args[0]) + ' script in ' + chalk.blue.bold(args[1]) + ' does not match the ' + chalk.blue.bold(args[2]) + ' script you are trying to update';
                break;
            case 'scriptToBeUpdatedDoesNotExist':
                // args[0] = current script, args[1] = .yml file name
                errorMessage = chalk.blue.bold(args[0]) + ' script doesn\'t exist to be updated\n\nTry saving it as a new script by running ' + chalk.blue.bold('deathstar -s ' + args[1]);
                break;
            case 'noYmlFile':
                errorMessage = 'No path to .yml file passed in\n\nTry rerunning with ' + chalk.blue.bold('deathstar -s [path to .yml file]');
                break;
            case 'incorrectYmlFile':
                // args[0] = .yml file name
                errorMessage = chalk.blue.bold(args[0]) + ' is an incorrect .yml filename';
                break;
            case 'scriptDoesNotExist':
                // args[0] = script to be run
                errorMessage = 'There is currently no saved script with the name ' + chalk.blue.bold(args[0]) + '\n\nTry resaving it by using ' + chalk.blue.bold('deathstar -s [path to .yml file]');
                break;
            case 'defaultScriptDoesNotExist':
                // args[0] = default script
                errorMessage = 'The default ' + chalk.blue.bold(args[0]) + ' script doesn\'t exist anymore. It has been removed as the default script.\n\nTry resaving it by using ' + chalk.blue.bold('deathstar -s [path to .yml file]');
                break;
            case 'errorRunningCommand':
                // args[0] = command to be run, args[1] = error message
                errorMessage = 'Error executing ' + chalk.blue.bold(args[0]) + ' command\n\n' + chalk.red.bold(args[1]);
                break;
            default:
                errorMessage = 'There was an unknown error; feel free to report this on ' + chalk.blue.bold('https://www.npmjs.com/') + ' or ' + chalk.blue.bold('https://wwww.github.com/');
        }
        return errorMessage;
    }
}());

/**
 * Run a command in the configured shell and exit if a sigint is received
 *
 * @argument command the command to be run
 */
function runCommand(command) {
    console.log('\n' + message('runCommand', command) + '\n');

    let child_process = spawn(command, {shell: config.shell, stdio: 'inherit', detached: true}, (err, stdout, stderr) => {
        if (err) {
            console.log('\n\n' + error('errorRunningCommand', command, err));
            prompts.complete;
            process.exit();
        }
    });

    child_process.on('exit', () => {
        console.log(chalk.blue.bold('\ndeathstar exited'));
    });

    process.on('SIGINT', () => {
        process.kill(-child_process.pid, 'SIGINT');
    });
}

/**
 * Prompt the user to choose a shell
 */
function whichShell() {
    inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        config.shell = '/bin/' + answer;
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
        choices: [
            'sh',
            'bash',
            'zsh'
        ]
    });
}

/**
 * Print json for debugging
 *
 * @argument obj object to be printed as coloured JSON
 * @argument colour colour to print the JSON
 */
function printJson(obj, colour) {
    return console.log(chalk[colour].bold(JSON.stringify(script, null, 4)));
}

/**
 * Check if a file path ends in a valid .yaml file name
 *
 * @argument fileName a .yaml file name to validate
 */
function isValidYamlFileName(fileName) {
    return /.*\.yml/.test(fileName);
}

/**
 * Load a .yaml file into the program
 *
 * @argument ymlFileName .yaml file to load
 */
function loadYmlFile(ymlFileName) {
    return yaml.load(ymlFileName);
}

/**
 * Return true if the current script is saved to config
 */
function doesScriptExist() {
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
function getFirstKey(object) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            return key;
        }
    }
}

/**
 * Return a question prompting the user whether or not cotninue
 */
function shouldContinue() {
    shouldContinueCheckFlag = true;
    return {
        type: 'confirm',
        name: 'shouldContinue',
        message: 'Keep entering commands?',
        default: false
    };
}

/**
 * Print the config file to the console
 */
function displayConfig() {
    console.log(message('printConfig', config));
}

/**
 * Save the config
 */
function saveConfig() {
    fse.outputJsonSync(configFilePath, config, {spaces: 4});
}

/**
 * Load the config
 */
function loadConfig() {
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
function listScripts() {
    if (Object.keys(config.scripts).length === 0) {
        console.log(error('noSavedScripts'));
    } else {
        // print out script names and paths
        console.log(message('listScripts', config.scripts));
    }
}

/**
 * Set the current script to the default script
 */
function setScriptToDefault() {
    if (config.default.defaultScriptName === '') {
        console.log(error('noDefaultScript'));
    } else {
        currentScript.name = config.default.defaultScriptName;
    }
}

/**
 * Prompt the user asking which script they would like to set as the default
 */
function setDefaultScript() {
    if (hasScripts()) {
        inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
            config.default.defaultScriptName = answer;
            saveConfig();
            console.log('\n' + message('defaultScriptSet', config.default.defaultScriptName));
            prompts.complete();
        }, (err) => {
            console.warn(err);
        }, () => {});

        prompts.next({
            type: 'list',
            name: 'setDefaultScript',
            message: 'Which script would you like to make the default?',
            choices: Object.keys(config.scripts)
        });
    } else {
        console.log(error('noSavedScripts'));
    }
}

/**
 * Prompt the user whether or not the delete the current script
 */
function shouldDeleteScript() {
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
function shouldDeleteAllScripts() {
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
function hasScripts() {
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
function printScript() {
    console.log(chalk.blue.bold(currentScript.name) + ' script:\n');

    console.log('Questions:');
    printJson(config.scripts[currentScript.name]['questions'], 'cyan');

    console.log('\nCommands:');
    printJson(config.scripts[currentScript.name]['commands'], 'green');

    console.log('\nExit Commands:');
    printJson(config.scripts[currentScript.name]['exitCommands'], 'yellow');
}

/**
 * Delete a script in the config
 */
function deleteScript() {
    delete config.scripts[currentScript.name];
    saveConfig();
    console.log(message('deletedScript', currentScript.name));
}

/**
 * Delete all the scripts in the config
 */
function deleteAllScripts() {
    config.scripts = {};
    config.default.defaultScriptName = '';
    config.default.mostRecentScriptName = '';
    saveConfig();
}

/**
 * Save the current script
 */
function saveScript() {
    saveConfig();
    console.log(message('savedScript', currentScript.name));
}

/**
 * process a script and store it in the config
 */
function processScript(script, relKey, absKey) {
    if (script.hasOwnProperty('command')) {
        config.scripts[currentScript.name].commands[absKey] = script['command'];
        return [relKey, script['command']];
    }
    if (script.hasOwnProperty('exit-command')) {
        config.scripts[currentScript.name].exitCommands[absKey] = script['exit-command'];
        return [relKey, script['exit-command']];
    }
    if (script.hasOwnProperty('options')) {
        let choices = [];
        for (var key in script['options']) {
            choices.push(key);
            processScript(script['options'][key], key, absKey + '.' + key);
        }
        config.scripts[currentScript.name].questions[absKey] = {
            type: 'list',
            name: relKey,
            message: script['message'],
            choices: choices
        };
        return config.scripts[currentScript.name].questions;
    }
}

/**
 * Run the current script
 */
function runScript() {
    if (currentScript.name !== '') {
        config.default.mostRecentScriptName = currentScript.name;
    }
    saveConfig();

    let currentQuestion = currentScript.name;

    inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        if (currentScript.name === '') {
            if (answer === 'help') {
                prompts.complete();
                program.help();
            } else {
                currentScript.name = config.default.mostRecentScriptName;
                currentQuestion = config.default.mostRecentScriptName;
                prompts.next(config.scripts[currentQuestion]['questions'][currentQuestion]);
            }
        } else if (shouldContinueCheckFlag) {
            if (answer === true) {
                currentQuestion = currentScript.name;
                prompts.next(questions[currentScript.name]);
            } else {
                prompts.complete;
            }
            shouldContinueCheckFlag = false;
        } else {
            currentQuestion += '.' + answer;
            if (config.scripts[currentScript.name]['questions'].hasOwnProperty(currentQuestion)) {
                prompts.next(config.scripts[currentScript.name]['questions'][currentQuestion]);
            } else if (config.scripts[currentScript.name]['commands'].hasOwnProperty(currentQuestion)) {
                runCommand(config.scripts[currentScript.name]['commands'][currentQuestion]);

                // Check if the user would like to continue
                prompts.next(shouldContinue());
            } else if (config.scripts[currentScript.name]['exitCommands'].hasOwnProperty(currentQuestion)) {
                runCommand(config.scripts[currentScript.name]['exitCommands'][currentQuestion]);
            }
        }
    }, (err) => {
        console.warn(err);
    }, () => {
        console.log('Completed!')
    });

    if (currentScript.name === '') {
        prompts.next(mostRecentScriptOrHelp());
    } else {
        prompts.next(config.scripts[currentScript.name]['questions'][currentScript.name]);
    }
}

/**
 * Return a question to prompt the user whether to run the most recent script or display help
 */
function mostRecentScriptOrHelp() {
    return {
        type: 'list',
        name: 'mostRecentScriptOrHelp',
        message: message('mostRecentScriptOrHelp', config.default.mostRecentScriptName),
        choices: ['run ' + config.default.mostRecentScriptName, 'help']
    };
}

/**
 * Save a new script
 */
function newScript(script, ymlFileName) {
    if (!doesScriptExist()) {
        config.scripts[currentScript.name] = {
            questions: {},
            commands: {},
            exitCommands: {}
        };
        processScript(script[currentScript.name], currentScript.name, currentScript.name);
        saveScript();
    } else {
        console.log(message('duplicateScript', currentScript.name, ymlFileName));
    }
}

/**
 * Check if one of the options was passed
 */
function noOptionPassed() {
    if (!program.run && !program.save && !program.list && !program.delete && !program.deleteAll && !program.update && !program.print && !program.runDefault && !program.default && !program.shell && !program.config) {
        return true;
    }
    return false;
}

/**
 * Run the script from the cli with the options passed
 */
function runCLI() {
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

                if (!hasScripts()) {
                    // first script added, make default script
                    config.default.defaultScriptName = currentScript.name;
                }
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
                processScript(script[currentScript.name], currentScript.name, currentScript.name);
                saveScript();
            } else {
                if (ymlFileName === true) {
                    console.log(error('noYmlFile'));
                } else {
                    console.log(error('incorrectYmlFile', ymlFileName));
                }
            }
        }
        if (program.print) {
            currentScript.name = program.print;
            if (doesScriptExist()) {
                printScript();
            } else {
                console.log(error('scriptDoesNotExist', currentScript.name));
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
        if (program.delete) {
            currentScript.name = program.delete;
            doesScriptExist();
            shouldDeleteScript();
        }
        if (program.deleteAll) {
            shouldDeleteAllScripts();
        }
        if (program.list) {
            listScripts();
        }
        if (program.default) {
            setDefaultScript();
        }
        if (program.runDefault) {
            // set script to default
            setScriptToDefault();

            // check if default script still exists
            if (doesScriptExist()) {
                // run the default script
                runScript();
            } else {
                defaultScript = '';
                saveConfig();
                console.log(message('defaultScriptDoesNotExist', currentScript.name));
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
    .version('1.0.0')
    .usage('[options]')
    .option('-l --list', 'list previously saved scripts')
    .option('-s --save [path to .yml file]', 'process and save a script')
    .option('-u --update [script name] [path to .yml file]', 'process and update a script')
    .option('-r --run [script name]', 'run a previously saved script')
    .option('-R --recent', 'run most recent script as default when deathstar is run with no options')
    .option('-D --default', 'set a default script to run as default when deathstar is run with no options')
    .option('-d --delete [script name]', 'delete a previously saved script')
    .option('-A --deleteAll [script name]', 'delete all previously saved scripts')
    .option('-p --print [script name]', 'print a saved script')
    .option('-S --shell', 'set the which shell should run commands')
    .option('-c --config', 'display configuration')
    .parse(process.argv);

runCLI();
