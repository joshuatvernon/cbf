#!/usr/bin/env node

const {
    GlobalConfig
} = require('../../../config');
const {
    MESSAGE,
    print
} = require('../../../messages');
const {
    safeExit
} = require('../../../utility');
const Operation = require('../operation');

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
