# Scripts

This project contains a collection of helper scripts written in **CommonJS** that can be used to automate certain tasks. This article defines these scripts to help assist contributors in understanding their purpose.

## Running Scripts

Scripts can be ran via `yarn` or `npm` by using one of the following two options:

```bash
# npm
npm run scripts --command={my-command}
npm run scripts:{my-command}

# yarn
yarn scripts --command={my-command}
yarn scripts:{my-command}
```

Both of the above options are acceptable and should allow for a common layer to execute any specific commands within the `./scripts` folder. If any adjustments are made to the available script commands, these package scripts must be updated to reflect the adjustments.

## Running Script Tests

Script tests are written using the `jest` dependency. Tests can be ran using one of the following commands:

```bash
# npm
npm test
npm run test:scripts

# yarn
yarn test
yarn test:scripts
```

All script files, with the exclusion of `./scripts/index.js` should include a `{file-name}.test.js` file to define their associate test suite. If any adjustements are made to the `./scripts` folder, tests should be ammended to validate that the changes operate as expected.

## Structure

All scripts, and their associated logic, can be found within the `./scripts` folder of this project. This folder is broken into sub-folders to help better organize the flows required to complete the associated tasks.

```bash
./scripts
  ./commands # Command executors for scripts
  ./common # Shared static data for scripts
  ./models # Class constructors used within the associated scripts
  ./utils # Functions used within the associated scripts
```

All nested folders follow an index tree up to the root of the `./scripts` folder. If any items are added throughout the `./scripts` folder, they must have their associated entries within the index trees.

### Commands

Commands should contain a single, exported function that can be executed from `./scripts/index.js` as `[command]()`. This allows for the dependency `argv` to appropriately interpret the cli command and target the appropriately associated command function. Below is a list of commands that are currently supported:

- `update` - Updates static tokens based on the latest changes published by the designers via the `momentum-abstract` dependency
  - **Supported Tokens**
    - `./core/color/decorative`
    - `./core/color/functional`
    - `./core/color/gradation`

If the supported commands are to be modified in any way, changes to this file should be added to accurately represent the supported commands.

### Documentation

Script files within the `./scripts` folder should include **JSDoc** documentation for each of the functions available. If changes are to occur to any files within the `./scripts` scope, updates should also be applied to the associated **JSDoc** definitions.
