#!/usr/bin/env node

const messages = {
  errorLoadingYamlFile: {
    message: 'Error loading <primary>{yamlFileName}<primary> file\n\n<error>{exception}<error>',
  },
  errorLoadingJsonFile: {
    message: 'Error loading <primary>{jsonFileName}<primary> file\n\n<error>{exception}<error>',
  },
};

module.exports = messages;
