#!/usr/bin/env node

const messages = {
  errorParsingYamlFile: {
    message: `\nError parsing <primary>{yamlFileName}<primary> yaml file.\n\n<error>{error}<error>`,
  },
  incorrectlyFormattedVariables: {
    message: 'Variables are not in the correct format',
  },
  errorParsingJsonFile: {
    message: `\nError parsing <primary>{jsonFileName}<primary> json file.\n\n<error>{error}<error>`,
  },
};

module.exports = messages;
