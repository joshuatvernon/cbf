#!/usr/bin/env node

const inquirer = require('inquirer');
const rx = require('rxjs');

const prompts = new rx.Subject();
const inquirerPrompts = inquirer.prompt(prompts).ui.process;

module.exports = {
    prompts: prompts,
    inquirerPrompts: inquirerPrompts
};
