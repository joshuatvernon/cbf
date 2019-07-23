#!/usr/bin/env node

const { PROGRAM_NAME } = require('../../../constants');

const messages = {
  savedNewCommand: {
    message:
      '\nSaved <secondary>{commandName}<secondary> command to the <primary>{scriptName}<primary> script. Try running <primary>{programName} -r {scriptName}<primary> to use it.',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  replaceCommand: {
    message:
      'Replace <secondary>{commandName}<secondary> with <secondary>{commandDirective}<secondary> command',
  },
  replacedCommand: {
    message:
      '\nReplaced <secondary>{commandName}<secondary> with <secondary>{commandDirective}<secondary>',
  },
  didNotReplaceCommand: {
    message:
      '\nDid not replace <secondary>{commandName}<secondary> with <secondary>{commandDirective}<secondary>.',
  },
  hasMessage: {
    message: ' and <secondary>{message}<secondary> message?',
  },
  hasPath: {
    message: '',
  },
  hasMessageAndHasPath: {
    message: '',
  },
  addingCommandTitle: {
    message: '\nAdding a <secondary>command<secondary>:',
  },
  modifiedMessage: {
    message: 'Add a <secondary>command<secondary> to <primary>{optionName}<primary>',
  },
  runningScriptInModifyMode: {
    message: 'Running <primary>{scriptName}<primary> script in <red>modify<red> mode\n',
  },
};

module.exports = messages;
