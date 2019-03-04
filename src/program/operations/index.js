#!/usr/bin/env node

const ConfigOperation = require('src/program/operations/config');
const DeleteAllOperation = require('src/program/operations/delete-all');
const DeleteOperation = require('src/program/operations/delete');
const DocumentedOperation = require('src/program/operations/documented');
const ListOperation = require('src/program/operations/list');
const ModifyOperation = require('src/program/operations/modify');
const PrintOperation = require('src/program/operations/print');
const RunOperation = require('src/program/operations/run');
const SaveOperation = require('src/program/operations/save');
const ShellOperation = require('src/program/operations/shell');
const UpdateOperation = require('src/program/operations/update');

const OperationTypes = Object.freeze({
    CONFIG: Symbol('config'),
    DELETE_ALL: Symbol('delete-all'),
    DELETE: Symbol('delete'),
    DOCUMENTED: Symbol('documented'),
    LIST: Symbol('list'),
    MODIFY: Symbol('modify'),
    PRINT: Symbol('print'),
    RUN: Symbol('run'),
    SAVE: Symbol('save'),
    SHELL: Symbol('shell'),
    UPDATE: Symbol('update')
});

class Operations {

    static get(operationType) {
        let operation;
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
            case OperationTypes.MODIFY:
                operation = ModifyOperation;
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
    Operations: Operations,
    OperationTypes: OperationTypes
}
