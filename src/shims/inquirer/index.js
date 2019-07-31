#!/usr/bin/env node

const inquirer = require('inquirer');
const rx = require('rxjs');

const prompts = new rx.Subject();
const inquirerPrompts = inquirer.prompt(prompts).ui.process;

const InquirerPromptTypes = Object.freeze({
  LIST: 'list',
  RAW_LIST: 'rawlist',
  EXPAND: 'expand',
  CHECKBOX: 'checkbox',
  CONFIRM: 'confirm',
  INPUT: 'input',
  NUMBER: 'number',
  PASSWORD: 'password',
  EDITOR: 'editor',
});

module.exports = {
  prompts,
  inquirerPrompts,
  InquirerPromptTypes,
};
