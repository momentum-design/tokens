const args = require("args-parser")(process.argv);

const commands = require("./commands");

const executeCommand = (command) => {
  if (commands[command]) {
    commands[command]();
  } else {
    throw new Error(`index.executeCommand() :: command "${command}" not supported, exiting`);
  }
};

if (args.command) {
  executeCommand(args.command);
}
