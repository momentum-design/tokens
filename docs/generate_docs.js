const path = require("path");
const camelCase = require("camelcase");
const fs = require("fs");
const args = require("args-parser")(process.argv);

function formatString(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

function generateDocs(stateTokens, themeFile) {
  const outputFileName = path.join("docs/docs/web-tokens/", camelCase(themeFile.accent + themeFile.theme) + ".mdx");

  let fileHandle = undefined;
  fileHandle = fs.openSync(outputFileName, "w");

  function outputLine(line) {
    fs.writeSync(fileHandle, line + "\n");
  }

  const themeTokens = Object.entries(stateTokens)
    .filter(([componentName, tokens]) => componentName === "theme")
    .map(([componentName, key]) => key)
    .flat();

  outputLine(`import {ThemeToken} from '@site/src/components/ThemeToken';`);
  outputLine(`import {ThemeBackground} from '@site/src/components/ThemeBackground';`);
  outputLine("");
  outputLine(`# ${formatString(camelCase(themeFile.theme + themeFile.accent))}`);
  outputLine("");
  outputLine(":::danger");
  outputLine("");
  outputLine("This page has been generated **automatically**. Please don't change it.");
  outputLine("");
  outputLine(":::");
  outputLine("This page has been automatically generated.");
  outputLine("");
  outputLine(`## Theme`);
  outputLine("");
  outputLine(`<ThemeBackground gradation={${JSON.stringify(themeTokens[0].gradation)}} />`);

  Object.entries(stateTokens)
    .sort()
    .forEach(([componentName, tokens]) => {
      if (componentName != "theme") {
        outputLine("");
        outputLine(`## ${formatString(componentName)}`);
        outputLine("");
        Object.entries(tokens).forEach(([token, value]) => {
          outputLine(`<ThemeToken token={{name: '${componentName}-${token}', value: '${value}'}} />`);
        });
      }
    });
}
exports.default = generateDocs;
