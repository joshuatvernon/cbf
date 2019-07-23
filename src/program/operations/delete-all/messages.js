#!/usr/bin/env node

const messages = {
  scriptsNotDeleted: {
    message: '\nScripts not deleted',
  },
  deletedAllScripts: {
    message: '\nDeleted all scripts!',
  },
  shouldDeleteAllScripts: {
    message: 'Delete all scripts (this action cannot be undone)?',
  },
  noScriptsToDelete: {
    message: 'There are currently no scripts to delete',
  },
};

module.exports = messages;
