#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const readline = require('readline')
const yaml = require('yamljs');
const chalk = require('chalk');
const rx = require('rxjs');
const fse = require('fs-extra');
const { spawn } = require('child_process');
let prompts = new rx.Subject();
const configFilePath = __dirname + '/config.json';

const { options } = require('./program');
const CommandAdder = require('./command-adder');

let promptsSubscription;

// config
let config = {
    shell: '/bin/bash',
    scripts: {}
}

let tempConfig;

// current script
let currentScript = {
    name: '',
    questions: {},
    commands: {},
    directories: {}
}

let featureFlags = {
    documented: false,
    adding: false,
    addingCommand: false,
}

const ADD_OPTION = `${chalk.red.bold('option')}`;
const ADD_COMMAND = `${chalk.red.bold('command')}`;

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
            case 'menuAdding':
                message = `Which script would you like to add a ${chalk.red.bold('command')} or ${chalk.red.bold('option')} to?`;
                break;
            case 'didNotReplaceCommand':
                // args[0] = old command, args[1] = new command
                message = `\nDid not replace ${chalk.red.bold(args[0])} with ${chalk.red.bold(args[1])}.`;
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
            case 'savedNewCommand':
                // args[0] = new command name, args[1] = script name
                message = `\nSaved ${args[0]} command to the ${chalk.blue.bold(args[1])} script. Try running ${chalk.blue.bold(`pyr -r ${args[1]}`)} to use it.`;
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
            prompts.complete();
            process.exit();
        }
    });

    child_process.on('exit', () => {
        process.exit();
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
    promptsSubscription = inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        config.shell = `/bin/${answer}`;
        saveConfig();
        console.log('\n' + message('shellSet', config.shell));
        promptsSubscription.unsubscribe();
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
 * Copy the config
 */
const copyConfig = () => {
    tempConfig = JSON.parse(JSON.stringify(config));
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
    promptsSubscription = inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        if (answer === false) {
            console.log(message('scriptNotDeleted', currentScript.name));
            promptsSubscription.unsubscribe();
            prompts.complete();
        } else {
            deleteScript(currentScript.name);
            promptsSubscription.unsubscribe();
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
        promptsSubscription = inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
            if (answer === false) {
                console.log(message('scriptsNotDeleted'));
                promptsSubscription.unsubscribe();
                prompts.complete();
            } else {
                deleteAllScripts();
                promptsSubscription.unsubscribe();
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
        // let choicesWithCommands = [];
        for (var option in script['options']) {
            processScriptRecurse(script['options'][option], key + '.' + option);
            choices.push(option);
            // if (script['options'][option].hasOwnProperty('command')) {
            //     // document choice with command
            //     option += ' -> ' + chalk.red.bold(script['options'][option]['command']);
            // }
            // choicesWithCommands.push(option);
        }
        if (currentScript.name !== key) {
            // add default back option to every question to be able to second last option to go back
            choices.push('back');
            // choicesWithCommands.push('back');
        }
        // add default quit option to every question so as to be able to display last option as quitting pyr
        choices.push('quit');
        // choicesWithCommands.push('quit');
        config.scripts[currentScript.name].questions[key] = {
            type: 'list',
            name: getNameFromKey(key),
            message: script['message'],
            choices: choices,
            // choicesWithCommands: choicesWithCommands
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

function addQuestion(key) {
    prompts.next(getNextQuestion(key));
}

function addQuestionOrRunCommand(key) {
    if (config.scripts[currentScript.name]['commands'].hasOwnProperty(key)) {
        runCommand(key);
    } else {
        addQuestion(key);
    }
}

const handleQuit = () => {
    prompts.complete();
    process.exit();
}

const handleBack = (currentQuestion) => {
    const nextQuestion = getParentKey(currentQuestion);
    prompts.next(getNextQuestion(nextQuestion));
    return nextQuestion;
}

const handleHelp = () => {
    prompts.complete();
    program.help();
}

const handleStartScriptFromMenu = (scriptName) => {
    currentScript.name = scriptName;
    const nextQuestion = scriptName;
    return nextQuestion;
}

const addOptionToConfig = (optionName) => {
    console.log(`optionName: ${optionName}`);
}

const sanitiseChoices = () => {
    Object.keys(config.scripts[currentScript.name]['questions']).map((questionKey, index) => {
        config.scripts[currentScript.name]['questions'][questionKey].choices = config.scripts[currentScript.name]['questions'][questionKey].choices.filter(choice => {
            return choice !== ADD_OPTION && choice !== ADD_COMMAND;
        });
    });
}

const updateCommandInConfig = ({
    name,
    formattedName,
    commandMessage,
    directory,
    command,
    questionKey,
}) => {
    const commandKey = `${questionKey}.${formattedName}`;
    const oldCommand = tempConfig.scripts[currentScript.name]['commands'][commandKey].command;
    let message = `Replace ${chalk.red.bold(name)} awith ${chalk.red.bold(command)} command`;
    if (commandMessage && !directory) {
        message += ` and ${chalk.red.bold(commandMessage)} message?`;
    } else if (!commandMessage && directory) {
        message += ` and ${chalk.red.bold(directory)} directory?`;
    } else if (commandMessage && directory) {
        message += `, ${chalk.red.bold(commandMessage)} message and ${chalk.red.bold(directory)} directory?`;
    }
    prompts.next({
        type: 'confirm',
        name: 'confirm-replace-command',
        message,
    });
}

const addCommandToConfig = ({
    name,
    formattedName,
    commandMessage,
    directory,
    command,
    questionKey,
}) => {
    // add the command choice to the config
    const choices = tempConfig.scripts[currentScript.name]['questions'][questionKey].choices;
    if (!choices.includes(name)) {
        let index;
        if (choices.indexOf('back') > -1) {
            index = choices.indexOf('back');
        } else {
            index = choices.indexOf('quit');
        }
        tempConfig.scripts[currentScript.name]['questions'][questionKey].choices.splice(index, 0, name);
    }

    // create the new command
    const newCommand = {
        command: command,
    };
    if (commandMessage) {
        newCommand['message'] = commandMessage;
    }

    // add the command to the config
    const commandKey = `${questionKey}.${formattedName}`;
    tempConfig.scripts[currentScript.name]['commands'] = {
        ...tempConfig.scripts[currentScript.name]['commands'],
        [commandKey]: newCommand,
     };

     if (directory) {
         // add directory to run the command in to the config
         const directories = tempConfig.scripts[currentScript.name]['directories'];
         tempConfig.scripts[currentScript.name]['directories'] = { ...directories, [commandKey]: directory };
     }

    config = tempConfig;

    saveConfig();

    console.log(message('savedNewCommand', name, currentScript.name));
}

const addOption = (currentQuestion) => {
    prompts.complete();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('name: ', (name) => {
        // TODO - figure out how to add options
        addOptionToConfig(name);
        rl.close();
    });
}

const doesCommandAlreadyExist = ({ commandKey }) => {
    return tempConfig.scripts[currentScript.name]['commands'][commandKey];
}

/**
 * Run the current script
 */
const runScript = () => {
    let currentQuestion = currentScript.name;

    const commandAdder = new CommandAdder();

    promptsSubscription = inquirer.prompt(prompts).ui.process.subscribe(({ answer }) => {
        if (featureFlags.addingCommand) {
            commandAdder.nextAnswer(answer);
            const question = commandAdder.nextQuestion();

            if (question) {
                prompts.next(question);
            } else {
                const formattedName = commandAdder.answers.name.replace(/\s+/g, '.');
                if (typeof answer !== 'boolean' && doesCommandAlreadyExist({ commandKey: `${currentQuestion}.${formattedName}` })) {
                    updateCommandInConfig({
                        questionKey: currentQuestion,
                        ...commandAdder.answers,
                        formattedName
                    });
                } else {
                    if (answer) {
                        addCommandToConfig({
                            questionKey: currentQuestion,
                            ...commandAdder.answers,
                            formattedName
                        });
                    } else {
                        const oldCommand = config.scripts[currentScript.name]['commands'][`${currentQuestion}.${formattedName}`].command;
                        console.log(message('didNotReplaceCommand', oldCommand, commandAdder.answers.command));
                    }
                    handleQuit();
                }
            }
        } else if (answer === 'quit') {
            handleQuit();
        } else if (answer === 'back') {
            currentQuestion = handleBack(currentQuestion);
        } else if (currentScript.name === '') {
            if (answer === 'help') {
                handleHelp();
            } else {
                currentQuestion = handleStartScriptFromMenu(answer);
                addQuestionOrRunCommand(currentQuestion);
            }
        } else {
            if (featureFlags.documented) {
                answer = getChoiceFromDocumentedChoice(answer);
            }
            if (featureFlags.added) {
                console.log(answer);
            } else if (featureFlags.adding) {
                if (answer === ADD_OPTION) {
                    addOption(currentQuestion);
                } else if (answer === ADD_COMMAND) {
                    featureFlags.addingCommand = true;
                    prompts.next(commandAdder.nextQuestion());
                } else {
                    currentQuestion += '.' + answer;
                    addQuestionOrRunCommand(currentQuestion);
                }
            } else {
                currentQuestion += '.' + answer;
                addQuestionOrRunCommand(currentQuestion);
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
        addQuestionOrRunCommand(currentScript.name);
    }
}

function getChoiceFromDocumentedChoice(documentedChoice) {
    return documentedChoice.split(':')[0];
}

function getDocumentedChoice(questionKey, choice) {
    const commandKey = `${questionKey}.${choice}`;
    const commandObject = config.scripts[currentScript.name]['commands'][commandKey];
    if (commandObject) {
        const command = config.scripts[currentScript.name]['commands'][commandKey]['command'];
        return `${choice}: ${chalk.red.bold(command)}`;
    }
    return choice;
}

function getDocumentedChoicesFromChoices(questionKey, choices) {
    return choices.map(choice => getDocumentedChoice(questionKey, choice));
}

function getChoicesWithoutCommands(questionKey, choices) {
    return choices.filter(choice => {
        const commandKey = `${questionKey}.${choice}`;
        const isCommand = Boolean(config.scripts[currentScript.name]['commands'][commandKey]);
        return !isCommand;
    });
}

const appendAddingChoicesToQuestion = (questionKey) => {
    const addingChoices = [ADD_COMMAND, ADD_OPTION];
    choices = config.scripts[currentScript.name]['questions'][questionKey].choices;
    const hasAddingChoices = addingChoices.every(choice => choices.includes(choice));
    if (!hasAddingChoices) {
        config.scripts[currentScript.name]['questions'][questionKey].choices = getChoicesWithoutCommands(questionKey, choices);

        let index;
        if (config.scripts[currentScript.name]['questions'][questionKey].choices.indexOf('back') > -1) {
            index = config.scripts[currentScript.name]['questions'][questionKey].choices.indexOf('back');
        } else {
            index = config.scripts[currentScript.name]['questions'][questionKey].choices.indexOf('quit');
        }
        // Append adding commands just before `back` and `quit`
        config.scripts[currentScript.name]['questions'][questionKey].choices.splice(index, 0, ADD_OPTION);
        config.scripts[currentScript.name]['questions'][questionKey].choices.splice(index, 0, ADD_COMMAND);
    }
}

/**
 * Return the next question
 *
 * @argument questionKey
 */
const getNextQuestion = (questionKey) => {
    if (featureFlags.documented) {
        config.scripts[currentScript.name]['questions'][questionKey].choices = getDocumentedChoicesFromChoices(questionKey, config.scripts[currentScript.name]['questions'][questionKey].choices);
    }
    if (featureFlags.adding) {
        const addingChoices = [ADD_COMMAND, ADD_OPTION];
        choices = config.scripts[currentScript.name]['questions'][questionKey].choices;
        const hasAddingChoices = addingChoices.every(choice => choices.includes(choice));
        if (!hasAddingChoices) {
            config.scripts[currentScript.name]['questions'][questionKey].message = `Add a ${chalk.red.bold('command')} or ${chalk.red.bold('option')} to ${chalk.blue.bold(questionKey)}?`;
            appendAddingChoicesToQuestion(questionKey);
        }
    }
    return config.scripts[currentScript.name]['questions'][questionKey];
}

/**
 * Return a question to prompt the user whether to a script, display help or quit
 */
const getMenuQuestion = () => {
    const scriptNames = Object.keys(config.scripts);
    const choices = [...scriptNames, 'help', 'quit'];
    return {
        type: 'list',
        name: 'menu',
        message: featureFlags.adding ? message('menuAdding') : message('menu'),
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
 * Check if one or more of the options were passed
 */
const noOptionPassed = () => {
    return !Object.keys(options)
            .map((key, value) => options[key].name)
            .some(optionName => program.hasOwnProperty(optionName));
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
        if (program.add) {
            const scriptName = process.argv[3];
            if (scriptName) {
                currentScript.name = scriptName;
                if (!doesScriptExist()) {
                    console.log(message('scriptDoesNotExist', currentScript.name));
                    process.exit();
                }
            }
            featureFlags.adding = true;
            copyConfig();
            runScript();
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
        if (program.documented) {
            featureFlags.documented = true;
            if (process.argv.length === 3) {
                if (hasScripts()) {
                    runScript();
                } else {
                    program.help();
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

const setupProgram = () => {
    program.version('1.0.4');
    program.usage('[options]');

    // Add program options
    Object.keys(options).forEach((key, value) => {
        const option = options[key];
        const arguments = option.args.length > 0 ? `[${option.args.join('] [')}]` : '';
        const details = `-${option.flag} --${option.name} ${arguments}`;
        const description = `${option.description}`;
        program.option(details, description);
    });
    program.parse(process.argv);
}

setupProgram();

run();
