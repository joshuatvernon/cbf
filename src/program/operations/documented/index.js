#!/usr/bin/env node

const { OperatingModes } = require('../../../constants');
const { CurrentOperatingMode } = require('../../../operating-mode');
const Operation = require('../operation');

const run = () => {
  CurrentOperatingMode.set(OperatingModes.RUNNING_WITH_DOCUMENTATION);
};

const operation = {
  name: 'documented',
  flag: 'D',
  description: 'prepends the command to the questions when running a script',
  args: [],
  whitelist: ['run'],
  run,
};

module.exports = new Operation(operation);
