#!/usr/bin/env node

const {
    GlobalConfig
} = require('src/config');
const {
    MESSAGE,
    print
} = require('src/messages');
const {
    safeExit
} = require('src/utility');
const Operation = require('src/program/operations/operation');

const EXPECTED_ARGUMENTS_LENGTH = 0;

const handler = args => {
    GlobalConfig.load();
    print(MESSAGE, 'printConfig', GlobalConfig);
    safeExit();
};

const operation = {
    name: 'config',
    flag: 'c',
    description: 'display configuration',
    args: [],
    whitelist: [],
    run: handler
};

module.exports = new Operation(operation);
