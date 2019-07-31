#!/usr/bin/env node

const { OperatingModes } = require('../constants');

class CurrentOperatingMode {
  constructor() {
    this.operatingMode = OperatingModes.DEFAULT;
  }

  get() {
    return this.operatingMode;
  }

  set(operatingMode) {
    this.operatingMode = operatingMode;
  }
}

module.exports = {
  CurrentOperatingMode: new CurrentOperatingMode(),
};
