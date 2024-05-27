const fs = require("fs");
const parseColour = require("color-parse");
const merge = require("lodash.merge");
const args = require("args-parser")(process.argv);
const camelCase = require("camelcase");
const path = require("path");
const generateDocs = require("./docs/generate_docs").default;

function useColourNames(tokens, path) {
  Object.entries(tokens).forEach(([key, value]) => {
    const colourName = path ? path + "-" + key : key;
    if (typeof value === "object") {
      useColourNames(value, colourName);
    } else if (typeof value === "string") {
      tokens[key] = colourName.replace("SystemColor", "").replace("hc-", ""); // We modify colour names for high contrast;
    } else {
      console.error("Unexpected type of colour " + typeof value);
      process.exit(1);
    }
  });
}

function removeComments(token) {
  if ("comment" in token) {
    delete token.comment;
  }
  if ("figma" in token) {
    delete token.figma;
  }
  Object.values(token).forEach((value) => {
    if (typeof value === "object") {
      removeComments(value);
    }
  });
}

/* Takes a hierarchy and converts a { b { c:d } } to a-b-c: d
 * This also drags UI states (those starting with #) to the end of the token names
 */
function flattenObject(objectPath, childObject, flattenedTokens, uiState) {
  if (childObject == null) {
    return "";
  }
  Object.entries(childObject).forEach(([key, value]) => {
    if (key.startsWith("#") && typeof value === "object") {
      if (uiState) {
        console.error("Picked up uiState " + key + " at " + objectPath + " while already carrying " + uiState);
        process.exit(1);
      } else {
        flattenObject(objectPath, value, flattenedTokens, key);
      }
    } else {
      const childPath = objectPath ? objectPath + "-" + key : key;
      if (typeof value === "object") {
        flattenObject(childPath, value, flattenedTokens, uiState);
      } else {
        flattenedTokens[uiState ? childPath + "-" + uiState : childPath] = value;
      }
    }
  });
}

function unflattenObject(flattenedTokens) {
  const output = {};
  Object.entries(flattenedTokens).forEach(([key, value]) => {
    const tokenParts = key.split("-");
    let currentObject = output;
    while (tokenParts.length > 1) {
      if (!(tokenParts[0] in currentObject)) {
        currentObject[tokenParts[0]] = {};
      }
      currentObject = currentObject[tokenParts.shift()];
    }
    currentObject[tokenParts[0]] = value;
  });
  return output;
}

