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
2. `options` tags are used to store lists of more `options` or `command`'s
3. `command` tags are used to store a string containing a shell command
4. `message` tags are used to store messages that are printed to stdout when an option or command is selected
5. `directory` tags are used to set where a command should be ran. When a command is ran, __pyr__ recursively searches for the most recent `directory` tag to `cd` into

#### Local PYR file
Add and commit a `pyr.yml` to your project so developers can run `pyr` or `pyr -D` to run shared commands.

### Commands

```sh
λ pyr

    Usage: pyr [options]

    Options:
      -V, --version                                   output the version number
      -c, --config                                    display configuration
      -d, --delete [script name]                      delete a previously saved script
      -A, --delete-all                                delete all previously saved scripts
      -D, --documented                                prepends the command to the questions when running a script
      -l, --list                                      list previously saved scripts
      -m, --modify [script name]                      modify a previously saved script
      -p, --print [script name]                       print a saved script
      -r, --run [script name]                         run a previously saved script
      -s, --save <path to .yml file>                  process and save a script
      -S, --shell                                     set the which shell should run commands
      -u, --update <script name> <path to .yml file>  process and update a script
      -h, --help                                      output usage information
```

### Copyright
MIT
