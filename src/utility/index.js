#!/usr/bin/env node

const chalk = require('chalk');
const yaml = require('yamljs');
const os = require('os');
const path = require("path");

const {
    print,
    ERROR
} = require('src/messages');
const {
    prompts
} = require('src/shims/inquirer');

/**
 * Throw an error with an optional error message
 *
 * @argumemt string errorMessage - an error message to display to the user when throwing the error
 */
const throwError = (errorMessage = '') => {
    if (errorMessage) {
        throw errorMessage;
    }
    throw 'Unknown error';
}

/**
 * Return true if string contains any whitespace and flase otherwise
 *
 * @argument string string              - string to check for whitespace
 *
 * @returns  boolean containsWhiteSpace - true if string contained white space; false otherwise
 */
const containsWhitespace = string => {
    return string !== string.trim();
}

/**
 * Replace the whitespace with the provided character and return string
 *
 * @argument string string - string to replace whitespace in
 * @argument string other  - string to replace whitespace with
 *
 * @returns  newString     - strign without whitespace
 */
const replaceWhitespace = (string, other) => {
    let newString = `${string}`;
    return newString.replace(/\s+/g, other);
}

/**
 * Returns true if string is empty and false otherwise
 *
 * @argument string string        - string to check if empty string
 *
 * @returns boolean isEmptyString - true if string was empty string and false otherwise
 */
const isEmptyString = string => string === '';

/**
 * Print json for debugging
 *
 * @argument Object obj object to be printed as coloured JSON
 * @argument string colour colour to print the JSON
 */
const printJson = (obj, colour) => {
    console.log(chalk[colour].bold(JSON.stringify(obj, null, 4)));
};

/**
 * Check if a file path ends in a valid .yaml file name
 *
 * @argument string fileName - a .yml file name to validate
 *
 * @returns boolean isValid  - true if file is a valid .yml file path
 */
const isValidYamlFileName = (fileName) => {
    return /.*\.yml/.test(fileName);
};

/**
 * Load a .yml file into the program
 *
 * @argument {string} ymlFileName - yml file to load
 *
 * @returns {Object} ymlFile      - yml file
 */
const loadYmlFile = (ymlFileName) => {
    let ymlFile;
    try {
        ymlFile = yaml.load(ymlFileName);
    } catch (exception) {
        print(ERROR, 'errorLoadingYmlFile', ymlFileName, exception.message);
        forceExit();
    }
    return ymlFile;
};


/**
 * Return the first key in an object
 *
 * @argument Object object  - the object to get the first key from
 *
 * @returns string firstKey - the first key encountered
 */
const getFirstKey = (object) => {
    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            return key;
        }
    }
};

/**
 * Return the name of the key (which is just the last word after the last period)
 *
 * @argument string key - key to use to return the name from
 *
 * @returns string name - the name of the key
 */
const getNameFromKey = (key) => {
    return key.split('.').pop();
};

/**
 * Return the key of the parent (the key is everything before the last occurance of a period)
 *
 * @argument string key      - key to use to return the parent key from
 *
 * @returns string parentKey - the key of the parent
 */
const getParentKey = (key) => {
    return key.substr(0, key.lastIndexOf('.'));
};

/**
 * Return choice with command directive stripped
 *
 * @argument string documentedChoice  - documented choice to be undocumented
 *
 * @returns string undocumentedChoice - choice with documented command directive stripped
 */
const getUndocumentedChoice = (documentedChoice) => {
    return documentedChoice.split(` ${chalk.blue.bold('=>')}`)[0];
};

/**
 * Return choices with command directives appended to commands
 *
 * @argument Script script          - script to lookup options and commands
 * @argument string optionKey       - key of the option having it's choices documented
 * @argument string choice          - choice to be documented
 *
 * @returns string documentedChoice - choice with command directives appended to commands
 */
const getDocumentedChoice = (script, optionKey, choice) => {
    const commandKey = `${optionKey}.${choice}`;
    const command = script.getCommand(commandKey);
    if (command) {
        const directives = command.getDirectives();
        if (directives.length === 1) {
            return `${choice} ${chalk.blue.bold('=>')} ${chalk.red.bold(directives[0])}`;
        }
        return `${choice} ${chalk.blue.bold('=>')} ${chalk.red.bold(directives[0])} . . .`;
    }
    return choice;
};

/**
 * Return choices with command directives appended to commands
 *
 * @argument Script script             - script to lookup options and commands
 * @argument string optionKey          - key of the option having it's choices documented
 * @argument string[] choices          - choices to be documented
 *
 * @returns string[] documentedChoices - choices with command directives appended to commands
 */
const getDocumentedChoices = (script, optionKey, choices) => {
    return choices.map(choice => getDocumentedChoice(script, optionKey, choice));
};

/**
 * Returns true if arguments length is valid and false otherwise
 *
 * @argument Number actual      - actual argument length
 * @argument Number exact       - exact argument length expected
 * @argument Number min         - minimum argument length expected
 * @argument Number max         - maximum argument length expected
 *
 * @returns boolean validLength - true if argument length is valid; false otherwise
 */
const isValidArgumentsLength = ({
    actual,
    min,
    max,
    exact
}) => {
    let validLength = true;
    if (typeof exact !== 'undefined' && exact !== actual) {
        validLength = false;
    }
    if (typeof min !== 'undefined' && min > actual) {
        validLength = false;
    }
    if (typeof max !== 'undefined' && max < actual) {
        validLength = false;
    }
    return validLength;
}

/**
 * If path is a relative path; resolve it and return absolute path
 *
 * @argument string relativePath - a relative path to be converted to an absolute path
 *
 * @returns string absolutePath  - an absolute path converted from the relative path
 */
const absolutePath = relativePath => {
    if (relativePath[0] === '~') {
        return path.resolve(path.join(os.homedir(), relativePath.slice(1)));
    }
    return relativePath;
}

/**
 * Cleans up and then exits program
 */
const safeExit = () => {
    prompts.complete();
}


/**
 * Force exits program
 */
const forceExit = () => {
    prompts.complete();
    process.exit();
}

module.exports = {
    absolutePath: absolutePath,
    safeExit: safeExit,
    forceExit: forceExit,
    isValidArgumentsLength: isValidArgumentsLength,
    getUndocumentedChoice: getUndocumentedChoice,
    getDocumentedChoices: getDocumentedChoices,
    printJson: printJson,
    containsWhitespace: containsWhitespace,
    replaceWhitespace: replaceWhitespace,
    isEmptyString: isEmptyString,
    isValidYamlFileName: isValidYamlFileName,
    loadYmlFile: loadYmlFile,
    getFirstKey: getFirstKey,
    getNameFromKey: getNameFromKey,
    getParentKey: getParentKey,
    throwError: throwError
};
