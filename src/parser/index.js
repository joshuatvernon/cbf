#!/usr/bin/env node

const {
    GlobalConfig
} = require('../config');
const {
    Script,
    Option,
    Command,
    Directory
} = require('../config/script');
const {
    getFirstKey,
    getNameFromKey,
    isValidYamlFileName,
    loadYmlFile
} = require('../utility');
const {
    print,
    MESSAGE,
    ERROR
} = require('../messages');

/**
 * Helper to recursively parse script
 *
 * @argument Script scriptName - name of the new script
 * @argument Object ymlFile    - the script converted from the yml file
 * @argument string key        - current ymlFile key to be parsed
 */
const parseScriptRecurse = (scriptName, ymlFile, key) => {
    if (ymlFile.hasOwnProperty('directory')) {
        const directory = new Directory(ymlFile['directory']);
        GlobalConfig.getScript(scriptName).updateDirectory({
            directoryKey: key,
            directory: directory
        });
    }
    if (ymlFile.hasOwnProperty('command')) {
        let directives = [];
        if (typeof ymlFile['command'] === "string") {
            directives.push(ymlFile['command']);
        } else {
            let line = 1;
            while (ymlFile['command'].hasOwnProperty(line)) {
                directives.push(ymlFile['command'][line]);
                line++;
            }
        }

        const command = new Command({
            directives: directives
        });

        if (ymlFile.hasOwnProperty('message')) {
            command.updateMessage(ymlFile['message']);
        }

        GlobalConfig.getScript(scriptName).updateCommand({
            commandKey: key,
            command: command
        });
    } else if (ymlFile.hasOwnProperty('options')) {
        let choices = [];
        for (let option in ymlFile['options']) {
            parseScriptRecurse(scriptName, ymlFile['options'][option], key + '.' + option);
            choices.push(option);
        }

        if (key !== scriptName) {
            // If not top level add default back option to every option to be able to second last option to go back
            choices.push('back');
        }

        // add default quit option so as to be able to display last option before quitting
        choices.push('quit');
        const option = new Option({
            name: getNameFromKey(key),
            choices: choices
        });
        if (ymlFile.hasOwnProperty('message')) {
            option.updateMessage(ymlFile['message']);
        }
        GlobalConfig.getScript(scriptName).updateOption({
            optionKey: key,
            option: option
        });
    }
}

class Parser {

    /**
     * Parse a yml file into commands, options, messages and directories but only
     * store them as a script in the config in memory
     *
     * @argument Object ymlFileName - the name of the yml file to be loaded and parsed
     */
    static runScript(ymlFileName) {
        if (isValidYamlFileName(ymlFileName)) {
            const ymlFile = loadYmlFile(ymlFileName);
            const script = new Script({
                name: getFirstKey(ymlFile)
            });
            GlobalConfig.addScript(script);
            parseScriptRecurse(script.getName(), ymlFile[script.getName()], script.getName());
            print(MESSAGE, 'loadedScript', script.getName());
            script.run();
        } else {
            if (ymlFileName === true) {
                print(ERROR, 'noYmlFile');
            } else {
                print(ERROR, 'invalidYmlFile', ymlFileName);
            }
        }
    }

    /**
     * Parse a yml file into commands, options, messages and directories and store
     * them as a script in the config
     *
     * @argument Object ymlFileName - the name of the yml file to be loaded and parsed
     */
    static saveScript(ymlFileName) {
        if (isValidYamlFileName(ymlFileName)) {
            const ymlFile = loadYmlFile(ymlFileName);
            const script = new Script({
                name: getFirstKey(ymlFile)
            });
            GlobalConfig.load();
            if (!GlobalConfig.getScript(script.getName())) {
                GlobalConfig.addScript(script);
                parseScriptRecurse(script.getName(), ymlFile[script.getName()], script.getName());
                GlobalConfig.save();
                print(MESSAGE, 'savedScript', script.getName());
            } else {
                print(MESSAGE, 'duplicateScript', script.getName(), ymlFileName);
            }
        } else {
            if (ymlFileName === true) {
                print(ERROR, 'noYmlFile');
            } else {
                print(ERROR, 'invalidYmlFile', ymlFileName);
            }
        }
    }

    /**
     * Parse a yml file into commands, options, messages and directories and replace
     * them as the commands, options, messages and directories for the script in the config
     *
     * @argument Object ymlFileName - the name of the yml file to be loaded and parsed
     */
    static updateScript(ymlFileName) {
        if (isValidYamlFileName(ymlFileName)) {
            const ymlFile = loadYmlFile(ymlFileName);
            const script = new Script({
                name: getFirstKey(ymlFile)
            });
            GlobalConfig.load();
            if (GlobalConfig.getScript(script.getName())) {
                GlobalConfig.updateScript(script);
                parseScriptRecurse(script.getName(), ymlFile[script.getName()], script.getName());
                GlobalConfig.save();

                print(MESSAGE, 'updatedScript', script.getName());
            } else {
                print(ERROR, 'scriptNotUpdated', script.getName(), ymlFileName);
            }
        } else {
            if (ymlFileName === true) {
                print(ERROR, 'noYmlFile');
            } else {
                print(ERROR, 'invalidYmlFile', ymlFileName);
            }
        }
    }

}

module.exports = {
    Parser: Parser
}
