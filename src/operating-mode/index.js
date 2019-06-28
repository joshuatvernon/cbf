#!/usr/bin/env node

const OperatingMode = Object.freeze({
  DEFAULT: Symbol('default'),
  RUNNING: Symbol('running'),
  RUNNING_WITH_DOCUMENTATION: Symbol('running-with-documentation'),
});

class CurrentOperatingMode {
  constructor() {
    this.operatingMode = OperatingMode.DEFAULT;
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
  OperatingMode,
};