// Loads a JSON file or directory of files and returns an object with the contents of all the files merged together
function loadFile(fileName, isDirectory) {
  if (isDirectory) {
    console.log("Loading directory " + fileName);
    const fileList = fs.readdirSync(fileName, { withFileTypes: true });
    const tokenData = {};
    fileList.forEach((childFile) => {
      merge(tokenData, loadFile(fileName + "/" + childFile.name, childFile.isDirectory()));
    });
    return tokenData;
  } else if (fileName.endsWith(".json")) {
    console.log("Loading file " + fileName);
    let parsedTokenFile;
    try {
      const tokenFileData = fs.readFileSync(fileName);
      /* We don't return the JSON directly - instead we fiddle with the structure of the files to ensure that UI states are always the last part of a token name
       * by flattening it, reordering the keys, and then unflattening it
       */
      parsedTokenFile = JSON.parse(tokenFileData);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    removeComments(parsedTokenFile);
    const flattenedTokenFile = {};
    flattenObject("", parsedTokenFile, flattenedTokenFile);
    return unflattenObject(flattenedTokenFile);
  } else {
    console.log("Unknown type of file " + fileName);
    return {};
  }
}

// Finds a flattened key in the non-flattened hierarchy
function findKey(keyParts, tokens) {
  // Complication: token names might have a hyphen in them, so we try combining the parts to see if we can find a match
  for (let i = 1; i <= keyParts.length; i++) {
    const joinedKey = keyParts.slice(0, i).join("-");
    if (keyParts.length === i) {
      if (typeof tokens === "object" && joinedKey in tokens) {
        return tokens[joinedKey];
      } else {
        return null;
      }
    } else if (joinedKey in tokens && typeof tokens[joinedKey] === "object") {
      return findKey(keyParts.slice(i), tokens[joinedKey]);
    }
  }
  return null;
}

function applyAlpha(tokenGroup, alpha) {
  if (typeof tokenGroup === "string") {
    if (alpha == 1) {
      return tokenGroup;
    } else {
      return tokenGroup + "*" + alpha;
    }
  } else if (typeof tokenGroup === "object") {
    const alphaModifiedObject = {};
    Object.keys(tokenGroup).forEach((key) => {
      alphaModifiedObject[key] = applyAlpha(tokenGroup[key], alpha);
    });
    return alphaModifiedObject;
  } else {
    console.error("Unable to apply alpha to object of type " + typeof tokenGroup);
    process.exit(1);
  }
}

// Parses a value and normalises the unit if required
function normaliseUnit(value) {
  if (typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb"))) {
    if (value.length == 8 && value.startsWith("#")) {
      let filled = value.slice(0, 1) + "0" + value.slice(1);
      value = filled;
    }
    const starPosition = value.indexOf("*");
    let alpha = 1;
    if (starPosition !== -1) {
      alpha = value.slice(starPosition + 1);
      value = value.slice(0, starPosition);
    }
    const c = parseColour(value);
    if (!c) {
      console.error("Unable to parse colour: " + value);
      process.exit(1);
    }
    if (!target.ignoreAlpha) {
      c.alpha = c.alpha * alpha;
    }
    c.alpha = Math.round(c.alpha * 100) / 100;
    if (target.colorFormat === "rgba") {
      return `rgba(${c.values[0]}, ${c.values[1]}, ${c.values[2]}, ${c.alpha})`;
    } else if (target.colorFormat === "object") {
      return { r: c.values[0], g: c.values[1], b: c.values[2], a: c.alpha };
    } else if (target.colorFormat === "hex") {
      r = c.values[0].toString(16).padStart(2, "0");
      g = c.values[1].toString(16).padStart(2, "0");
      b = c.values[2].toString(16).padStart(2, "0");
      a =
        c.alpha === 1
          ? ""
          : Math.round(c.alpha * 255)
              .toString(16)
              .padStart(2, "0");
      return "#" + r + g + b + a;
    }
  } else if (typeof value === "string" && value.startsWith("color-")) {
    const starPosition = value.indexOf("*");
    let alpha = 1;
    if (starPosition !== -1) {
      alpha = value.slice(starPosition + 1);
      value = value.slice(0, starPosition);
    }
    if (alpha != 1) {
      return value.slice(6) + "-alpha-" + alpha * 100;
    } else {
      return value.slice(6);
    }
  } else if (typeof value === "string" && value.endsWith("px")) {
    const pxSize = parseInt(value.slice(0, -2));
    if (isNaN(pxSize)) {
      console.error("Unable to parse size: " + value);
      process.exit(1);
    }
    if (target.sizeUnit === "px") {
      return pxSize + "px";
    } else if (target.sizeUnit === "pt") {
      return pxSize * 0.75 + "pt";
    } else if (target.sizeUnit === "rem") {
      return pxSize / 16 + "rem";
    }
  }
  return value;
}

// Finds references, and returns an object with all references resolved
// You can probably break this with recursive references, can't be bothered to check
function resolveValue(currentToken, allTokens, coreTokens, flattenedCoreTokens) {
  if (typeof currentToken === "object") {
    // If this is an object, return a version with all children resolved
    const resolvedToken = {};
    if (currentToken == null) {
      return currentToken;
    }
    Object.entries(currentToken).forEach(([key, value]) => {
      resolvedToken[key] = resolveValue(value, allTokens, coreTokens, flattenedCoreTokens);
    });
    return resolvedToken;
  } else if (typeof currentToken === "string" && currentToken.startsWith("@")) {
    // If it's a reference, return the resolved object
    let tokenName = currentToken.slice(1);
    const starPosition = tokenName.indexOf("*");
    let alpha = 1;
    if (starPosition !== -1) {
      alpha = tokenName.slice(starPosition + 1);
      tokenName = tokenName.slice(0, starPosition);
    }
    if (tokenName in flattenedCoreTokens) {
      // easy case - it refers to something in the core
      return applyAlpha(flattenedCoreTokens[tokenName], alpha);
    } else {
      // Otherwise we've got to find the token
      const keyParts = tokenName.split("-");
      let value = findKey(keyParts, allTokens); // First of all try to find it as a reference to another token which actually exists
      if (!value) {
        // Maybe it's a reference to a complete core token group, in which case we should substitute in the whole group
        (value = findKey(keyParts, coreTokens)), alpha;
        if (value) {
          value = applyAlpha(value, alpha);
        }
      }
      if (!value) {
        // If we can't find it, it might be going indirectly through a reference to another group
        for (i = 1; i < keyParts.length; i++) {
          const groupParts = keyParts.slice(0, -i);
          const groupValue = findKey(groupParts, allTokens);
          if (groupValue) {
            if (groupValue[0] != "@") {
              console.error(currentToken + " could not be found. Tried resolving via " + groupParts.join("-") + " but that was not a reference");
              //process.exit(1);
              return currentToken;
            }
            const substituteParts = groupValue.slice(1).split("-").concat(keyParts.slice(-i));
            const substituteName = substituteParts.join("-");
            if (substituteName in flattenedCoreTokens) {
              return applyAlpha(flattenedCoreTokens[substituteName], alpha);
            }
            value = findKey(substituteParts, allTokens);
            break;
          }
        }
      }
      if (!value) {
        // If we still can't find it, it's probably broken
        console.error("Unable to find " + currentToken);
        //console.error("Unable to find " + currentToken + " in " + JSON.stringify(allTokens, null, 2));
        //process.exit(1);
      }
      return resolveValue(value, allTokens, coreTokens, flattenedCoreTokens);
    }
  } else {
    // Otherwise, we don't need to do any resolution
    return currentToken;
  }
}

// Changes all borders from border: "color" to border-style: "solid|none", border-color: color
function fixBorders(tokens) {
  if (typeof tokens === "object") {
    if (tokens == null) {
      return "";
    }
    Object.entries(tokens).forEach(([key, value]) => {
      if (key === "border") {
        if (target.noBorderIsBackgroundColour) {
          if (value == null) {
            return "";
          }
          Object.entries(value).forEach(([borderKey, borderValue]) => {
            if (borderValue === "none") {
              tokens["border"][borderKey] = tokens["background"][borderKey];
            }
          });
        } else {
          tokens["border-style"] = {};
          tokens["border-color"] = {};
          Object.entries(value).forEach(([borderKey, borderValue]) => {
            if (borderValue === "none") {
              tokens["border-style"][borderKey] = "none";
            } else {
              tokens["border-style"][borderKey] = "solid";
              tokens["border-color"][borderKey] = borderValue;
            }
          });
          delete tokens.border;
        }
      } else {
        fixBorders(value);
      }
    });
  }
}

function removeNoneTokens(tokens) {
  Object.entries(tokens).forEach(([key, value]) => {
    if (typeof value === "object") {
      removeNoneTokens(tokens[key]);
    } else if (value === "none") {
      delete tokens[key];
    }
  });
}

// Sorts out UI states
function finaliseTokens(tokens) {
  const finalisedTokens = {};
  Object.entries(tokens).forEach(([key, value]) => {
    const keyParts = key.split("-");
    const validUiStates = ["normal", "hovered", "pressed", "disabled", "focused", "active", "checked"];
    let uiState = validUiStates[0];
    if (keyParts[keyParts.length - 1].startsWith("#")) {
      //This is a state, so sanity check it falls into allowed values
      uiState = keyParts.pop().slice(1);
      if (!validUiStates.includes(uiState)) {
        console.error(`Unknown ui state: ${uiState} when resolving ${key}`);
        process.exit(1);
      }
    }
    // desktop clients don't support 'active' state, replace with 'checked'
    if (target.platform === "macos" || target.platform === "qt" || target.platform === "win-hc") {
      if (uiState === "active") {
        uiState = "checked";
      }
    }
    const baseKeyName = keyParts.join("-");
    if (target.uiStatesAsObject) {
      if (!(baseKeyName in finalisedTokens)) {
        finalisedTokens[baseKeyName] = {};
      }
      finalisedTokens[baseKeyName][uiState] = value;
    } else {
      if (uiState === validUiStates[0]) {
        finalisedTokens[baseKeyName] = value;
      } else {
        finalisedTokens[baseKeyName + "-" + uiState] = value;
      }
    }
  });
  return finalisedTokens;
}

function normaliseUnits(tokens) {
  const normalisedTokens = {};
  Object.entries(tokens).forEach(([key, value]) => {
    normalisedTokens[key] = normaliseUnit(value);
  });
  return normalisedTokens;
}

let target = {
  platform: "web",
  colorFormat: "rgba",
  sizeUnit: "px",
  componentGroups: false,
  fileFormat: "json",
  includeJsonHeader: false,
  includeMobileTokens: false,
  includeDesktopTokens: false,
  uiStatesAsObject: true,
  omitThemeTokens: false,
  /* if true we use the background colour as the value of the border if border=none
   * if false, we instead modify to a border-style and border-color variables
   */
  noBorderIsBackgroundColour: true,
  ignoreAlpha: false,
  themes: [],
};

if (args.target) {
  console.log("Loading target " + args.target);
  let targetFile;
  try {
    target = JSON.parse(fs.readFileSync(args.target));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  delete args.target;
}

if (args.platform) {
  target.platform = args.platform;
  delete args.platform;
}

if (args.colorFormat) {
  if (args.colorFormat === "hex") {
    target.colorFormat = "hex";
  } else if (args.colorFormat === "rgba") {
    target.colorFormat = "rgba";
  } else if (args.colorFormat === "object") {
    target.colorFormat = "object";
  } else if (args.colorFormat === "names") {
    target.colorFormat = "names";
  } else {
    console.error("Unknown color format: " + args.colorFormat);
    process.exit(1);
  }
  delete args.colorFormat;
}

if (args.sizeUnit) {
  if (args.sizeUnit === "px") {
    target.sizeUnit = "px";
  } else if (args.sizeUnit === "pt") {
    target.sizeUnit = "pt";
  } else if (args.sizeUnit === "rem") {
    target.sizeUnit = "rem";
  } else {
    console.error("Unknown size unit: " + args.sizeUnit);
    process.exit(1);
  }
  delete args.sizeUnit;
}

if (args.componentGroups) {
  target.componentGroups = true;
  delete args.componentGroups;
}

if (args.omitThemeTokens) {
  target.omitThemeTokens = args.omitThemeTokens;
  delete args.omitThemeTokens;
}

if (args.fileFormat) {
  if (args.fileFormat === "css") {
    target.fileFormat = "css";
  } else if (args.fileFormat === "json") {
    target.fileFormat = "json";
  } else {
    console.error("Unknown file format: " + args.fileFormat);
    process.exit(1);
  }
  delete args.fileFormat;
}

if (target.fileFormat === "css") {
  target.uiStatesAsObject = false; // Can't have objects in CSS
}

console.log("Using platform " + target.platform);
console.log("Using colorFormat " + target.colorFormat);
console.log("Using sizeUnit " + target.sizeUnit);
console.log("Using componentGroups " + target.componentGroups);
console.log("Using fileFormat " + target.fileFormat);

let toStdOut = false;
if (args.toStdOut) {
  toStdOut = args.toStdOut;
  delete args.toStdOut;
}

let writeDocs = false;
if (args.writeDocs) {
  writeDocs = args.writeDocs;
  delete args.writeDocs;
}

if (Object.keys(args).length !== 0) {
  target.themes = Object.keys(args);
}

if (target.themes.length === 0) {
  console.log(`Usage: ${process.argv[1]} [OPTION]... [THEME FILE]...`);
  console.log("Options");
  console.log("  --target=TARGETFILE        file defining all properties of the build.");
  console.log("  --colorFormat=[hex|rgba]    What color format to use in the output.");
  console.log("       rgba   -> rgba(244,233,20,0.8)");
  console.log('       object -> { "r": 244, "g": 233, "b": 20, "a": 0.8 }');
  console.log("       hex    -> #RRGGBBAA");
  console.log("       names  -> red-05");
  console.log("  --sizeUnit=[px|pt|rem]      What unit to use for sizes in the output.");
  console.log("       px    -> pixels (matching that on Figma)");
  console.log("       pt    -> points (pixels * 0.75)");
  console.log("       rem   -> root em, used on web to create sizes relative to user font size");
  console.log("  --componentGroups           Group tokens by component");
  console.log("  --omitThemeTokens           Removes theme tokens from the generated file");
  console.log("  --fileFormat=[css|json]     What format to use for the output files");
  console.log("  --platform=PLATFORM         Which platform to generate for.");
  console.log("       web");
  console.log("       qt");
  console.log("       macos");
  console.log("       ios");
  console.log("       android");
  console.log("  --toStdOut                  Output to std out instead of writing to files");
  process.exit(1);
}

// Start by loading all the token files
console.log("=== Loading core files ===================");
let coreTokens = loadFile("core", true);
if (target.colorFormat === "names") {
  useColourNames(coreTokens);
}

// Then flatten all the tokens
const flattenedCoreTokens = {};
flattenObject("", coreTokens, flattenedCoreTokens);
console.log("=== Core files loaded ====================");

// Then load the component files
console.log("=== Loading component files ==============");
let componentData = loadFile("components", true);
if (target.includeMobileTokens) {
  try {
    merge(componentData, loadFile("platformcomponents/mobile", true));
  } catch (error) {
    console.log("No platform component tokens for mobile");
  }
}
if (target.includeDesktopTokens) {
  try {
    merge(componentData, loadFile("platformcomponents/desktop", true));
  } catch (error) {
    console.log("No platform component tokens for desktop");
  }
}
try {
  merge(componentData, loadFile("platformcomponents/" + target.platform, true));
} catch (error) {
  console.log("No platform component tokens for " + target.platform);
}

const flattenedComponentTokens = {};
flattenObject("", componentData, flattenedComponentTokens);
console.log("=== Component files loaded =================");
//console.log(JSON.stringify(componentData, null, 2));

const indexFileData = [];

target.themes.forEach((themeFileName) => {
  console.log("=== Processing theme =====================");

  // Load all the files to build one big object
  let themeFileData = fs.readFileSync(themeFileName);
  let themeFile = JSON.parse(themeFileData);
  if (themeFile.parent !== undefined) {
    // Would like to just do a merge, but it doesn't merge arrays the way I want, so doing it manually...
    //merge(themeFile, JSON.parse(parentData));
    parentData = fs.readFileSync(themeFile.parent);
    parent = JSON.parse(parentData);
    parent.files = parent.files.concat(themeFile.files);
    themeFile = parent;
  }
  console.log(`Loading theme ${themeFile.accent} ${themeFile.theme} for platform ${target.platform} using color format ${target.colorFormat}`);

  const themeData = {};
  themeFile.files.forEach((fileName) => {
    if (fileName.endsWith("/")) {
      merge(themeData, loadFile(fileName.slice(0, -1), true));
    } else {
      merge(themeData, loadFile(fileName, false));
    }
  });
  /*console.log('=== After load theme data =====================');
  console.log(JSON.stringify(themeData, null, 2));*/

  // Resolve all the references
  const resolvedThemeData = resolveValue(themeData, themeData, coreTokens, flattenedCoreTokens);
  /*console.log('=== Theme after resolve references ==============');
  console.log(JSON.stringify(resolvedThemeData, null, 2));*/

  const flattenedThemeTokens = {};
  flattenObject("", resolvedThemeData, flattenedThemeTokens);

  resolvedComponentData = resolveValue(componentData, componentData, resolvedThemeData, flattenedThemeTokens);
  /*console.log('=== Components after resolve references ==========');
  console.log(JSON.stringify(resolvedComponentData, null, 2));*/

  // Look for borders, and expand to border-style and border-color
  fixBorders(resolvedComponentData);
  removeNoneTokens(flattenedThemeTokens);
  removeNoneTokens(resolvedThemeData);

  // Flatten the token names and then expand every token into UI states
  let stateTokens = {};
  if (target.componentGroups) {
    const flattenedTokens = {};
    Object.entries(resolvedComponentData).forEach(([key, value]) => {
      const categoryFlattenedTokens = {};
      flattenObject("", value, categoryFlattenedTokens);
      stateTokens[key] = finaliseTokens(normaliseUnits(categoryFlattenedTokens));
    });
  } else {
    const flattenedTokens = {};
    flattenObject("", resolvedComponentData, flattenedTokens);
    stateTokens = finaliseTokens(normaliseUnits(flattenedTokens));
  }

  if (!target.omitThemeTokens) {
    if (target.componentGroups) {
      stateTokens["theme"] = {};
      Object.entries(resolvedThemeData["theme"]).forEach(([key, value]) => {
        const categoryFlattenedTokens = {};
        flattenObject("", value, categoryFlattenedTokens);
        stateTokens["theme"][key] = finaliseTokens(normaliseUnits(categoryFlattenedTokens));
      });
    } else {
      merge(stateTokens, normaliseUnits(flattenedThemeTokens));
    }
  }
  /*console.log('=== After flattening tokens ===================');
  console.log(JSON.stringify(flattenedThemeTokens, null, 2));*/

  // Output the flattened file

  fs.mkdir("dist", (err) => {});
  let outputFileName = "";
  if (target.fileFormat === "css") {
    const outputName = camelCase(themeFile.theme + themeFile.accent);
    indexFileData.push(`@import '${outputName}.css';`);
    outputFileName = path.join("dist", outputName + ".css");
    let fileHandle = undefined;
    if (!toStdOut) {
      fileHandle = fs.openSync(outputFileName, "w");
    }
    function outputLine(line) {
      if (toStdOut) {
        console.log(line);
      } else {
        fs.writeSync(fileHandle, line + "\n");
      }
    }
    outputLine(".md-theme-" + outputName + " {");
    Object.entries(stateTokens).forEach(([key, value]) => {
      outputLine("  --" + key + ": " + value + ";");
    });
    outputLine("}");
  } else if (target.fileFormat === "json") {
    if (target.includeJsonHeader) {
      if (target.platform === "macos" || target.platform === "qt" || target.platform === "win-hc") {
        var name = themeFile.accent + themeFile.theme;
        var parent = themeFile.accent + themeFile.theme;
        if (themeFile.accent === "Webex" || themeFile.accent === "Indigo" || themeFile.accent === "Rose") {
          parent = themeFile.theme === "Light" ? "Default" : themeFile.theme;
          if (themeFile.accent === "Webex") {
            name = parent;
          }
        }
        stateTokens = { name: "Momentum" + name, parent: parent, tokens: stateTokens };
      } else {
        stateTokens = { name: "Momentum" + themeFile.accent + themeFile.theme, parent: themeFile.accent + themeFile.theme, tokens: stateTokens };
      }
    }
    if (target.platform === "macos" || target.platform === "qt" || target.platform === "win-hc") {
      var accent = themeFile.accent;
      var theme = themeFile.theme;
      if (accent === "Webex") {
        accent = "";
        theme = theme === "Light" ? "Default" : theme;
      }
      outputFileName = path.join("dist", camelCase("momentum" + accent + theme) + ".json");
    } else {
      outputFileName = path.join("dist", camelCase(themeFile.accent + themeFile.theme) + ".json");
    }
    if (toStdOut) {
      console.log(JSON.stringify(stateTokens, null, 2));
    } else {
      fs.writeFile(outputFileName, JSON.stringify(stateTokens, null, 2), "utf8", function (err) {
        if (err) {
          console.error("Error when writing JSON file: " + err);
          process.exit(1);
        }
      });
    }
    if (writeDocs) {
      generateDocs(stateTokens, themeFile);
    }
  }
  if (!toStdOut) {
    console.log(`Written to ${outputFileName}`);
  }
  console.log("=== Theme processed ======================");
});

if (target.fileFormat === "css") {
  const indexFileContent = indexFileData.join("\n");
  const indexFileName = path.join("dist", "index.css");

  fs.writeFileSync(indexFileName, indexFileContent, "utf8");
}
