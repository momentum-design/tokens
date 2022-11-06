const args = require("args-parser")(process.argv);

const commands = require("./commands");

const executeCommand = (command, format) => {
  if (!["automated", "automated", "design"].includes(format)) {
    throw new Error(`index.executeCommand() :: format "${format}" not supported, exiting`);
  }
  if (commands[command]) {
    commands[command](format);
  } else {
    throw new Error(`index.executeCommand() :: command "${command}" not supported, exiting`);
  }
};

if (args.command) {
  executeCommand(args.command, args.format);
}
