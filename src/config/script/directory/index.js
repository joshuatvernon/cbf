#!/usr/bin/env node

const cloneDeep = require('lodash/cloneDeep');

const { throwError } = require('../../../utility');

class Directory {
  constructor(path = '') {
    this.path = path;
  }

  /**
   * Return a copy of the directory
   *
   * @param {Directory} directory         - directory to be copied
   *
   * @returns {Directory} copiedDirectory - copied directory
   */
  static copy(directory) {
    if (!(directory instanceof Directory)) {
      throwError(
        `Directory.copy expects a Directory instance but instead received a ${directory.constructor.name} instance`,
      );
    }
    return cloneDeep(directory);
  }

  /**
   * Returns the directories path
   *
   * @returns {string} path - directories path
   */
  getPath() {
    return this.path;
  }

  /**
   * Updates the directories path
   *
   * @param {string} path - path to update the directories path
   */
  updatePath(path) {
    this.path = path;
  }
}

module.exports = Directory;
