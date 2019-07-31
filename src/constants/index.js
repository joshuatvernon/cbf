#!/usr/bin/env node

const chalk = require('chalk');

// Env
const Env = Object.freeze({
  PROD: 'prod',
  TEST: 'test',
});
const OperatingModes = Object.freeze({
  DEFAULT: Symbol('default'),
  RUNNING: Symbol('running'),
  RUNNING_WITH_DOCUMENTATION: Symbol('running-with-documentation'),
});

// Script
const PROGRAM_NAME = 'cbf';
const ScriptKeys = Object.freeze({
  DIRECTORY: 'directory',
  COMMAND: 'command',
  OPTION: 'options',
  MESSAGE: 'message',
  VARIABLES: 'variables',
});
const OperationTypes = Object.freeze({
  DELETE_ALL: Symbol('delete-all'),
  DELETE: Symbol('delete'),
  DOCUMENTED: Symbol('documented'),
  LIST: Symbol('list'),
  PRINT: Symbol('print'),
  RUN: Symbol('run'),
  SAVE: Symbol('save'),
  SHELL: Symbol('shell'),
});
const BACK_COMMAND = `back ${chalk.blue.bold('↑')}`;
const QUIT_COMMAND = `quit ${chalk.red.bold('⦸')}`;

// Links
const NPM_LINK = 'https://www.npmjs.com/package/cbf';
const GITHUB_LINK = 'https://github.com/joshuatvernon/cbf';

// Paths
const DEFAULT_SHELL = '/bin/bash';
const CONFIG_FILE_PATH = `${__dirname}/../../config/config.json`;
const SCRIPTS_DIRECTORY_PATH = `${__dirname}/../../config/scripts`;
const LOCAL_YAML_FILE_NAME = `${PROGRAM_NAME}.yml`;
const PATH_TO_LOCAL_YAML = `${process.cwd()}/${LOCAL_YAML_FILE_NAME}`;

// Colours
const PRIMARY_COLOUR = 'cyan';
const SECONDARY_COLOUR = 'magenta';
const ERROR_COLOUR = 'red';

// Misc
const DEFAULT_SEPARATOR = ', ';

module.exports = {
  Env,
  OperatingModes,
  PROGRAM_NAME,
  ScriptKeys,
  OperationTypes,
  BACK_COMMAND,
  QUIT_COMMAND,
  NPM_LINK,
  GITHUB_LINK,
  DEFAULT_SHELL,
  CONFIG_FILE_PATH,
  SCRIPTS_DIRECTORY_PATH,
  LOCAL_YAML_FILE_NAME,
  PATH_TO_LOCAL_YAML,
  PRIMARY_COLOUR,
  SECONDARY_COLOUR,
  ERROR_COLOUR,
  DEFAULT_SEPARATOR,
};
