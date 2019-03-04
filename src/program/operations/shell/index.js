#!/usr/bin/env node

const noop = require('lodash/noop');

const {
    GlobalConfig
} = require('src/config');
const {
    PROGRAM_NAME
} = require('src/constants');
const {
    print,
    MESSAGE
} = require('src/messages');
const {
    prompts,
    inquirerPrompts
} = require('src/shims/inquirer');
const {
    safeExit
} = require('src/utility');
const Operation = require('src/program/operations/operation');

const EXPECTED_ARGUMENTS_LENGTH = 0;

const getShellQuestion = () => ({
    type: 'list',
    name: 'shell',
    message: `Which shell would you like ${PROGRAM_NAME} to use?`,
    choices: ['sh', 'bash', 'zsh']
});

const handleAnswerShellQuestion = answer => {
    const shell = `/bin/${answer}`;

    GlobalConfig.updateShell(shell);
    GlobalConfig.save();

    print(MESSAGE, 'shellSet', GlobalConfig.getShell());
};

const handler = args => {
    const subscriber = inquirerPrompts.subscribe(({
        answer
    }) => {
        handleAnswerShellQuestion(answer);
        subscriber.unsubscribe();
        safeExit();
    }, noop, noop);

    prompts.next(getShellQuestion());
};

const operation = {
    name: 'shell',
    flag: 'S',
    description: 'set the which shell should run commands',
    args: [],
    whitelist: [],
    run: handler
};

module.exports = new Operation(operation);
