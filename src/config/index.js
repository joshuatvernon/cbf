#!/usr/bin/env node

const fse = require('fs-extra');
const cloneDeep = require('lodash/cloneDeep');

const { CONFIG_FILE_PATH, DEFAULT_SHELL } = require('../constants');
const { throwError } = require('../utility');

const { Script, Option, Command, Directory } = require('./script');

/**
 * Config stores CBF settings and scripts in memory and saves them to config.json
 */
class Config {
  constructor({ shell = DEFAULT_SHELL, scripts = {} } = {}) {
    this.shell = shell;
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
    if (this.shell !== DEFAULT_SHELL || Object.keys(this.scripts).length > 0) {
      // Reset properties to defaults so this method can also be used for reloading
      this.shell = DEFAULT_SHELL;
      this.scripts = {};
    }

    if (fse.existsSync(CONFIG_FILE_PATH)) {
      const { shell, scripts } = JSON.parse(fse.readFileSync(CONFIG_FILE_PATH, 'utf8'));
      this.shell = shell;

      Object.keys(scripts).forEach(scriptKey => {
        const script = new Script({
          name: scriptKey,
        });
        if ('options' in scripts[scriptKey]) {
          Object.keys(scripts[scriptKey].options).forEach(optionKey => {
            const option = new Option({
              name: scripts[scriptKey].options[optionKey].name,
              message: scripts[scriptKey].options[optionKey].message,
              choices: scripts[scriptKey].options[optionKey].choices,
            });
            script.addOption({
              optionKey,
              option,
            });
          });
        }
        if ('commands' in scripts[scriptKey]) {
          Object.keys(scripts[scriptKey].commands).forEach(commandKey => {
            const command = new Command({
              directives: scripts[scriptKey].commands[commandKey].directives,
            });
            const hasMessage = 'message' in scripts[scriptKey].commands[commandKey];
            if (hasMessage) {
              command.updateMessage(scripts[scriptKey].commands[commandKey].message);
            }
            script.addCommand({
              commandKey,
              command,
            });
          });
        }
        if ('directories' in scripts[scriptKey]) {
          Object.keys(scripts[scriptKey].directories).forEach(directoryKey => {
            const directory = new Directory(scripts[scriptKey].directories[directoryKey].path);
            script.addDirectory({
              directoryKey,
              directory,
            });
          });
        }
        this.addScript(script);
      });
    } else {
      // Save DEFAULT config
      this.save();
    }
  }

  /**
   * Save the config in memory to disk
   */
  save() {
    fse.outputJsonSync(
      CONFIG_FILE_PATH,
      {
        shell: this.shell,
        scripts: this.scripts,
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
   * @argument string shell - the configured shell to run commands in
   */
  updateShell(shell) {
    this.shell = shell;
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
   * @argument Script[] scripts - scripts to be added to the config
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
   * @argument string scriptName - the name of the script to return
   *
   * @returns Script script in the config with the matching name
   */
  getScript(scriptName) {
    return this.scripts[scriptName];
  }

  /**
   * Add a script to the config
   *
   * @argument Script script - the script to add to the config
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
   * @argument Script script - the script to be updated in the config
   */
  updateScript(script) {
    this.scripts[script.name] = script;
  }

  /**
   * Remove a script from the config
   *
   * @argument string scriptName - the name of the script to removed from the config
   */
  removeScript(scriptName) {
    delete this.scripts[scriptName];
  }
}

const GlobalConfig = new Config();
module.exports = {
  Config,
  GlobalConfig,
};
