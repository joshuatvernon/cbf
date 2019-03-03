#!/usr/bin/env node

const unsortedOptions = {
    list: {
        name: 'list',
        flag: 'l',
        description: 'list previously saved scripts',
        args: []
    },
    save: {
        name: 'save',
        flag: 's',
        description: 'process and save a script',
        args: ['path to .yml file']
    },
    add: {
        name: 'add',
        flag: 'a',
        description: 'add a command to a previously saved script',
        args: ['script name']
    },
    update: {
        name: 'update',
        flag: 'u',
        description: 'process and update a script',
        args: ['script name', 'path to .yml file']
    },
    run: {
        name: 'run',
        flag: 'r',
        description: 'run a previously saved script',
        args: ['script name']
    },
    delete: {
        name: 'delete',
        flag: 'd',
        description: 'delete a previously saved script',
        args: ['script name']
    },
    documented: {
        name: 'documented',
        flag: 'D',
        description: 'prepends the command to the questions when running a script',
        args: []
    },
    deleteAll: {
        name: 'deleteAll',
        flag: 'A',
        description: 'delete all previously saved scripts',
        args: []
    },
    print: {
        name: 'print',
        flag: 'p',
        description: 'print a saved script',
        args: []
    },
    shell: {
        name: 'shell',
        flag: 'S',
        description: 'set the which shell should run commands',
        args: []
    },
    config: {
        name: 'config',
        flag: 'c',
        description: 'display configuration',
        args: []
    }
};

const sortedOptions = {};
Object.keys(unsortedOptions).sort().forEach((key, value) => sortedOptions[key] = unsortedOptions[key]);

exports.options = sortedOptions;
