#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');

const {
  PROGRAM_NAME,
} = require('../constants');

/**
 * Return message
 *
 * @argument string messageKey - key to lookup the message
 * @argument any args - arguments to be supplied to the message
 */
const lookupMessage = (messageKey, ...args) => {
  let message;
  switch (messageKey) {
    case 'menu':
      // args[0] = script name
      message = `Select a script to ${args[0]} it, display help or quit?`;
      break;
    case 'menuAdding':
      message = `Which script would you like to add a ${chalk.magenta.bold('command')} or ${chalk.magenta.bold('option')} to?`;
      break;
    case 'runningScriptInModifyMode':
      // args[0] = script name
      message = `Running ${chalk.cyan.bold(args[0])} script in ${chalk.red.bold('modify')} mode\n`;
      break;
    case 'addingCommandTitle':
      message = `\nAdding a ${chalk.magenta.bold('command')}:`;
      break;
    case 'didNotReplaceCommand':
      // args[0] = old command, args[1] = new command
      message = `\nDid not replace ${chalk.magenta.bold(args[0])} with ${chalk.magenta.bold(args[1])}.`;
      break;
    case 'replacedCommand':
      // args[0] = command name, args[1] = command directive
      message = `\nReplaced ${chalk.magenta.bold(args[0])} with ${chalk.magenta.bold(args[1])}`;
      break;
    case 'shellSet':
      // args[0] = shell to be set
      message = `\nShell was set to ${chalk.cyan.bold(args[0])}`;
      break;
    case 'commandMessage':
      // args[0] = command message to be printed
      message = `\n${args[0]}\n`;
      break;
    case 'runCommand':
      // args[0] = commands to be run, ?args[1] = directory to run command in
      if (args[0].length === 1) {
        const command = JSON.stringify(args[0][0]).slice(1, -1);
        message = `\nRunning ${chalk.cyan.bold(command)}`;
        if (args[1]) {
          message = `${message} in ${chalk.cyan.bold(args[1])}`;
        }
        message += '\n';
      } else {
        message = '\nRunning';
        if (args[1]) {
          message += ` commands in ${chalk.cyan.bold(args[1])}`;
        }
        message += '\n';
        let command;
        for (let i = 0; i < args[0].length; i += 1) {
          command = JSON.stringify(args[0][i]).slice(1, -1);
          message += `\n${chalk.cyan.bold(command)}`;
        }
        message += '\n';
      }
      break;
    case 'printConfig':
      // args[0] = config
      message = `${chalk.cyan.bold(JSON.stringify(args[0], null, 4))}`;
      break;
    case 'savedScript':
      // args[0] = saved script name
      message = `Saved script as ${chalk.cyan.bold(args[0])}\n\nUse ${chalk.cyan.bold(`${PROGRAM_NAME} -r ${args[0]}`)} to run it`;
      break;
    case 'updatedScript':
      // args[0] = updated script name
      message = `Updated ${chalk.cyan.bold(args[0])} script\n\nUse ${chalk.cyan.bold(`${PROGRAM_NAME} -r ${args[0]}`)} to run it`;
      break;
    case 'loadedScript':
      // args[0] = loaded script name, // args[1] = loaded script file
      message = `Running ${chalk.cyan.bold(args[0])} script from ${chalk.magenta.bold(path.basename(args[1]))} file\n`;
      break;
    case 'scriptNotReplaced':
      // args[0] = script to be replaced
      message = `${chalk.cyan.bold(args[0])} script not replaced`;
      break;
    case 'listScripts':
      // args[0] = scripts
      message = args.join('\n');
      break;
    case 'shouldDelete':
      // args[0] = script to be deleted
      message = `Delete ${chalk.cyan.bold(args[0])} script (this action cannot be undone)?`;
      break;
    case 'shouldDeleteAllScripts':
      message = 'Delete all scripts (this action cannot be undone)?';
      break;
    case 'scriptNotDeleted':
      // args[0] = script to be deleted
      message = `\n${chalk.cyan.bold(args[0])} script not deleted`;
      break;
    case 'noScriptsToDelete':
      message = 'There are currently no scripts to delete';
      break;
    case 'scriptsNotDeleted':
      message = 'Scripts not deleted';
      break;
    case 'deletedScript':
      // args[0] = deleted script
      message = `\nDeleted ${chalk.cyan.bold(args[0])} script`;
      break;
    case 'deletedAllScripts':
      message = '\nDeleted all scripts';
      break;
    case 'duplicateScript':
      // args[0] = pre-existing script
      message = `A script with the name ${chalk.cyan.bold(args[0])} already exists.\n\nTry running ${chalk.cyan.bold(`${PROGRAM_NAME} -u ${args[1]}`)} to update it`;
      break;
    case 'savedNewCommand':
      // args[0] = new command name, args[1] = script name
      message = `\nSaved ${chalk.magenta.bold(args[0])} command to the ${chalk.cyan.bold(args[1])} script. Try running ${chalk.cyan.bold(`${PROGRAM_NAME} -r ${args[1]}`)} to use it.`;
      break;
    case 'quit':
      message = 'Bye ✌️';
      break;
    default:
      message = '';
  }
  return message;
};

const Message = (() => (messageKey, ...args) => lookupMessage(messageKey, ...args))();

/**
 * Return error message
 *
 * @argument string errorMessageKey - key to lookup the error
 * @argument any args - arguments to be supplied to the error
 */
