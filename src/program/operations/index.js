#!/usr/bin/env node

const ConfigOperation = require('./config');
const DeleteAllOperation = require('./delete-all');
const DeleteOperation = require('./delete');
const DocumentedOperation = require('./documented');
const ListOperation = require('./list');
const PrintOperation = require('./print');
const RunOperation = require('./run');
const SaveOperation = require('./save');
const ShellOperation = require('./shell');
const UpdateOperation = require('./update');

const OperationTypes = Object.freeze({
  CONFIG: Symbol('config'),
  DELETE_ALL: Symbol('delete-all'),
  DELETE: Symbol('delete'),
  DOCUMENTED: Symbol('documented'),
  LIST: Symbol('list'),
  PRINT: Symbol('print'),
  RUN: Symbol('run'),
  SAVE: Symbol('save'),
  SHELL: Symbol('shell'),
  UPDATE: Symbol('update'),
});

class Operations {
  static get(operationType) {
    let operation;
    // eslint-disable-next-line default-case
    switch (operationType) {
      case OperationTypes.CONFIG:
        operation = ConfigOperation;
        break;
      case OperationTypes.DELETE_ALL:
        operation = DeleteAllOperation;
        break;
      case OperationTypes.DELETE:
        operation = DeleteOperation;
        break;
      case OperationTypes.DOCUMENTED:
        operation = DocumentedOperation;
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
      case OperationTypes.UPDATE:
        operation = UpdateOperation;
        break;
    }
    return operation;
  }
}

module.exports = {
  Operations,
  OperationTypes,
};
