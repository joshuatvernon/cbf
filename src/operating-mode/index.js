#!/usr/bin/env node

const { OperatingModes } = require('../constants');

class CurrentOperatingMode {
  constructor() {
    this.operatingMode = OperatingModes.DEFAULT;
  }

  /**
   * Get the operation mode
   *
   * @returns {OperatingModes} operatingMode - the current operating mode
   */
  get() {
    return this.operatingMode;
  }

  /**
   * Set the operating mode
   *
   * @param {OperatingModes} operatingMode - an operating mode to set
   */
  set(operatingMode) {
    this.operatingMode = operatingMode;
  }
}

module.exports = {
  CurrentOperatingMode: new CurrentOperatingMode(),
};
