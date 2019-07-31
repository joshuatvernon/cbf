#!/usr/bin/env node

const path = require('path');

const fse = require('fs-extra');
const cloneDeep = require('lodash/cloneDeep');
const { printMessage, formatMessage } = require('formatted-messages');

const Parser = require('../parser');
const { CONFIG_FILE_PATH, SCRIPTS_DIRECTORY_PATH, DEFAULT_SHELL } = require('../constants');
const { throwError, deleteYamlFile } = require('../utility');

const messages = require('./messages');

const getConfig = () => JSON.parse(fse.readFileSync(CONFIG_FILE_PATH, 'utf8'));

/**
 * Config stores CBF settings and scripts in memory and saves them to config.json
 */
class Config {
  constructor({ shell = DEFAULT_SHELL, scriptNames = [], scripts = {} } = {}) {
    this.shell = shell;
    this.scriptNames = scriptNames;
    this.scripts = scripts;
  }

  static copy(config) {
    if (!(config instanceof Config)) {
      throwError(
        `Config.copy expects a Config instance but instead received a ${config.constructor.name} instance`,
      );
    }
    return cloneDeep(config);
  }

  /**
   * Load the config into memory
   */
  load() {
    // Set properties to default
    this.updateShell(DEFAULT_SHELL);
    this.removeAllScriptNames();
    this.removeAllScripts();

    if (fse.existsSync(CONFIG_FILE_PATH)) {
      const { shell, scriptNames } = getConfig();
      this.updateShell(shell);
      scriptNames.forEach(scriptName => this.addScriptName(scriptName));
      scriptNames
        .map(scriptName => `${SCRIPTS_DIRECTORY_PATH}/${scriptName}.yml`)
        .map(scriptName => Parser.getScript(scriptName))
        .forEach(script => this.addScript(script));
    } else {
      // Save default config
      this.save();
    }
  }

  /**
   * Save the config in memory to disk
   */
  save() {
    // Delete unsaved scripts
    fse
      .readdir(SCRIPTS_DIRECTORY_PATH)
      .then(scripts => {
        scripts
          .filter(scriptName => path.extname(scriptName) === '.yml')
          .filter(scriptName => !this.scriptNames.includes(path.basename(scriptName, '.yml')))
          .map(scriptName => `${SCRIPTS_DIRECTORY_PATH}/${scriptName}`)
          .forEach(scriptName => deleteYamlFile(scriptName));
      })
      .catch(error => {
        printMessage(
          formatMessage(messages.errorDeletingScript, {
            error,
          }),
        );
      });

    fse.outputJsonSync(
      CONFIG_FILE_PATH,
      {
        shell: this.shell,
        scriptNames: this.scriptNames,
      },
      {
        spaces: 4,
      },
    );
  }

  /**
   * Return the currently set shell
   *
   * @returns currently set shell
   */
  getShell() {
    return this.shell;
  }

  /**
   * Set the current shell
   *
   * @param string shell - the configured shell to run commands in
   */
  updateShell(shell) {
    this.shell = shell;
  }

  /**
   * Return the script names
   *
   * @returns script names
   */
  getScriptNames() {
    return this.scriptNames;
  }

  /**
   * Add a script name to config
   *
   * @param scriptName - script name to add to config
   */
  addScriptName(scriptName) {
    this.scriptNames.push(scriptName);
  }

  /**
   * Remove a script names from config
   *
   * @param scriptName - script to remove from config
   */
  removeScriptName(scriptName) {
    this.scriptNames = this.scriptNames.filter(s => s !== scriptName);
  }

  /**
   * Remove all scripts names from config
   */
  removeAllScriptNames() {
    this.scriptNames = [];
  }

  /**
   * Returns the scripts in thje config
   *
   * @returns Scripts scripts in config
   */
  getScripts() {
    return this.scripts;
  }

  /**
   * Set the scripts in the config
   *
   * @param {Object} scripts - scripts to be added to the config
   */
  updateScripts(scripts) {
    this.scripts = scripts;
  }

  /**
   * Remove all scripts from the config
   */
  removeAllScripts() {
    this.scripts = {};
  }

  /**
   * Returns a script from the config
   *
   * @param string scriptName - the name of the script to return
   *
   * @returns Script script in the config with the matching name
   */
  getScript(scriptName) {
    return this.scripts[scriptName];
  }

  /**
   * Add a script to the config
   *
   * @param Script script - the script to add to the config
   *
   * @throws error if the config already has a script with the same name
   */
  addScript(script) {
    if (script.name in this.scripts) {
      throwError(`Config already contains a script named ${script.name}`);
    } else {
      this.scripts[script.name] = script;
    }
  }

  /**
   * Update a script in the config
   *
   * @param Script script - the script to be updated in the config
   */
  updateScript(script) {
    this.scripts[script.name] = script;
  }

  /**
   * Remove a script from the config
   *
   * @param string scriptName - the name of the script to removed from the config
   */
  removeScript(scriptName) {
    delete this.scripts[scriptName];
  }

  /**
   * Check if a config has a script
   *
   * @param String scriptName - script name to check in config
   * @returns boolean hasScript - config has script
   */
  hasScript(scriptName) {
    return this.scriptNames.includes(scriptName);
  }
}

const GlobalConfig = new Config();
module.exports = {
  Config,
  GlobalConfig,
};
