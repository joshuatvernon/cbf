#!/usr/bin/env node

class CommandAdder {
  constructor() {
    this.index = 0;
    this.questions = [{
      message: 'command name:',
      type: 'input',
      name: 'name',
      validate: name => name !== '',
    },
    {
      message: 'message (optional):',
      type: 'input',
      name: 'message',
    },
    {
      message: 'directory (optional):',
      type: 'input',
      name: 'path',
    },
    {
      message: 'command:',
      type: 'input',
      name: 'directive',
      validate: directive => directive !== '',
    },
    ];
    this.answers = {
      name: '',
      message: '',
      path: '',
      directive: '',
    };
  }

  /**
     * Returns the next question
     *
     * @returns next question
     */
  nextQuestion() {
    this.index += 1;
    if (this.index > this.questions.length) {
      return undefined;
    }
    return this.questions[this.index - 1];
  }

  /**
     * Answers the next question
     *
     * @argument string answer to the next question
     */
  nextAnswer(answer) {
    const answerKey = Object.keys(this.answers)[this.index - 1];
    this.answers[answerKey] = answer;
  }
}

module.exports = CommandAdder;
