#!/usr/bin/env node

const messages = {
  shouldDelete: {
    message: 'Delete <primary>{scriptName}<primary> script (this action cannot be undone)?',
  },
  scriptNotDeleted: {
    message: '\n<primary>{scriptName}<primary> script not deleted',
  },
  deletedScript: {
    message: '\nDeleted <primary>{scriptName}<primary> script',
  },
  dryRun: {
    message:
      '\nRunning in <primary>dry-run<primary> mode. <primary>{scriptName}<primary> script not deleted',
  },
};

module.exports = messages;
