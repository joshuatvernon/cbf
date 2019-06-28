#!/usr/bin/env node

const { Operations, OperationTypes } = require('./operations');

// Sort operations so they are always consistently displayed in the help menu
const SortedOperationTypes = {};
Object.keys(OperationTypes).sort().forEach((key) => {
  SortedOperationTypes[key] = OperationTypes[key];
});

module.exports = {
  OperationTypes: SortedOperationTypes,
  Operations,
};