const lookupErrorMessage = (errorMessageKey, ...args) => {
  let errorMessage;
  switch (errorMessageKey) {
    case 'errorLoadingYmlFile':
      // args[0] = yml file name, args[1] = error message
      errorMessage = `Error loading ${chalk.cyan.bold(args[0])} file\n\n${chalk.red.bold(args[1])}`;
      break;
    case 'errorParsingYmlFile':
      // args[0] = yml file name, args[1] = error message
      errorMessage = `Error parsing ${chalk.cyan.bold(args[0])} file\n\n${chalk.red.bold(args[1])}`;
      break;
    case 'invalidFlags': {
      // ...args = invalid flags
      const invalidArgs = args.filter(arg => arg !== '')
        .map(arg => chalk.magenta.bold(arg))
        .join(', ');
      errorMessage = `\nInvalid arguments passed: ${invalidArgs}`;
      break;
    }
    case 'invalidWhitelisted':
      // args[0] = flag, args[1] = otherFlag
      errorMessage = `The ${chalk.magenta.bold(args[0])} and ${chalk.magenta.bold(args[1])} flags are mutually exclusive`;
      break;
    case 'invalidNumberOfArgs':
      // args[0] = command, args[1] = min number of args expected
      // args[2] = max number of args expected, args[3] = number of args received
      errorMessage = `The ${chalk.cyan.bold(args[0])} command expects minimum ${chalk.magenta.bold(args[1])} and maximum ${chalk.magenta.bold(args[2])} arguments but recieved ${chalk.magenta.bold(args[3])}`;
      break;
    case 'scriptNotUpdated':
      // args[0] = script name, args[1] = yml file name
      errorMessage = `There was no script named ${chalk.cyan.bold(args[0])} to update with ${chalk.cyan.bold(args[1])}`;
      break;
    case 'noSavedScripts':
      errorMessage = `You have no saved scripts.\n\nYou can save a script by using ${chalk.cyan.bold(`${PROGRAM_NAME} -s [path to .yml file]`)}`;
      break;
    case 'noSuchDirectory':
      // args[0] = directory that doesn't exist
      errorMessage = `\nCould not run command in non-existent ${chalk.red.bold(args[0])} directory`;
      break;
    case 'errorDeletingScript':
      // args[0] = script to be deleted
      errorMessage = `Error deleting ${chalk.cyan.bold(args[0])} script`;
      break;
    case 'scriptTagNameDoesNotMatch':
      // args[0] = new script name, args[1] = .yml file name, args[2] = script to be updated
      errorMessage = `script tag in ${chalk.cyan.bold(args[0])} script in ${chalk.cyan.bold(args[1])} does not match the ${chalk.cyan.bold(args[2])} script you are trying to update`;
      break;
    case 'scriptToBeUpdatedDoesNotExist':
      // args[0] = current script, args[1] = .yml file name
      errorMessage = `${chalk.cyan.bold(args[0])} script doesn't exist to be updated\n\nTry saving it as a new script by running ${chalk.cyan.bold(`${PROGRAM_NAME} -s ${args[1]}`)}`;
      break;
    case 'noYmlFile':
      errorMessage = `No path to .yml file passed in\n\nTry rerunning with ${chalk.cyan.bold(`${PROGRAM_NAME} -s [path to .yml file]`)}`;
      break;
    case 'invalidYmlFile':
      // args[0] = .yml file name
      errorMessage = `${chalk.cyan.bold(args[0])} is an invalid .yml filename`;
      break;
    case 'scriptDoesNotExist':
      // args[0] = script to be run
      errorMessage = `There is currently no saved script with the name ${chalk.cyan.bold(args[0])}\n\nTry resaving it by using ${chalk.cyan.bold(`${PROGRAM_NAME} -s [path to .yml file]`)}`;
      break;
    case 'errorRunningCommand':
      // args[0] = command to be run, args[1] = error message
      if (args[0].length === 1) {
        errorMessage = `\n\nError executing ${chalk.cyan.bold(args[0][0])} command\n\n${chalk.magenta.bold(args[1])}`;
      } else {
        errorMessage = '\nError executing commands\n';
        for (let i = 0; i < args[0].length; i += 1) {
          errorMessage += `\n${chalk.cyan.bold(args[0][i])}`;
        }
        errorMessage += `\n\n${chalk.magenta.bold(args[1])}`;
      }
      break;
    default:
      errorMessage = `There was an unknown error; feel free to report this on ${chalk.cyan.bold('https://www.npmjs.com/')} or ${chalk.cyan.bold('https://wwww.github.com/')}`;
  }
  return errorMessage;
};

const Error = (() => (errorMessageKey, ...args) => lookupErrorMessage(errorMessageKey, ...args))();

const MessageType = Object.freeze({
  MESSAGE: Symbol('message'),
  ERROR: Symbol('error'),
});

/**
 * Print message or error to console
 *
 * @argument MessageType type - either a message or error
 * @argument string key - key to lookup the message/error
 * @argument any args - arguments to be supplied to the messages/errors
 */
const print = (type, key, ...args) => {
  let messageOrError;
  if (type === MessageType.MESSAGE) {
    messageOrError = Message(key, ...args);
  } else if (type === MessageType.ERROR) {
    messageOrError = Error(key, ...args);
  }
  // eslint-disable-next-line no-console
  console.log(messageOrError);
};

module.exports = {
  print,
  MESSAGE: MessageType.MESSAGE,
  ERROR: MessageType.ERROR,
  Message,
  Error,
};
