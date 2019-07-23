#!/usr/bin/env node

const messages = {
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
