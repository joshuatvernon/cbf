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
  missingScriptStartingKey: {
    message: `Error parsing <secondary>{fileName}<secondary> file. Expected <secondary>{scriptStartingKey}<secondary> tag to exist`,
  },
};

module.exports = messages;
