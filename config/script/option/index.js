#!/usr/bin/env node

const DEFAULT_OPTION_TYPE = 'list';

class Option {

    constructor(name, message, choices) {
        this.type = DEFAULT_OPTION_TYPE;
        this.name = name;
        this.message = message;
        this.choices = choices;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    getMessage() {
        return this.message;
    }

    setMessage(message) {
        this.message = message;
    }

    getChoices() {
        return this.choices;
    }

    setChoices(choices) {
        this.choices = choices;
    }

}

module.exports = Option;
