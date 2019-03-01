#!/usr/bin/env node

class CommandAdder {
    constructor() {
        this.index = 0;
        this.questions = [
            {
                message: "command name:",
                type: "input",
                name: "name",
                validate: (commandName) => commandName !== ''
            },
            {
                message: "message (optional):",
                type: "input",
                name: "message",
            },
            {
                message: "directory (optional):",
                type: "input",
                name: "directory",
            },
            {
                message: "command:",
                type: "input",
                name: "command",
                validate: (command) => command !== ''
            },
        ];
        this.answers = {
            name: '',
            commandMessage: '',
            directory: '',
            command: ''
        };
    }

    nextQuestion() {
        this.index += 1;
        if (this.index > this.questions.length) {
            return undefined;
        }
        return this.questions[this.index - 1];
    }

    nextAnswer(answer) {
        const answerKey = Object.keys(this.answers)[this.index - 1];
        this.answers[answerKey] = answer;
    }
}

module.exports = CommandAdder;
