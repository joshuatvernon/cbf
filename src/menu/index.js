#!/usr/bin/env node

const noop = require('lodash/noop');
const { printMessage, formatMessage } = require('formatted-messages');

const { GlobalConfig } = require('../config');
const globalMessages = require('../messages');
const { Option } = require('../config/script');
const { commander } = require('../shims/commander');
const { prompts, inquirerPrompts } = require('../shims/inquirer');
const { safeExit } = require('../utility');

const messages = require('./messages');

class Menu {
  constructor({ operationName, operationRun }) {
    this.operationName = operationName;
    this.operationRun = operationRun;
  }

  run() {
    const subscriber = inquirerPrompts.subscribe(
      ({ answer }) => {
        switch (answer) {
          case 'help':
            commander.help();
            subscriber.unsubscribe();
            safeExit();
            break;
          case 'quit':
            subscriber.unsubscribe();
            safeExit();
            break;
          default: {
            printMessage(formatMessage(globalMessages.emptyString));
            subscriber.unsubscribe();
            const args = [answer];
            this.operationRun(args);
          }
        }
      },
      noop,
      noop,
    );

    const scriptNames = Object.keys(GlobalConfig.getScripts());
    const choices = [...scriptNames, 'help', 'quit'];
    const option = new Option({
      name: 'menu',
      message: formatMessage(messages.menu, { operation: this.operationName }),
      choices,
    });
    prompts.next(option);
  }
}

module.exports = Menu;
