#!/usr/bin/env node

class Argument {
  /**
   * Construct an argument
   *
   * @param {object} param           - object parameter
   * @param {boolean} param.required - whether or not the argument is required
   * @param {string} param.name      - the name of the argument
   */
  constructor({ required = false, name = '' }) {
    this.required = required;
    this.name = name;
  }
}

class Operation {
  /**
   * Construct an operation
   *
   * @param {object} param             - object parameter
   * @param {string} param.name        - the operations name
   * @param {string} param.flag        - the operations flag
   * @param {string} param.description - the operations description
   * @param {Argument[]} param.args    - the operations expected arguments
   * @param {string[]} param.whitelist - the whitelist of operations this operation can be run with
   * @param {Function} param.run       - the operations run handler
   */
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
}

module.exports = {
  Argument,
  Operation,
};
