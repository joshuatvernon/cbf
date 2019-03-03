#!/usr/bin/env node

const chalk = require('chalk');

const MessageService = (function () {
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
                for (let scriptName in args[0]) {
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

module.exports = MessageService;
