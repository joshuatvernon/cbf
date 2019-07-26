#!/usr/bin/env node

const chalk = require('chalk');

const PROGRAM_NAME = 'cbf';
const NPM_LINK = 'https://www.npmjs.com/package/cbf';
const GITHUB_LINK = 'https://github.com/joshuatvernon/cbf';
const DEFAULT_SHELL = '/bin/bash';
const CONFIG_FILE_PATH = `${__dirname}/../config/config.json`;
const LOCAL_YML_FILE_NAME = `${PROGRAM_NAME}.yml`;
const PATH_TO_LOCAL_YML = `${process.cwd()}/${LOCAL_YML_FILE_NAME}`;
const BACK_COMMAND = `back ${chalk.blue.bold('↑')}`;
const QUIT_COMMAND = `quit ${chalk.red.bold('⦸')}`;
const DEFAULT_SEPARATOR = ', ';
const PRIMARY_COLOUR = 'cyan';
const SECONDARY_COLOUR = 'magenta';
const ERROR_COLOUR = 'red';

module.exports = {
  PROGRAM_NAME,
  NPM_LINK,
  GITHUB_LINK,
  DEFAULT_SHELL,
  CONFIG_FILE_PATH,
  LOCAL_YML_FILE_NAME,
  PATH_TO_LOCAL_YML,
  BACK_COMMAND,
  QUIT_COMMAND,
  DEFAULT_SEPARATOR,
  PRIMARY_COLOUR,
  SECONDARY_COLOUR,
  ERROR_COLOUR,
};
