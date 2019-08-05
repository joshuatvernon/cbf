#!/usr/bin/env node

const { PROGRAM_NAME, GITHUB_LINK } = require('../../../constants');

const messages = {
  noScriptFile: {
    message:
      'No path to yaml or json file passed.\n\nTry rerunning with <primary>{programName} -s [path to script file]<primary>',
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
  errorSavingScript: {
    message:
      'An error happened while trying to save <primary>{scriptName}<primary> script\n\n<error>{error}<error>\n\nRun <primary>{programName} -s {scriptName}<primary> to try again or raise a bug request at <primary>{githubLink}<primary>',
    defaultOptions: {
      programName: PROGRAM_NAME,
      githubLink: GITHUB_LINK,
    },
  },
  updatedScript: {
    message:
      '\nUpdated <primary>{scriptName}<primary> script\n\nUse <primary>{programName} -r {scriptName}<primary> to run it',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  errorUpdatingScript: {
    message:
      'An error happened while trying to update <primary>{scriptName}<primary> script\n\n<red>{error}<error>\n\nRun <primary>{programName} -s {scriptName}<primary> to try again or raise a bug request at <primary>{githubLink}<primary>',
    defaultOptions: {
      programName: PROGRAM_NAME,
      githubLink: GITHUB_LINK,
    },
  },
  shouldUpdateScript: {
    message: 'Would you like to update the <primary>{scriptName}<primary> script?',
  },
  didNotUpdateScript: {
    message: '\nDid not update script',
  },
};

module.exports = messages;
