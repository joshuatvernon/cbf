#!/usr/bin/env node

const { OperationTypes } = require('../../constants');

const DeleteAllOperation = require('./delete-all');
const DeleteOperation = require('./delete');
const DocumentedOperation = require('./documented');
const DryRunOperation = require('./dry-run');
const JsonOperation = require('./json');
const ListOperation = require('./list');
const PrintOperation = require('./print');
const RunOperation = require('./run');
const SaveOperation = require('./save');
const ShellOperation = require('./shell');
const NPMAliasOperation = require('./npm-alias');

class Operations {
  /**
   * Get the operation from the operation type
   *
   * @param {OperationTypes} operationType - the type of operation to get
   *
   * @returns {Operation} operation - the matching operation
   */
  static get(operationType) {
    let operation;
    // eslint-disable-next-line default-case
    switch (operationType) {
      case OperationTypes.DELETE_ALL:
        operation = DeleteAllOperation;
        break;
      case OperationTypes.DELETE:
        operation = DeleteOperation;
        break;
      case OperationTypes.DOCUMENTED:
        operation = DocumentedOperation;
        break;
      case OperationTypes.DRY_RUN:
        operation = DryRunOperation;
        break;
      case OperationTypes.JSON:
        operation = JsonOperation;
        break;
      case OperationTypes.LIST:
        operation = ListOperation;
        break;
      case OperationTypes.PRINT:
        operation = PrintOperation;
        break;
      case OperationTypes.RUN:
        operation = RunOperation;
        break;
      case OperationTypes.SAVE:
        operation = SaveOperation;
        break;
      case OperationTypes.SHELL:
        operation = ShellOperation;
        break;
      case OperationTypes.NPM_ALIAS:
        operation = NPMAliasOperation;
        break;
    }
    return operation;
  }
}

module.exports = {
  Operations,
  OperationTypes,
};
