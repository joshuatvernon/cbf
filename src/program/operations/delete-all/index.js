#!/usr/bin/env node

const noop = require('lodash/noop');

const {
    GlobalConfig
} = require('../../../config');
const {
    print,
    Message,
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

const handleShouldDeleteAllScriptsAnswer = answer => {
    if (answer === false) {
        print(MESSAGE, 'scriptsNotDeleted');
        subscriber.unsubscribe();
        safeExit();
    } else {
        GlobalConfig.removeAllScripts();
        GlobalConfig.save();
        print(MESSAGE, 'deletedAllScripts');
        subscriber.unsubscribe();
        safeExit();
    }
}

const shouldDeleteAllScripts = () => {
    const subscriber = inquirerPrompts.subscribe(({
        answer
    }) => {
        handleShouldDeleteAllScriptsAnswer(answer);
    }, noop, noop);

    prompts.next({
        type: 'confirm',
        name: 'shouldDeleteAll',
        message: Message('shouldDeleteAllScripts'),
        default: false
    });
}

const handler = args => {
    GlobalConfig.load();
    if (Object.keys(GlobalConfig.getScripts()).length > 0) {
        shouldDeleteAllScripts();
    } else {
        print(MESSAGE, 'noScriptsToDelete');
        safeExit();
    }
};

const operation = {
    name: 'delete-all',
    flag: 'A',
    description: 'delete all previously saved scripts',
    args: [],
    whitelist: [],
    run: handler
};

module.exports = new Operation(operation);
