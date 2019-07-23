#!/usr/bin/env node

const { PROGRAM_NAME } = require('../constants');

const messages = {
  errorParsingYmlFile: {
    message: `\nError parsing <primary>{ymlFileName}<primary> .yml file.\n\n<error>{error}<error>`,
  },
  loadedScript: {
    message: `Running <primary>{scriptName}<primary> script from <secondary>{ymlFileName}<secondary> file\n`,
  },
  noYmlFile: {
    message:
      'No path to .yml file passed.\n\nTry rerunning with <primary>{programName} -s [path to .yml file]<primary>',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  invalidYmlFile: {
    message: '<error>{ymlFileName}<error> is an invalid .yml filename',
  },
  updatedScript: {
    message:
      'Updated <primary>{scriptName}<primary> script\n\nUse <primary>{programName} -r {scriptName}<primary> to run it',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  scriptNotUpdated: {
    message:
      'There was no script named <primary>{scriptName}<primary> to update with <primary>{ymlFileName}<primary>',
  },
  duplicateScript: {
    message:
      'A script with the name <primary>{scriptName}<primary> already exists.\n\nTry running <primary>{programName} -u {ymlFileName}<primary> to update it',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  savedScript: {
    message:
      'Saved script as <primary>{scriptName}<primary>\n\nUse <primary>{programName} -r {scriptName}<primary> to run it',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
};

module.exports = messages;
