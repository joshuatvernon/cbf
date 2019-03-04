#!/usr/bin/env node

const {
    GlobalConfig
} = require('src/config');
const {
    print,
    ERROR,
    MESSAGE
} = require('src/messages');
const {
    safeExit
} = require('src/utility');
const Operation = require('src/program/operations/operation');

const EXPECTED_ARGUMENTS_LENGTH = 0;

const handler = args => {
    GlobalConfig.load();
    if (Object.keys(GlobalConfig.getScripts()).length === 0) {
        print(ERROR, 'noSavedScripts');
    } else {
        // print out script names and paths
        const scriptNames = Object.keys(GlobalConfig.getScripts()).map((key, value) => GlobalConfig.getScript(key).getName());
        print(MESSAGE, 'listScripts', ...scriptNames);
    }

    safeExit();
};

const operation = {
    name: 'list',
    flag: 'l',
    description: 'list previously saved scripts',
    args: [],
    whitelist: [],
    run: handler
};

module.exports = new Operation(operation);
