#!/usr/bin/env node

const chalk = require('chalk');

const ErrorMessageService = (function () {
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

module.exports = ErrorMessageService;
