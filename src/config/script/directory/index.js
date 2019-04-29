#!/usr/bin/env node

const lodash = require('lodash');

const { throwError } = require('../../../utility');

class Directory {

    constructor(path = '') {
        this.path = path;
    }

    static copy(directory) {
        if (!(directory instanceof Directory)) {
            throwError(`Directory.copy expects a Directory instance but instead recieved a ${(directory).constructor.name} instance`);
        }
        return lodash.cloneDeep(directory);
    }

    /**
     * Returns the directories path
     *
     * @returns directories path
     */
    getPath() {
        return this.path;
    }

    /**
     * Updates the directories path
     *
     * @argument string path - path to update the directories path
     */
    updatePath(path) {
        this.path = path;
    }

}

module.exports = Directory;
