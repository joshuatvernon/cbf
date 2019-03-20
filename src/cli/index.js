#!/usr/bin/env node

const changeCase = require('change-case');
const fse = require('fs-extra');

const {
    GlobalConfig
} = require('src/config');
const {
    Operations,
    OperationTypes
} = require('src/program');
const {
    PATH_TO_LOCAL_YML
} = require('src/constants');
const {
    Parser
} = require('src/parser');
const {
    commander
} = require('src/shims/commander');
const {
    isValidArgumentsLength,
    safeExit
} = require('src/utility');
const {
    print,
    ERROR
} = require('src/messages');
const Menu = require('src/menu');

const validateArgumentLength = (operation, args) => {
    const minimumArgumentsLength = operation.args.filter(arg => arg.required).length;
    const maximumArgumentsLength = operation.args.length;
    if (!isValidArgumentsLength({
            actual: args.length,
            min: minimumArgumentsLength,
            max: maximumArgumentsLength
        })) {
        print(ERROR, 'invalidNumberOfArgs', operation.name, minimumArgumentsLength, maximumArgumentsLength, args.length);
        safeExit();
    }
}

const getArguments = () => {
    const args = process.argv.slice(2);
    return args.filter(arg => arg.indexOf('--') === -1 && arg.indexOf('-') !== 0);
}

const hasMutuallyExclusiveOperations = operations => {
    return operations.some(operation => {
        return operations.some(otherOperation => {
            if (operation !== otherOperation && !operation.whitelist.includes(otherOperation.name)) {
                print(ERROR, 'invalidWhitelisted', operation.name, otherOperation.name);
                return true;
            }
        });
    });
}

const getOperationsFromCommander = () => {
    const operations = [];
    Object.keys(OperationTypes).forEach(operationType => {
        const operation = Operations.get(OperationTypes[operationType]);
        if (commander.hasOwnProperty(changeCase.camelCase(operation.name))) {
            operations.push(operation);
        }
    });
    return operations;
}

const hasLocalCbfFile = () => {
    return fse.existsSync(PATH_TO_LOCAL_YML);
}

const loadLocalCbfFile = () => {
    Parser.runScript(PATH_TO_LOCAL_YML);
}

const runMenuOrHelp = () => {
    GlobalConfig.load();
    if (Object.keys(GlobalConfig.getScripts()).length === 0) {
        commander.help();
    } else {
        const runOperation = Operations.get(OperationTypes.RUN);
        const menu = new Menu({
            operationName: runOperation.name,
            operationRun: runOperation.run
        });
        menu.run();
    }
}

const handleNoOperations = () => {
    if (hasLocalCbfFile()) {
        loadLocalCbfFile();
    } else {
        runMenuOrHelp();
    }
}

const handleArguments = () => {
    const operations = getOperationsFromCommander();

    if (operations.length === 0) {
        handleNoOperations();
    } else {
        if (hasMutuallyExclusiveOperations(operations)) {
            safeExit();
        }

        const args = getArguments();

        // Validate the arguments for all operations except `documented` which can be used in conjunction with the `run` operation
        const operationsWithoutDocumented = operations.filter(operation => operation !== Operations.get(OperationTypes.DOCUMENTED));
        operationsWithoutDocumented.forEach(operation => validateArgumentLength(operation, args));

        // TODO - change `documented` from an Operation to an OperatingMode so we can just run operations if they're valid and not have to filter out documented
        operations.forEach(operation => operation.run(args));

        if (operationsWithoutDocumented.length === 0) {
            handleNoOperations();
        }
    }
}

const formatArguments = args => {
    return args.map(arg => arg.required ? `<${arg.name}>` : `[${arg.name}]`).join(' ');
}

const addOperationsToCommander = () => {
    Object.keys(OperationTypes).forEach(operationType => {
        const operation = Operations.get(OperationTypes[operationType]);
        const details = `-${operation.flag}, --${operation.name} ${formatArguments(operation.args)}`;
        const description = `${operation.description.toLowerCase()}`;
        commander.option(details, description);
    });
};

const init = () => {
    commander.version('1.0.5');
    commander.usage('[options]');
    addOperationsToCommander();
    commander.parse(process.argv);
    handleArguments();
}

module.exports = {
    init: init
}
