#!/usr/bin/env node

const messages = {
  errorParsingYamlFile: {
    message: `\nError parsing <primary>{yamlFileName}<primary> yaml file.\n\n<error>{error}<error>`,
  },
  incorrectlyFormattedVariables: {
    message: 'Variables are not in the correct format',
  },
  errorParsingJsonFile: {
    message: `Error parsing <primary>{jsonFileName}<primary> json file.\n\n<error>{error}<error>`,
  },
  scriptKeyUsedAsOption: {
    message: `Error parsing <secondary>{parentKey}<secondary> in <primary>{fileName}<primary> file.\n\nCannot use <secondary>{scriptKey}<secondary> tag as an option`,
  },
};

module.exports = messages;
