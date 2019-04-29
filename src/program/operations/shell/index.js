#!/usr/bin/env node

const noop = require('lodash/noop');

const {
    GlobalConfig
} = require('../../../config');
const {
    PROGRAM_NAME
} = require('../../../constants');
const {
    print,
    MESSAGE
} = require('../../../messages');
const {
    prompts,
    inquirerPrompts
} = require('../../../shims/inquirer');
const {
    safeExit
} = require('../../../utility');
const Operation = require('../operation');

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
