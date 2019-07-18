#!/usr/bin/env node

const chalk = require('chalk');

const PROGRAM_NAME = 'cbf';
const DEFAULT_SHELL = '/bin/bash';
const CONFIG_FILE_PATH = `${__dirname}/../config/config.json`;
const LOCAL_YML_FILE_NAME = `${PROGRAM_NAME}.yml`;
const PATH_TO_LOCAL_YML = `${process.cwd()}/${LOCAL_YML_FILE_NAME}`;
const BACK_COMMAND = `back ${chalk.blue.bold('↑')}`;
const QUIT_COMMAND = `quit ${chalk.red.bold('⦸')}`;
const ADD_COMMAND = `add ${chalk.magenta.bold('+')}`;
const Modification = Object.freeze({
  ADD_COMMAND: Symbol('add-command'),
});

module.exports = {
  PROGRAM_NAME,
  DEFAULT_SHELL,
  CONFIG_FILE_PATH,
  LOCAL_YML_FILE_NAME,
  PATH_TO_LOCAL_YML,
  BACK_COMMAND,
  QUIT_COMMAND,
  ADD_COMMAND,
  Modification,
};
