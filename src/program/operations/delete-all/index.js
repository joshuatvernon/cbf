#!/usr/bin/env node

const noop = require('lodash/noop');

const {
    GlobalConfig
} = require('src/config');
const {
    print,
    Message,
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
