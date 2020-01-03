#!/usr/bin/env node

const { OperatingModes } = require('../../../constants');
const { CurrentOperatingModes } = require('../../../operating-modes');
const { Operation } = require('../operation');

/**
 * Run the dry-run operation
 */
const run = () => {
  CurrentOperatingModes.add(OperatingModes.DRY_RUN);
};

const operation = {
  name: 'dry-run',
  flag: 'R',
  description: 'prints the command that would have been run to stdout',
  args: [],
  whitelist: ['run', 'json', 'documented', 'delete', 'delete-all'],
  run,
};

module.exports = new Operation(operation);
