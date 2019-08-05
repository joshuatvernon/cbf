#!/usr/bin/env node

const cloneDeep = require('lodash/cloneDeep');

const { throwError } = require('../../../utility');
const { InquirerPromptTypes } = require('../../../shims/inquirer');
const { DEFAULT_OPTIONS_MESSAGE } = require('../../../constants');

class Option {
  /**
   * Construct an option
   *
   * @param {object} param           - object parameter
   * @param {string} param.name      - the options name
   * @param {string} param.message   - the options message
   * @param {string[]} param.choices - the options choices
   */
  constructor({ name = '', message = DEFAULT_OPTIONS_MESSAGE, choices = [] } = {}) {
    this.type = InquirerPromptTypes.LIST;
    this.name = name;
    this.message = message;
    this.choices = choices;
  }

  /**
   * Return a copy of the option
   *
   * @param {Option} option         - option to be copied
   *
   * @returns {Option} copiedOption - copied option
   */
  static copy(option) {
    if (option == null) {
      throwError('Option.copy expects a Option instance but instead received a undefined value');
    }
    if (!(option instanceof Option)) {
      throwError(
        `Option.copy expects a Option instance but instead received a ${option.constructor.name} instance`,
      );
    }
    return cloneDeep(option);
  }

  /**
   * Returns the options name
   *
   * @returns {string} name - options name
   */
  getName() {
    return this.name;
  }

  /**
   * Updates the options name
   *
   * @param {string} name - the name to update the options name with
   */
  updateName(name) {
    this.name = name;
  }

  /**
   * Returns the options message
   *
   * @returns {string} message - the options message
   */
  getMessage() {
    return this.message;
  }

  /**
   * Updates the options message
   *
   * @param {string} message - the message to update the options message with
   */
  updateMessage(message) {
    this.message = message;
  }

  /**
   * Returns the options choices
   *
   * @returns {string[]} choices - the options choices
   */
  getChoices() {
    return this.choices;
  }

  /**
   * Updates the options choices
   *
   * @param {string[]} choices - the choices to update the options choices with
   */
  updateChoices(choices) {
    this.choices = choices;
  }
}

module.exports = Option;
