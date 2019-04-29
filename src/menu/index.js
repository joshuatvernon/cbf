#!/usr/bin/env node

const noop = require('lodash/noop');

const {
    GlobalConfig
} = require('../config');
const {
    Message
} = require('../messages');
const {
    Option
} = require('../config/script');
const {
    commander
} = require('../shims/commander');
const {
    prompts,
    inquirerPrompts
} = require('../shims/inquirer');
const {
    safeExit
} = require('../utility');

class Menu {

    constructor({ operationName, operationRun }) {
        this.operationName = operationName;
        this.operationRun = operationRun;
    }

    run() {
        const subscriber = inquirerPrompts.subscribe(({
            answer
        }) => {
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
                default:
                    console.log('');
                    subscriber.unsubscribe();
                    const args = [answer];
                    this.operationRun(args);
            }
        }, noop, noop);

        const scriptNames = Object.keys(GlobalConfig.getScripts());
        const choices = [...scriptNames, 'help', 'quit'];
        const option = new Option({
            name: 'menu',
            message: Message('menu', this.operationName),
            choices: choices
        });
        prompts.next(option);
    }
}

module.exports = Menu;
