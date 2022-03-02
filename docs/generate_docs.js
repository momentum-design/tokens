const path = require("path");
const camelCase = require("camelcase");
const fs = require("fs");
const args = require("args-parser")(process.argv);

function generateDocs(stateTokens, themeFile) {
  const outputFileName = path.join("docs/docs/web-tokens/", camelCase(themeFile.accent + themeFile.theme) + ".mdx");

  let fileHandle = undefined;
  fileHandle = fs.openSync(outputFileName, "w");

  function outputLine(line) {
    fs.writeSync(fileHandle, line + "\n");
  }

  outputLine(`import {ThemeToken} from '@site/src/components/ThemeToken';`);
  outputLine("");
  outputLine(`# ${camelCase(themeFile.accent + themeFile.theme)}`);
  outputLine("");
  outputLine(":::danger");
  outputLine("");
  outputLine("This page has been generated **automatically**. Please don't change it.");
  outputLine("");
  outputLine(":::");
  outputLine("This page has been automatically generated.");
  outputLine("");

  Object.entries(stateTokens).forEach(([componentName, tokens]) => {
    outputLine("");
    outputLine(`## ${componentName}`);
    outputLine("");
    Object.entries(tokens).forEach(([token, value]) => {
      outputLine(`<ThemeToken token={{name: '${token}', value: '${value}'}} />`);
    });
  });
}
exports.default = generateDocs;
