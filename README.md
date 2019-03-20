# 🛌 CBF

[![npm version](https://badge.fury.io/js/cbf.svg)](https://badge.fury.io/js/cbf) [![Build Status](https://travis-ci.com/joshuatvernon/cbf.svg?branch=master)](https://travis-ci.com/joshuatvernon/cbf) [![vulnerabilities](https://snyk.io/test/github/joshuatvernon/cbf/badge.svg)](https://snyk.io/test/github/joshuatvernon/cbf) [![dependencies](https://david-dm.org/joshuatvernon/cbf.js.svg?theme=shields.io)](https://david-dm.org/joshuatvernon/cbf.js)

__CBF__ is a simple CLI tool for developers who _can't be f#@!'d_ learning or remembering all the commands they have to run day to day or just in a specific repo.

Developers build scripts that can either be saved directly to __CBF__ or loaded on the fly from a local `cbf.yml` file. The script will then serve as living, breathing runnable documentation for new starters, infrequent contributors or just developers who _can't be f#@!'d_ learning or remembering all the commands.

### Installation

```sh
npm i cbf -g
```

### Scripts

__CBF__ uses the concept of _scripts_ stored as `.yml` files. Scripts are made up of `options`, `command`, `message` and `directory` tags that are used to construct the layout of the script.

__CBF__ scripts are easy to build and follow simple rules:
1. The first tag is required and is the scripts name
2. `options` tags are used to store lists of more `options` or `command`'s
3. `command` tags are used to store a string containing a shell command
4. `message` tags are used to store messages that are printed to stdout when an option or command is selected
5. `directory` tags are used to set where a command should be ran. When a command is ran, __CBF__ recursively searches for the commands set directory or closest set parent `directory` tag

### Example Script

```yaml
---
hello:
    message: "What language would you like to use?"
    directory: "~/Desktop"
    options:
        spanish:
            directory: "~/Desktop/Spain"
            message: "Hola mundo!"
            command: "echo Hola mundo >> spanish.txt"
        french:
            directory: "~/Desktop/French"
            message: "Bonjour le monde!"
            command: "echo Bonjour le monde! >> french.txt"
        english:
            message: "Australian or British?"
            directory: "~/Desktop/British"
            options:
                australian:
                    directory: "~/Desktop/Australia"
                    message: "G'day world!"
                    command: "echo g'day world >> australian.txt"
                british:
                    message: "Hello world!"
                    command: "echo hello world >> british.txt"
```

### Local CBF file

Commit a `cbf.yml` to your repository so developers can run `cbf` or `cbf -D` to easily run and view commands related to the repository.

### Options

```
λ cbf -h

Usage: cbf [options]

Options:
  -V, --version                     output the version number
  -c, --config                      display configuration
  -d, --delete [script name]        delete a previously saved script
  -A, --delete-all                  delete all previously saved scripts
  -D, --documented                  prepends the command to the questions when running a script
  -l, --list                        list previously saved scripts
  -m, --modify [script name]        modify a previously saved script
  -p, --print [script name]         print a saved script
  -r, --run [script name]           run a previously saved script
  -s, --save <path to .yml file>    process and save a script
  -S, --shell                       set the which shell should run commands
  -u, --update <path to .yml file>  process and update a script
  -h, --help                        output usage information
```

### Copyright
MIT
