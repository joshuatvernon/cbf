#!/usr/bin/env node

const {
    Parser
} = require('src/parser');
const {
    safeExit
} = require('src/utility');
const Operation = require('src/program/operations/operation');

const EXPECTED_ARGUMENTS_LENGTH = 1;

const handler = args => {
    const ymlFileName = args[0];

    Parser.saveScript(ymlFileName);

    safeExit();
};

const operation = {
    name: 'save',
    flag: 's',
    description: 'process and save a script',
    args: [{
        name: 'path to .yml file',
        required: true
    }],
    whitelist: [],
    run: handler
};

module.exports = new Operation(operation);
