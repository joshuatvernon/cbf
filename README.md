# 📜 Pyr

__pyr__ is a tool for storing and running project specific commands in the CLI and documenting those commands in an easy format that can be committed directly to a projects repo for developers to share common commands.

### Scripts

__pyr__ uses the concept of _scripts_ stored as `.yml` files. Scripts are made up of `options`, `command`, `message` and `directory` tags that are used to construct the layout of the script e.g.

```yaml
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
            options:
                australian:
                    directory: "~/Desktop/Australia"
                    message: "G'day world!"
                    command: "echo g'day world >> australian.txt"
                british:
                    directory: "~/Desktop/British"
                    message: "Hello world!"
                    command: "echo hello world >> british.txt"
```

Scripts are easy to build and follow simple rules:
1. The first tag in a script serves as the scripts name
2. `options` tags are used to store lists of more `options` or `command`
3. `command` tags are used to store a string containing any commands that can be ran in the shell
4. `message` tags are used to store messages that are printed to stdout when an option or command is selected
5. When a command is ran, __pyr__ recursively searches for the first `directory` tag to `cd` into to ran the command

### Commands

```sh
λ pyr

  Usage: pyr [options]

  Options:

    -V, --version                                  output the version number
    -l --list                                      list previously saved scripts
    -s --save [path to .yml file]                  process and save a script
    -u --update [script name] [path to .yml file]  process and update a script
    -r --run [script name]                         run a previously saved script
    -d --delete [script name]                      delete a previously saved script
    -A --deleteAll [script name]                   delete all previously saved scripts
    -p --print [script name]                       print a saved script
    -S --shell                                     set the which shell should run commands
    -c --config                                    display configuration
    -h, --help                                     output usage information
```

### Copyright
MIT
