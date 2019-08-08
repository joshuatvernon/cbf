#!/usr/bin/env node

class OperatingModes {
  constructor() {
    this.operatingModes = [];
  }

  /**
   * Add the operating mode
   *
   * @param {OperatingMode} operatingMode - an operating mode to set
   */
  add(operatingMode) {
    if (!this.operatingModes.includes(operatingMode)) {
      this.operatingModes.push(operatingMode);
    }
  }

  /**
   * Remove the operating mode from running operating modes
   *
   * @param {OperatingMode} operatingMode - running operating mode to remove
   */
  remove(operatingMode) {
    this.operatingModes = this.operatingModes.filter(o => o !== operatingMode);
  }

  /**
   * Returns true if the operating mode is currently running and false otherwise
   *
   * @param {OperatingMode} operatingMode     - operating mode to check to see if its running
   *
   * @returns {boolean} includesOperatingMode - true if the operating mode is currently running
   */
  includes(operatingMode) {
    return this.operatingModes.includes(operatingMode);
  }
}

module.exports = {
  CurrentOperatingModes: new OperatingModes(),
};
