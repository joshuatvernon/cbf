#!/usr/bin/env node

class Operation {
  constructor({
    name = '',
    flag = '',
    description = '',
    args = [],
    whitelist = [],
    run = () => {},
  }) {
    this.name = name;
    this.flag = flag;
    this.description = description;
    this.args = args;
    this.whitelist = whitelist;
    this.run = run;
  }

  getName() {
    return this.name;
  }

  getFlag() {
    return this.flag;
  }

  getDescription() {
    return this.description;
  }

  getArgs() {
    return this.args;
  }

  getWhitelist() {
    return this.whitelist;
  }

  getRun() {
    return this.run;
  }

  run() {
    this.run();
  }
}

module.exports = Operation;
