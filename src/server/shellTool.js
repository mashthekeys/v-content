
export default class ShellTool {
  constructor(commands, environment) {
    this.commands = commands || {};

    this.environment = environment || {};
  }

  parseArguments(input) {
    const args = [];
    const options = {};
    let acceptOptions = true;

    for (let i = 0; i < input.length; i++){
      const arg = input[i];

      if ("--" === arg) {
        acceptOptions = false;

      } else if ("--help" === arg) {
        args.push("help");

      } else if (acceptOptions && /^--/.test(arg)) {
        const [, option, value] = /^--([^=]*)(?:=(.*)|)$/.exec(arg);

        options[option] = value ?? true;
      } else {
        args.push(arg);
      }
    }

    this.args = args;
    this.options = options;

    return {args, options};
  }

  async run(argumentArray) {
    const {args} = this.parseArguments(argumentArray);
    const commands = this.commands;
    const exit = this.environment.exit;

    const command = args[0];
    const commandArgs = args.slice(1);

    const fallbackCommand = (command === 'help') ? this.help : this.error;

    try {
      let result = await (commands[command] || fallbackCommand).call(this, ...commandArgs);

      if (typeof result !== "number") {
        result = 0;
      }

      exit && exit(result);

      return result;

    } catch (error) {
      console.error(error);
      exit && exit(2);
      return 2;
    }
  }

  help() {
    const commands = this.commands;
    const commandList = Object.keys(commands);

    if (commandList.length) {
      commandList.forEach(command => {
        const commandFn = commands[command];
        const commandParams = Array(commandFn.length).fill('[param]');

        console.warn(`${this.environment.name}  ${command}  ${commandParams.join('  ')}`);
      });
    } else {
      console.warn(`${this.environment.name}  --help`);
    }

    return 0;
  }

  error() {
    this.help();

    return 1;
  }
}