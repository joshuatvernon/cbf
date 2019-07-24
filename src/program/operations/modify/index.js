#!/usr/bin/env node

const noop = require('lodash/noop');
const isEmpty = require('lodash/isEmpty');
const isString = require('lodash/isString');

const isEmptyString = s => isString(s) && isEmpty(s);

const { BACK_COMMAND, QUIT_COMMAND, ADD_COMMAND, Modification } = require('../../../constants');
const { GlobalConfig } = require('../../../config');
const { Script, Command, Directory } = require('../../../config/script');
const {
  endsWithWhitespace,
  replaceWhitespace,
  safeExit,
  getUndocumentedChoices,
} = require('../../../utility');
const { printMessage, formatMessage } = require('../../../messages');
const globalMessages = require('../../../messages/messages');
const { prompts, inquirerPrompts } = require('../../../shims/inquirer');
const CommandAdder = require('../../../command-adder');
const Menu = require('../../../menu');
const Operation = require('../operation');

const messages = require('./messages');

const addCommandToOptionChoices = ({ script, optionKey, answers }) => {
  const option = script.getOption(optionKey);
  const choices = option.getChoices();
  if (!choices.includes(answers.name)) {
    let index;
    if (choices.indexOf(BACK_COMMAND) > -1) {
      index = choices.indexOf(BACK_COMMAND);
    } else {
      index = choices.indexOf(QUIT_COMMAND);
    }
    choices.splice(index, 0, answers.name);
  }
  option.updateChoices(getUndocumentedChoices(choices));
  script.updateOption({ optionKey, option });
};

const addCommand = ({ script, optionKey, commandKey, command, answers }) => {
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
  printMessage(
    formatMessage(messages.savedNewCommand, {
      commandName: answers.name,
      scriptName: script.getName(),
    }),
  );
};

const getUpdateCommandPrompt = answers => {
  let prompt = formatMessage(messages.replaceCommand, {
    commandName: answers.name,
    commandDirective: answers.directive,
  });
  if (!isEmptyString(answers.message) && isEmptyString(answers.path)) {
    prompt += formatMessage(messages.hasMessage, {
      message: answers.message,
    });
  } else if (isEmptyString(answers.message) && !isEmptyString(answers.path)) {
    prompt += formatMessage(messages.hasPath, {
      path: answers.path,
    });
  } else if (!isEmptyString(answers.message) && !isEmptyString(answers.path)) {
    prompt += formatMessage(messages.hasMessageAndHasPath, {
      message: answers.message,
      path: answers.path,
    });
  }
  return prompt;
};

const updateCommand = ({ script, optionKey, commandKey, command, answers }) => {
  const promptsSubscription = prompts.subscribe(
    ({ answer }) => {
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
        printMessage(
          formatMessage(messages.replacedCommand, {
            commandName: answers.name,
            commandDirective: answers.directive,
          }),
        );
      } else {
        printMessage(
          formatMessage(messages.didNotReplaceCommand, {
            commandName: answers.name,
            commandDirective: answers.directive,
          }),
        );
      }
      promptsSubscription.unsubscribe();
      prompts.complete();
    },
    noop,
    noop,
  );

  // Add's a new line before the question asking user if they want to update command is printed
  printMessage(formatMessage(globalMessages.emptyString));

  prompts.next({
    type: 'confirm',
    name: 'confirm-replace-command',
    message: getUpdateCommandPrompt(answers),
  });
};

const addNewCommand = ({ script, optionKey }) => {
  const commandAdder = new CommandAdder();

  // add's a new line before the questions asking user to describe new command
  printMessage(formatMessage(messages.addingCommandTitle));

  const promptsSubscription = inquirerPrompts.subscribe(
    ({ answer }) => {
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
          variables: [],
          directives: [commandAdder.answers.directive],
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
    },
    error => {
      // eslint-disable-next-line no-console
      console.warn(error);
    },
    () => {},
  );

  inquirerPrompts.next(commandAdder.nextQuestion());
};

const getOptionChoicesWithAddingChoices = (script, optionKey) => {
  const choices = script.getOption(optionKey).getChoices();

  let index;
  if (choices.indexOf(BACK_COMMAND) > -1) {
    index = choices.indexOf(BACK_COMMAND);
  } else {
    index = choices.indexOf(QUIT_COMMAND);
  }

  // Append adding commands just before `back` and `quit`
  choices.splice(index, 0, ADD_COMMAND);

  return choices;
};

const getOptionChoicesWithoutCommands = (script, optionKey) => {
  const choices = script.getOption(optionKey).getChoices();
  return choices.filter(choice => {
    let key = choice;
    if (endsWithWhitespace(key)) {
      key = replaceWhitespace(key);
    }
    return !script.getCommand(`${optionKey}.${key}`);
  });
};

const getScriptModifiedForAdding = script => {
  const copiedScript = Script.copy(script);

  Object.keys(copiedScript.getOptions()).forEach(optionKey => {
    const option = copiedScript.getOption(optionKey);
    const modifiedMessage = formatMessage(messages.modifiedMessage, {
      optionName: option.getName(),
    });
    option.updateMessage(modifiedMessage);
    option.updateChoices(
      getUndocumentedChoices(getOptionChoicesWithoutCommands(copiedScript, optionKey)),
    );
    copiedScript.updateOption({ optionKey, option });
    option.updateChoices(
      getUndocumentedChoices(getOptionChoicesWithAddingChoices(copiedScript, optionKey)),
    );
    copiedScript.updateOption({ optionKey, option });
  });

  return copiedScript;
};

const handler = args => {
  GlobalConfig.load();
  if (isEmpty(Object.keys(GlobalConfig.getScripts()))) {
    printMessage(formatMessage(globalMessages.noSavedScripts));
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

      printMessage(formatMessage(messages.runningScriptInModifyMode, { scriptName }));

      const promise = scriptModifiedForAdding.run();

      promise.then(({ modification, optionKey }) => {
        if (modification === Modification.ADD_COMMAND) {
          addNewCommand({
            script,
            optionKey,
          });
        }
      });
    } else {
      printMessage(
        formatMessage(globalMessages.scriptDoesNotExist, {
          scriptName,
        }),
      );
    }
  }
};

const operation = {
  name: 'modify',
  flag: 'm',
  description: 'modify a previously saved script',
  args: [
    {
      name: 'script name',
      required: false,
    },
  ],
  whitelist: [],
  run: handler,
};

module.exports = new Operation(operation);
