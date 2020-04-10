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
  RUNNING_PACKAGE_JSON: Symbol('running-package-json'),
  DRY_RUN: Symbol('dry-run'),
});

// Script
const PROGRAM_NAME = 'cbf';
const ScriptKeys = Object.freeze({
  DIRECTORY: 'directory',
  COMMAND: 'command',
  OPTIONS: 'options',
  MESSAGE: 'message',
  VARIABLES: 'variables',
});
const ScriptTypes = Object.freeze({
  SIMPLE: 'simple',
  ADVANCED: 'advanced',
});
const OperationTypes = Object.freeze({
  DELETE_ALL: Symbol('delete-all'),
  DELETE: Symbol('delete'),
  DOCUMENTED: Symbol('documented'),
  DRY_RUN: Symbol('dry-run'),
  JSON: Symbol('json'),
  LIST: Symbol('list'),
  PRINT: Symbol('print'),
  RUN: Symbol('run'),
  SAVE: Symbol('save'),
  SHELL: Symbol('shell'),
  NPM_ALIAS: Symbol('npm-alias'),
});
const SCRIPT_EXTENSIONS = ['.yml', '.simple.yml', '.json', '.simple.json'];
const DEFAULT_OPTIONS_MESSAGE = 'Choose an option';
const HELP_COMMAND = `help ${chalk.yellow.bold('?')}`;
const BACK_COMMAND = `back ${chalk.blue.bold('↑')}`;
const QUIT_COMMAND = `quit ${chalk.red.bold('⦸')}`;
const CHOICE_DOCUMENTATION = [
  chalk.blue.bold('→'),
  chalk.blue.bold('↓'),
  chalk.magenta.bold('♚'),
  chalk.magenta.bold('♛'),
  chalk.magenta.bold('♜'),
  chalk.magenta.bold('♝'),
  chalk.magenta.bold('♞'),
  chalk.magenta.bold('♟'),
];

// Links
const NPM_LINK = 'https://www.npmjs.com/package/cbf';
const GITHUB_LINK = 'https://github.com/joshuatvernon/cbf';

// Paths
const DEFAULT_SHELL = '/bin/bash';
const DEFAULT_NPM_ALIAS = 'npm';
const CONFIG_FILE_PATH = `${__dirname}/../../config/config.json`;
const SCRIPTS_DIRECTORY_PATH = `${__dirname}/../../config/scripts`;
const LOCAL_YAML_FILE_NAME = `${PROGRAM_NAME}.yml`;
const PATH_TO_LOCAL_YAML = `${process.cwd()}/${LOCAL_YAML_FILE_NAME}`;
const LOCAL_SIMPLE_YAML_FILE_NAME = `${PROGRAM_NAME}.simple.yml`;
const PATH_TO_LOCAL_SIMPLE_YAML = `${process.cwd()}/${LOCAL_SIMPLE_YAML_FILE_NAME}`;
const LOCAL_JSON_FILE_NAME = `${PROGRAM_NAME}.yml`;
const PATH_TO_LOCAL_JSON = `${process.cwd()}/${LOCAL_JSON_FILE_NAME}`;
const PATH_TO_PACKAGE_JSON = 'package.json';
const LOCAL_SIMPLE_JSON_FILE_NAME = `${PROGRAM_NAME}.simple.yml`;
const PATH_TO_LOCAL_SIMPLE_JSON = `${process.cwd()}/${LOCAL_SIMPLE_JSON_FILE_NAME}`;
const PACKAGE_JSON_SCRIPTS_PROPERTY = 'scripts';

// Colours
const PRIMARY_COLOUR = 'cyan';
const SECONDARY_COLOUR = 'magenta';
const ERROR_COLOUR = 'red';

// Formatting
const KEY_SEPARATOR = '.';
const SIMPLE_SCRIPT_OPTION_SEPARATOR = ':';
const DEFAULT_SEPARATOR = ', ';
const JSON_SPACES_FORMATTING = 2;

module.exports = {
  Env,
  OperatingModes,
  PROGRAM_NAME,
  ScriptKeys,
  ScriptTypes,
  OperationTypes,
  SCRIPT_EXTENSIONS,
  DEFAULT_OPTIONS_MESSAGE,
  HELP_COMMAND,
  BACK_COMMAND,
  QUIT_COMMAND,
  CHOICE_DOCUMENTATION,
  NPM_LINK,
  GITHUB_LINK,
  DEFAULT_SHELL,
  DEFAULT_NPM_ALIAS,
  CONFIG_FILE_PATH,
  SCRIPTS_DIRECTORY_PATH,
  LOCAL_YAML_FILE_NAME,
  PATH_TO_LOCAL_YAML,
  LOCAL_SIMPLE_YAML_FILE_NAME,
  PATH_TO_LOCAL_SIMPLE_YAML,
  LOCAL_JSON_FILE_NAME,
  PATH_TO_LOCAL_JSON,
  LOCAL_SIMPLE_JSON_FILE_NAME,
  PATH_TO_LOCAL_SIMPLE_JSON,
  PATH_TO_PACKAGE_JSON,
  PACKAGE_JSON_SCRIPTS_PROPERTY,
  PRIMARY_COLOUR,
  SECONDARY_COLOUR,
  ERROR_COLOUR,
  KEY_SEPARATOR,
  SIMPLE_SCRIPT_OPTION_SEPARATOR,
  DEFAULT_SEPARATOR,
  JSON_SPACES_FORMATTING,
};
