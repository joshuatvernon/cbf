#!/usr/bin/env node

const {
    CurrentOperatingMode,
    OperatingMode
} = require('src/operating-mode');
const Operation = require('src/program/operations/operation');

const handler = args => {
    CurrentOperatingMode.set(OperatingMode.RUNNING_WITH_DOCUMENTATION);
};

const operation = {
    name: 'documented',
    flag: 'D',
    description: 'prepends the command to the questions when running a script',
    args: [],
    whitelist: ['run'],
    run: handler
};

module.exports = new Operation(operation);