#!/usr/bin/env node

const { OperatingModes } = require('../../../constants');
const { CurrentOperatingModes } = require('../../../operating-modes');
const { Operation } = require('../operation');

/**
 * Run the documented operation
 */
const run = () => {
  CurrentOperatingModes.add(OperatingModes.RUNNING_WITH_DOCUMENTATION);
};

const operation = {
  name: 'documented',
  flag: 'd',
  description: 'prepends the command to the questions when running a script',
  args: [],
  whitelist: ['run', 'json'],
  run,
};

module.exports = new Operation(operation);
