#!/usr/bin/env node

const messages = {
  noSuchDirectory: {
    message: '\nCould not run command in non-existent <red>{path}<red> directory',
  },
  commandMessage: {
    message: '\n{message}\n',
  },
  runCommand: {
    message: '\nRunning <primary>{command}<primary>\n',
  },
  runCommandInPath: {
    message: '\nRunning <primary>{command}<primary> in {path}\n',
  },
  runCommands: {
    message: '\nRunning\n[commands]<primary>\n',
    defaultOptions: {
      commands: [],
      separator: '\n',
    },
  },
  runCommandsInPath: {
    message: '\nRunning commands in <primary>{path}\n[commands]<primary>\n',
    defaultOptions: {
      commands: [],
      separator: '\n',
    },
  },
  errorRunningCommand: {
    message: '\n\nError executing <primary>{command}<primary>\n<error>{error}<error>',
  },
  errorRunningCommands: {
    message: '\n\nError executing commands\n<primary>[commands]<primary>\n<error>{error}<error>',
    defaultOptions: {
      commands: [],
      separator: '\n',
    },
  },
};

module.exports = messages;
