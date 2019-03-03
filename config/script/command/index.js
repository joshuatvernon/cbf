#!/usr/bin/env node

class Command {

    constructor(name, message, command) {
        this.name = name;
        this.message = message;
        this.command = command;
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

    getCommand() {
        return this.command;
    }

    setCommand(command) {
        this.command = command;
    }

}

module.exports = Command;
