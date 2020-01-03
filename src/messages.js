#!/usr/bin/env node

const { PROGRAM_NAME, NPM_LINK, GITHUB_LINK } = require('./constants');

const messages = {
  noSavedScripts: {
    message:
      'You have no saved scripts.\n\nYou can save a script by using <primary>{programName} -s [path to yaml file]<primary>',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  listScripts: {
    message: 'Scripts:\n\n- [scripts]',
    defaultOptions: {
      scripts: [],
      separator: '\n- ',
    },
  },
  scriptDoesNotExist: {
    message:
      'There is currently no saved scripts with the name <primary>{scriptName}<primary>\n\nTry saving it again by using <primary>{programName} -s [path to yaml file]<primary>',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  unknownError: {
    message:
      'Sorry, an unknown error occurred!\n\nPlease report this at <primary>{githubLink}<primary> or <primary>{npmLink}<primary>',
    defaultOptions: {
      npmLink: NPM_LINK,
      githubLink: GITHUB_LINK,
    },
  },
  emptyString: {
    message: '',
  },
  loadedScript: {
    message:
      'Running <primary>{scriptName}<primary> script from <secondary>{fileName}<secondary> file\n',
  },
  invalidYamlFile: {
    message: '<error>{fileName}<error> is an invalid yaml filename',
  },
  invalidJsonFile: {
    message: '<error>{fileName}<error> is an invalid json filename',
  },
  invalidScriptFile: {
    message: '<error>{fileName}<error> is an invalid script filename',
  },
  runningScriptsFromPackageJson: {
    message: 'Running <secondary>scripts<secondary> from <primary>package.json<primary> file\n',
  },
};

module.exports = messages;
