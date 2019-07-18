#!/usr/bin/env node

const cloneDeep = require('lodash/cloneDeep');

const { throwError } = require('../../../utility');

const DEFAULT_OPTION_TYPE = 'list';

class Option {
  constructor({
    name = '',
    message = '',
    choices = [],
  } = {}) {
    this.type = DEFAULT_OPTION_TYPE;
    this.name = name;
    this.message = message;
    this.choices = choices;
  }

  static copy(option) {
    if (option == null) {
      throwError('Option.copy expects a Option instance but instead received a undefined value');
    }
    if (!(option instanceof Option)) {
      throwError(`Option.copy expects a Option instance but instead received a ${(option).constructor.name} instance`);
    }
    return cloneDeep(option);
  }

  /**
     * Returns the options name
     *
     * @returns options name
     */
  getName() {
    return this.name;
  }

  /**
     * Updates the options name
     *
     * @argument string name - the name to update the options name with
     */
  updateName(name) {
    this.name = name;
  }

  /**
     * Returns the options message
     *
     * @returns options message
     */
  getMessage() {
    return this.message;
  }

  /**
     * Updates the options message
     *
     * @argument string message - the message to update the options message with
     */
  updateMessage(message) {
    this.message = message;
  }

  /**
     * Returns the options choices
     *
     * @returns options choices
     */
  getChoices() {
    return this.choices;
  }

  /**
     * Updates the options choices
     *
     * @argument string[] choices - the choices to update the options choices with
     */
  updateChoices(choices) {
    this.choices = choices;
  }
}

module.exports = Option;
