# [CBF](https://joshuatvernon.github.io/cbf-site/)

![cbf sloth](images/sloth.png)

[![npm version](https://badge.fury.io/js/cbf.svg)](https://badge.fury.io/js/cbf) [![Build Status](https://travis-ci.com/joshuatvernon/cbf.svg?branch=master)](https://travis-ci.com/joshuatvernon/cbf) [![vulnerabilities](https://snyk.io/test/github/joshuatvernon/cbf/badge.svg)](https://snyk.io/test/github/joshuatvernon/cbf)

__CBF__ is a simple CLI tool for developers who _can't be f#@!'d_ learning or remembering all the commands they have to run day to day or just in a specific repo.

![demo](images/demo.gif)

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
3. `command` tags are used to store one or many strings containing shell commands
4. `message` tags are used to store messages that are printed to stdout when an option or command is selected
5. `directory` tags are used to set where a command should be ran. When a command is ran, __CBF__ recursively searches for the commands set directory or closest set parent `directory` tag

### Example Script

Here is a basic example script in __CBF__. Also check out the other [examples](./examples) scripts.

```yaml
---
example-project:
    message: "Run, build or test example project?"
    directory: "~/projects/example"
    options:
        run:
            message: "Running example project..."
            command: "yarn start"
        build:
            directory: "~/projects/example/src"
            message: "Building example project..."
            command: "yarn install"
        test:
            message: "Run unit or integration tests?"
            options:
                unit:
                    message: "Running example project unit tests"
                    command: "yarn test:unit"
                integration:
                    message: "Running example project integration tests"
                    command: "yarn test:integration"
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
