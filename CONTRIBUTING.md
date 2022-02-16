# Contributing

- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Scripts](#scripts)
  - [Simple Execution](#simple-execution)
  - [CLI Options](#cli-options)
- [Making Changes](#making-changes) _General How-To_
  - [Web Platform](#web-platform)
  - [Other Platforms](#other-platforms)
- [Submitting Changes](#submitting-changes)
- [License](#license)

## Requirements

In order to begin making contributions to this project, [NodeJS](https://nodejs.org/en/) must be installed. Currently, this project is built for usage on the Node `v14.x.x` **LTS** runtime.

The [NodeJS](https://nodejs.org/en/) installation package includes the package manager: [Node Package Manager](https://www.npmjs.com/), we recommend using this as the package manager for this project.

Note that all example scripts within this contribution guide will utilize `npm` as the package manager.

## Project Structure

The following definition provides an overview of commonly used files, when contributing, within the file structure of this project:

```bash
./ # project root
+-+ components/ # component-specific tokens, consumes ./theme-data tokens
+-+ core/ # core tokens, typically bottom-level color definitions
+-+ dist/ # built css stylesheets, only appears after building this project
+-+ legacy/ # legacy theme core tokens
+-+ legacyThemes/ # legacy theme directive tokens
+-+ platformcomponents/ # web-exclusive, platform-explicit component tokens
+-+ reference-tokens/ # tokens exported from the figma article using the Figma Tokens plugin
+-+ theme-data/ # theme-specific tokens, consumes ./core tokens
+-+ themes/ # directive tokens, combines ./theme-data and ./themes
```

While there are other files and directories within the project that contain other project resources, most contributors will only interface with the above-listed items.

## Code Style

Every token in this project, before being built, exist as JSON objects. All implemented tokens must exist as JSON objects.

Example token:

```json
{
  "theme": {
    // component scope
    "text": {
      // component section scope
      "primary": {
        // component variant scope
        "normal": "@color-white-alpha-95", // component state
        "inverted": "@color-black-alpha-95", // component state
        "disabled": "@color-white-alpha-40" // component state
      }
    },
    "background": {
      // component section scope
      "primary": {
        // component variant scope
        "ghost": "@color-white-alpha-00", // component state
        "hover": "@color-black-alpha-04", // component state
        "active": "@color-black-alpha-11", // component state
        "disabled": "@color-black-alpha-11" // component state
      }
    }
  }
}
```

Note that when using an `@` symbol followed by a variable name, this will reference that value as `--{variable-name}`. These references are converted as such: `theme.text.primary.normal` becomes `@theme-text-primarynormal` as a reference. These values can also be any CSS-supported string.

## Scripts

The following section includes definitions and details on the scripts available within this package:

```bash
build:clean # Cleans the ./dist directory
build:css # !IMPORTANT! - Cleans and builds all tokens to ./dist
publishNpm # Performs a version bump and publishes the package. Requires NPM permissions
test # Does nothing, tests are not yet implemented and are deemed uncessary at this time
prepare: # installs our git linting tooling upon `npm install`
```

Running the theme compiler manually can be done with the following CLI command:

```bash
node theme_generator.js [OPTION]... [THEME FILE]...
```

For Web Application developers, running the compiler manually is likely unneeded. The sub-sections below detail how to run the compiler for cases in which it is necessary.

### Simple Execution

Below is an example of a simple execution of the theme compiler:

```bash
node ./theme_generator.js <theme file>

# example:

node ./theme_generator.js ./themes/theme-light-webex.json
```

### CLI Options

A complete list of CLI options currently available:

```bash
Options
  --colorFormat=[hex|rgba]    What color format to use in the output.
       rgba   -> rgba(244,233,20,0.8)
       object -> { "r": 244, "g": 233, "b": 20, "a": 0.8 }
       hex    -> #RRGGBBAA
       names  -> red-05
  --sizeUnit=[px|pt|rem]      What unit to use for sizes in the output.
       px    -> pixels (matching that on Figma)
       pt    -> points (pixels * 0.75)
       rem   -> root em, used on web to create sizes relative to user font size
  --componentGroups           Group tokens by component
  --omitThemeTokens           Removes theme tokens from the generated file
  --fileFormat=[css|json]     What format to use for the output files
  --platform=PLATFORM         Which platform to generate for.
       web
       qt
       macos
       ios
       android
  --toStdOut                  Output to std out instead of writing to files
```

## Making Changes

Most contributors will likely perform the following steps when implementing new tokens:

- `./components/{component-name}.json` - Determine if the component variables have been implemented at the top level by finding a file that contains the **components name**.
  - If so, add the neceesary token data here as references to `./theme-data/{dark | light}/{dark-common | light-common}.json`.
  - If not, proceed to the next item in this list.
- `./theme-data/{dark | light}/{dark-common | light-common}.json` - Determine if the common theme variables include the data needed.
  - If so, map them to `./components/{component-name}.json` as references to these components.
  - If not, implement the tokens at this level in both **light** and **dark** variations based on the [Figma Article](https://www.figma.com/file/n9T5usku57ecvPArT9SpWO/Tokens---Core-Color?node-id=0%3A1). Then, return to the first major bullet in this list and repeat.

To help validate which tokens have been changed by design, the items in the `./reference-tokens/` folder can be used. These tokens are exported using the [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens) Figma plugin, and are challenged via a GitHub Pull Request. The tokens are exported using the plugin from the following Figma articles:

- `./reference-tokens/color-core.json` - https://www.figma.com/file/n9T5usku57ecvPArT9SpWO/Tokens---Core-Color?node-id=0%3A1
- `./reference-tokens/color-theme.json` - https://www.figma.com/file/yYfvFEEr3UkW1yUKkW7zEH/Tokens---Theme-Color?node-id=0%3A1

Challenging these files via a GitHub Pull Request allows for a clear Git Diff to be determined, making updating downstream tokens, such as component tokens, much more streamlined for maintainers.

### Web Platform

Once the tokens have been implemented as JSON, run `npm run build:web` and navigate to the `./dist` folder. Validate that the `./dist/{dark | light}{flavor}.css` files contain the new token data as CSS. If they do, proceed to the [Submitting Changes](#submitting-changes) section.

### Other Platforms

Tokens for individual components go in the components folder. If components are needed on only one platform, they should go into their respective `./platformcomponents/{platform}/{component-name}.json` files. It's also possible to add `./platformcomponents/mobile/{component-name}.json` which applies on both ios and android, or `./platformcomponents/desktop/{component-name}.json`, for both macos and qt.

## Submitting Changes

Since upcoming changes to this project will include the usage of an active CD changelog, we recommend validating that every commit meets [conventional commit standards](https://www.conventionalcommits.org/en/v1.0.0/), specifically those set by [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional). This will allow our changelog to build appropriately once a change is merged into the default branch of this project.

Push all changes to a branch and create a pull request via GitHub on [this project's repository](https://github.com/momentum-design/tokens).

## License

By contributing your code to the `momentum-ui/tokens` GitHub repository, you agree to license your contribution under the MIT license.
