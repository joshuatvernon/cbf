#!/usr/bin/env node

const messages = {
  printScript: {
    message:
      'Printing the <primary>{scriptName}<primary> script:\n\n<secondary>{script}<secondary>',
  },
  errorPrintingScript: {
    message:
      'An error occurred while trying to print the <primary>{scriptName}<primary> script\n\n<error>{error}<error>',
  },
};

module.exports = messages;
