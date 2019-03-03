#!/usr/bin/env node

const DEFAULT_SHELL = '/bin/bash';
const CONFIG_FILE_PATH = __dirname + '/config.json';

class Config {

    constructor() {
        this.shell = DEFAULT_SHELL;
        this.scripts = {};
    }

    save() {

    }

    load() {

    }

    getShell() {
        return this.shell;
    }

    setShell(shell) {
        this.shell = shell;
    }

    getScripts() {
        return this.scripts;
    }

    getScript(scriptName) {
        if (this.scripts.hasOwnProperty(scriptName)) {
            return this.scripts[scriptName];
        }
        throw `Config doesn't contain a script named ${scriptName}`;
    }

    setScripts(scripts) {
        this.scripts = scripts;
    }

    addScript(script) {
        if (this.scripts.hasOwnProperty(script.name)) {
            throw `Config already contains a script named ${script.name}`;
        } else {
            this.scripts[script.name] = script;
        }
    }

    updateScript(script) {
        if (this.scripts.hasOwnProperty(script.name)) {
            this.scripts[script.name] = script;
        }
    }

    removeScript(script) {
        if (this.scripts[script.name]) {
            delete this.scripts[script.name];
        }
    }

}

module.exports = Config;
