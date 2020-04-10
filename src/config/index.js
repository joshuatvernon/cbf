#!/usr/bin/env node

const path = require('path');

const fse = require('fs-extra');
const cloneDeep = require('lodash/cloneDeep');
const { printMessage, formatMessage } = require('formatted-messages');

const Parser = require('../parser');
const {
  SCRIPT_EXTENSIONS,
  CONFIG_FILE_PATH,
  SCRIPTS_DIRECTORY_PATH,
  DEFAULT_SHELL,
  JSON_SPACES_FORMATTING,
  DEFAULT_NPM_ALIAS,
} = require('../constants');
const {
  isEmptyString,
  throwError,
  deleteYamlFile,
  isValidYamlFileName,
  isValidJsonFileName,
  deleteJsonFile,
  safeExit,
} = require('../utility');

const messages = require('./messages');

/**
 * Load the config from the config.json file into memory
 *
 * @returns {object} config - config parsed from config.json file
 */
const loadConfigJson = () => fse.readJsonSync(CONFIG_FILE_PATH);

/**
 * Save config to the config.json file
 *
 * @param {object} param                - object parameter
 * @param {string} param.shell          - shell to save to the config.json
 * @param {string} param.npmAlias       - NPM alias to save to the config.json
 * @param {string[]} param.scriptNames  - script names to save to the config.json
 */
const saveConfigJson = ({ shell, npmAlias, scriptNames }) => {
  fse.outputJsonSync(
    CONFIG_FILE_PATH,
    {
      shell,
      npmAlias,
      scriptNames,
    },
    {
      spaces: JSON_SPACES_FORMATTING,
    },
  );
};

/**
 * Config stores CBF settings and scripts in memory and saves them to config.json
 */
class Config {
  /**
   * Construct a config
   *
   * @param {object} param               - object parameter
   * @param {string} param.shell         - the config shell
   * @param {string} param.npmAlias      - the config NPM alias
   * @param {string[]} param.scriptNames - the config script names
   * @param {object} param.scripts       - the config scripts
   */
  constructor({ shell = DEFAULT_SHELL, npmAlias = DEFAULT_NPM_ALIAS, scriptNames = [], scripts = {} } = {}) {
    this.shell = shell;
    this.npmAlias = npmAlias;
    this.scriptNames = scriptNames;
    this.scripts = scripts;
  }

  /**
   * Return a copy of the config
   *
   * @param {Config} config         - config to be copied
   *
   * @returns {Config} copiedConfig - copied config
   */
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
    this.updateNPMAlias(DEFAULT_NPM_ALIAS);
    this.removeAllScriptNames();
    this.removeAllScripts();

    if (fse.pathExistsSync(CONFIG_FILE_PATH)) {
      const { shell, npmAlias, scriptNames } = loadConfigJson();
      this.updateShell(shell);
      this.updateNPMAlias(npmAlias);
      scriptNames.forEach(scriptName => this.addScriptName(scriptName));
      scriptNames
        // Map saved script name to yaml or json file path
        .map(scriptName => {
          let fileName = '';
          SCRIPT_EXTENSIONS.forEach(scriptExtension => {
            const potentialScriptFileName = `${SCRIPTS_DIRECTORY_PATH}/${scriptName}${scriptExtension}`;
            if (fse.pathExistsSync(potentialScriptFileName)) {
              fileName = potentialScriptFileName;
            }
          });
          if (isEmptyString(fileName)) {
            this.removeScriptName(scriptName);
          }
          return fileName;
        })
        .filter(fileName => !isEmptyString(fileName))
        .map(fileName => {
          if (isValidYamlFileName(fileName)) {
            return Parser.getScriptFromYamlFile(fileName);
          }
          return Parser.getScriptFromJsonFile({ fileName });
        })
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
    let scriptFileNames = [];
    try {
      if (fse.pathExistsSync(SCRIPTS_DIRECTORY_PATH)) {
        scriptFileNames = fse.readdirSync(SCRIPTS_DIRECTORY_PATH);
      }
      scriptFileNames.forEach(scriptFileName => {
        if (
          isValidYamlFileName(scriptFileName) &&
          !this.hasScript(path.basename(scriptFileName, '.yml')) &&
          !this.hasScript(path.basename(scriptFileName, '.simple.yml'))
        ) {
          deleteYamlFile(`${SCRIPTS_DIRECTORY_PATH}/${scriptFileName}`);
        }
        if (
          isValidJsonFileName(scriptFileName) &&
          !this.hasScript(path.basename(scriptFileName, '.json')) &&
          !this.hasScript(path.basename(scriptFileName, '.simple.json'))
        ) {
          deleteJsonFile(`${SCRIPTS_DIRECTORY_PATH}/${scriptFileName}`);
        }
      });
    } catch (error) {
      printMessage(
        formatMessage(messages.errorDeletingScript, {
          error,
        }),
      );
      safeExit();
    }

    saveConfigJson({
      shell: this.shell,
      npmAlias: this.npmAlias,
      scriptNames: this.scriptNames,
    });
  }

  /**
   * Return the currently set shell
   *
   * @returns {string} shell - currently set shell
   */
  getShell() {
    return this.shell;
  }

  /**
   * Set the current shell
   *
   * @param {string} shell - the configured shell to run commands in
   */
  updateShell(shell) {
    this.shell = shell;
  }

  /**
   * Return the currently set NPM alias
   *
   * @returns {string} npmAlias - currently set NPM alias
   */
  getNPMAlias() {
    return this.npmAlias;
  }

  /**
   * Set the current NPM alias
   *
   * @param {string} shell - the configured NPM alias to run scripts from package.json with
   */
  updateNPMAlias(npmAlias) {
    this.npmAlias = npmAlias;
  }

  /**
   * Return the script names
   *
   * @returns {string[]} scriptNames - script names
   */
  getScriptNames() {
    return this.scriptNames;
  }

  /**
   * Add a script name to config
   *
   * @param {string} scriptName - script name to add to config
   */
  addScriptName(scriptName) {
    this.scriptNames.push(scriptName);
  }

  /**
   * Remove a script names from config
   *
   * @param {string} scriptName - name of script to remove from config
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
   * Returns the scripts in the config
   *
   * @returns {object} scripts - scripts in config
   */
  getScripts() {
    return this.scripts;
  }

  /**
   * Set the scripts in the config
   *
   * @param {object} scripts - scripts to be added to the config
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
   * @param {string} scriptName - the name of the script to return
   *
   * @returns {Script} script   - script in the config with the matching name
   */
  getScript(scriptName) {
    return this.scripts[scriptName];
  }

  /**
   * Add a script to the config
   *
   * @param {Script} script - the script to add to the config
   *
   * @throws {Error} error  - error if the config already has a script with the same name
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
   * @param {Script} script - the script to be updated in the config
   */
  updateScript(script) {
    this.scripts[script.name] = script;
  }

  /**
   * Remove a script from the config
   *
   * @param {string} scriptName - the name of the script to removed from the config
   */
  removeScript(scriptName) {
    delete this.scripts[scriptName];
  }

  /**
   * Check if a config has a script
   *
   * @param {string} scriptName   - script name to check in config
   *
   * @returns {boolean} hasScript - config has script
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
