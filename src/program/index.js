#!/usr/bin/env node

const {
    OperationTypes,
    Operations
} = require('src/program/operations');

// Sort operations so they are always consistently displayed in the help menu
const SortedOperationTypes = {};
Object.keys(OperationTypes).sort().forEach((key, value) => SortedOperationTypes[key] = OperationTypes[key]);

module.exports = {
    OperationTypes: SortedOperationTypes,
    Operations: Operations
}
