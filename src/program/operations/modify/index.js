#!/usr/bin/env node

const chalk = require('chalk');
const noop = require('lodash/noop');
const isEmpty = require('lodash/isEmpty');

const {
  ADD_COMMAND,
  Modification,
} = require('../../../constants');
const {
  GlobalConfig,
} = require('../../../config');
const {
  Script,
  Command,
  Directory,
} = require('../../../config/script');
const {
  endsWithWhitespace,
  replaceWhitespace,
  isEmptyString,
  safeExit,
} = require('../../../utility');
const {
  print,
  ERROR,
  MESSAGE,
} = require('../../../messages');
const {
  prompts,
  inquirerPrompts,
} = require('../../../shims/inquirer');
const CommandAdder = require('../../../command-adder');
const Menu = require('../../../menu');
const Operation = require('../operation');

const addCommandToOptionChoices = ({
  script,
  optionKey,
  answers,
}) => {
  const option = script.getOption(optionKey);
  const choices = option.getChoices();
  if (!choices.includes(answers.name)) {
    let index;
    if (choices.indexOf('back') > -1) {
      index = choices.indexOf('back');
    } else {
      index = choices.indexOf('quit');
    }
    choices.splice(index, 0, answers.name);
  }
  option.updateChoices(choices);
};

const addCommand = ({
  script,
  optionKey,
  commandKey,
  command,
  answers,
}) => {
  script.addCommand({
    commandKey,
    command,
  });
  if (answers.path) {
    const directory = new Directory(answers.path);
    script.updateDirectory({
      directoryKey: commandKey,
      directory,
    });
  }
  addCommandToOptionChoices({
    script,
    optionKey,
    answers,
  });
  GlobalConfig.save();
  print(MESSAGE, 'savedNewCommand', answers.name, script.getName());
};

const getUpdateCommandPrompt = (answers) => {
  let prompt = `Replace ${chalk.magenta.bold(answers.name)} with ${chalk.magenta.bold(answers.directive)} command`;
  if (!isEmptyString(answers.message) && isEmptyString(answers.path)) {
    prompt += ` and ${chalk.magenta.bold(answers.message)} message?`;
  } else if (isEmptyString(answers.message) && !isEmptyString(answers.path)) {
    prompt += ` and ${chalk.magenta.bold(answers.path)} directory?`;
  } else if (!isEmptyString(answers.message) && !isEmptyString(answers.path)) {
    prompt += `, ${chalk.magenta.bold(answers.message)} message and ${chalk.magenta.bold(answers.path)} directory?`;
  }
  return prompt;
};

const updateCommand = ({
  script,
  optionKey,
  commandKey,
  command,
  answers,
}) => {
  const promptsSubscription = prompts.subscribe(({
    answer,
  }) => {
    if (answer) {
      script.updateCommand({
        commandKey,
        command,
      });
      if (answers.path) {
        const directory = new Directory(answers.path);
        script.updateDirectory({
          directoryKey: commandKey,
          directory,
        });
      }
      addCommandToOptionChoices({
        script,
        optionKey,
        answers,
      });
      GlobalConfig.save();
      print(MESSAGE, 'replacedCommand', answers.name, answers.directive);
    } else {
      print(MESSAGE, 'didNotReplaceCommand', answers.name, answers.directive);
    }
    promptsSubscription.unsubscribe();
    prompts.complete();
  }, noop, noop);

  // Add's a new line before the question asking user if they want to update command is printed
  // eslint-disable-next-line no-console
  console.log('');

  prompts.next({
    type: 'confirm',
    name: 'confirm-replace-command',
    message: getUpdateCommandPrompt(answers),
  });
};

const addNewCommand = ({
  script,
  optionKey,
}) => {
  const commandAdder = new CommandAdder();

  // add's a new line before the questions asking user to describe new command
  print(MESSAGE, 'addingCommandTitle');

  const promptsSubscription = inquirerPrompts.subscribe(({
    answer,
  }) => {
    commandAdder.nextAnswer(answer);
    const question = commandAdder.nextQuestion();
    if (question) {
      inquirerPrompts.next(question);
    } else {
      promptsSubscription.unsubscribe();

      let key = commandAdder.answers.name;
      if (endsWithWhitespace(key)) {
        key = replaceWhitespace(key, '.');
      }
      const commandKey = `${optionKey}.${key}`;
      const command = new Command({
        directive: commandAdder.answers.directive,
        message: commandAdder.answers.message,
      });
      if (script.getCommand(commandKey)) {
        updateCommand({
          script,
          optionKey,
          commandKey,
          command,
          answers: commandAdder.answers,
        });
      } else {
        addCommand({
          script,
          optionKey,
          commandKey,
          command,
          answers: commandAdder.answers,
        });
      }
      inquirerPrompts.complete();
    }
  }, (err) => {
    // eslint-disable-next-line no-console
    console.warn(err);
  }, () => {});

  inquirerPrompts.next(commandAdder.nextQuestion());
};

const getOptionChoicesWithAddingChoices = (script, optionKey) => {
  const choices = script.getOption(optionKey).getChoices();

  let index;
  if (choices.indexOf('back') > -1) {
    index = choices.indexOf('back');
  } else {
    index = choices.indexOf('quit');
  }

  // Append adding commands just before `back` and `quit`
  choices.splice(index, 0, ADD_COMMAND);

  return choices;
};

const getOptionChoicesWithoutCommands = (script, optionKey) => {
  const choices = script.getOption(optionKey).getChoices();
  return choices.filter((choice) => {
    let key = choice;
    if (endsWithWhitespace(key)) {
      key = replaceWhitespace(key);
    }
    return !script.getCommand(`${optionKey}.${key}`);
  });
};

const getScriptModifiedForAdding = (script) => {
  const copiedScript = Script.copy(script);

  Object.keys(copiedScript.getOptions()).forEach((optionKey) => {
    const option = copiedScript.getOption(optionKey);
    const modifiedMessage = `Add a ${chalk.magenta.bold('command')} to ${chalk.cyan.bold(option.getMessage())}`;
    option.updateMessage(modifiedMessage);
    option.updateChoices(getOptionChoicesWithoutCommands(copiedScript, optionKey));
    option.updateChoices(getOptionChoicesWithAddingChoices(copiedScript, optionKey));
  });

  return copiedScript;
};

const handler = (args) => {
  GlobalConfig.load();
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    print(ERROR, 'noSavedScripts');
    safeExit();
  } else if (isEmpty(args)) {
    const menu = new Menu({
      operationName: operation.name,
      operationRun: operation.run,
    });
    menu.run();
  } else {
    const scriptName = args[0];
    GlobalConfig.load();
    const script = GlobalConfig.getScript(scriptName);
    if (script) {
      const scriptModifiedForAdding = getScriptModifiedForAdding(script);

      print(MESSAGE, 'runningScriptInModifyMode', scriptName);

      const promise = scriptModifiedForAdding.run();

      promise.then(({
        modification,
        optionKey,
      }) => {
        if (modification === Modification.ADD_COMMAND) {
          addNewCommand({
            script,
            optionKey,
          });
        }
      });
    } else {
      print(ERROR, 'scriptDoesNotExist', scriptName);
    }
  }
};

const operation = {
  name: 'modify',
  flag: 'm',
  description: 'modify a previously saved script',
  args: [{
    name: 'script name',
    required: false,
  }],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
