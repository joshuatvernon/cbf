#!/usr/bin/env node

const chalk = require('chalk');

const messages = {
  name: {
    message: `<primary>{programName}<primary>`,
  },
  usage: {
    message: chalk`<primary>[options]<primary>\n\n{bold cbf} is a simple CLI tool for developers who {italic can't be f#@!'d} learning or remembering commands.\n\nGo to {bold https://github.com/joshuatvernon/cbf} to learn how to make cbf scripts.`,
  },
  invalidNumberOfArgs: {
    message:
      'The <primary>{command}<primary> command expects minimum <secondary>{minimum}<secondary> and maximum <secondary>{maximum}<secondary> arguments but received <secondary>{actual}<secondary>',
  },
  invalidWhitelisted: {
    message:
      'The <secondary>{flag}<secondary> and <secondary>{otherFlag}<secondary> flags are mutually exclusive',
  },
  operationDetails: {
    message: '-{flag}, --{name} {args}',
    defaultOptions: {
      args: '',
    },
  },
};

module.exports = messages;
