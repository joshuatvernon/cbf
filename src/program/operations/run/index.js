#!/usr/bin/env node

const {
  GlobalConfig,
} = require('../../../config');
const {
  Parser,
} = require('../../../parser');
const {
  print,
  ERROR,
} = require('../../../messages');
const {
  safeExit,
  isValidYamlFileName,
} = require('../../../utility');
const Menu = require('../../../menu');
const Operation = require('../operation');

const loadAndRunCbfFile = (ymlFilename) => {
  Parser.runScript(ymlFilename);
};

const handler = (args) => {
  GlobalConfig.load();
  if (Object.keys(GlobalConfig.getScripts()).length === 0) {
    if (args.length === 0) {
      print(ERROR, 'noSavedScripts');
      safeExit();
    } else {
      const ymlFilename = args[0];
      loadAndRunCbfFile(ymlFilename);
    }
  } else if (args.length === 0) {
    const menu = new Menu({
      operationName: operation.name,
      operationRun: operation.run,
    });
    menu.run();
  } else {
    const scriptNameOrYmlFilename = args[0];
    if (isValidYamlFileName(scriptNameOrYmlFilename)) {
      const ymlFilename = args[0];
      loadAndRunCbfFile(ymlFilename);
    } else {
      const script = GlobalConfig.getScript(scriptNameOrYmlFilename);
      if (script) {
        script.run();
      } else {
        print(ERROR, 'scriptDoesNotExist', scriptNameOrYmlFilename);
        safeExit();
      }
    }
  }
};

const operation = {
  name: 'run',
  flag: 'r',
  description: 'run a previously saved script',
  args: [{
    name: 'script name',
    required: false,
  }],
  whitelist: ['documented'],
  run: handler,
};

module.exports = new Operation(operation);
