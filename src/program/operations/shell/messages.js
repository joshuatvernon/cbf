#!/usr/bin/env node

const { PROGRAM_NAME } = require('../../../constants');

const messages = {
  shellQuestion: {
    message: 'Which shell would you like <primary>{programName}<primary> to use?',
    defaultOptions: {
      programName: PROGRAM_NAME,
    },
  },
  shellSet: {
    message: '\nShell was set to <primary>{shell}<primary>',
  },
};

module.exports = messages;
