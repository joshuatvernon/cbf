#!/usr/bin/env node

const { PROGRAM_NAME } = require('../../../constants');

const messages = {
  npmAliasQuestion: {
    message: 'What NPM alias would you like <primary>{programName}<primary> to use?',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  npmAliasSet: {
    message: '\nNPM alias was set to <primary>{npmAlias}<primary>',
  },
};

module.exports = messages;
