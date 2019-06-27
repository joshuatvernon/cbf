#!/usr/bin/env node

const {
  Parser,
} = require('../../../parser');
const {
  safeExit,
} = require('../../../utility');
const Operation = require('../operation');

const handler = (args) => {
  const ymlFileName = args[0];

  Parser.updateScript(ymlFileName);

  safeExit();
};

const operation = {
  name: 'update',
  flag: 'u',
  description: 'process and update a script',
  args: [{
    name: 'path to .yml file',
    required: true,
  }],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
