#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const { HELP_COMMAND, QUIT_COMMAND } = require('../constants');
const { GlobalConfig } = require('../config');
const globalMessages = require('../messages');
const { Option } = require('../config/script');
const { commander } = require('../shims/commander');
const { prompts, inquirerPrompts } = require('../shims/inquirer');
const { getDocumentedChoices, getUndocumentedChoice, safeExit } = require('../utility');

const messages = require('./messages');

class Menu {
  /**
   * Construct a menu
   *
   * @param {object} param                - object parameter
   * @param {string} param.operationName  - name of the operation to run with the menu
   * @param {Function} param.operationRun - the operation to run with the menu
   */
  constructor({ operationName, operationRun }) {
    this.operationName = operationName;
    this.operationRun = operationRun;
  }

  /**
   * Run the menu
   */
  run() {
    const subscriber = inquirerPrompts.subscribe(
      ({ answer }) => {
        switch (answer) {
          case HELP_COMMAND:
            commander.help();
            subscriber.unsubscribe();
            safeExit();
            break;
          case QUIT_COMMAND:
            subscriber.unsubscribe();
            safeExit();
            break;
          default: {
            printMessage(formatMessage(globalMessages.emptyString));
            subscriber.unsubscribe();
            const args = [getUndocumentedChoice(answer)];
            this.operationRun(args);
          }
        }
      },
      noop,
      noop,
    );

    const scriptNames = Object.keys(GlobalConfig.getScripts());
    const choices = [...getDocumentedChoices({ choices: scriptNames }), HELP_COMMAND, QUIT_COMMAND];
    const option = new Option({
      name: 'menu',
      message: formatMessage(messages.menu, { operation: this.operationName }),
      choices,
    });
    prompts.next(option);
  }
}

module.exports = Menu;
