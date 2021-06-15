const fs = require('fs');
const parseColour = require('color-parse');
const merge = require('lodash.merge');
const args = require('args-parser')(process.argv);
const camelCase = require('camelcase');

// Loads a JSON file or directory of files and returns an object with the contents of all the files merged together
function loadFile(fileName, isDirectory) {
  if (isDirectory) {
    console.log('Loading directory ' + fileName);
    let fileList = fs.readdirSync(fileName, {withFileTypes: true});
    let tokenData = {};
    fileList.forEach((childFile) => {
      merge(tokenData, loadFile(fileName+"/"+childFile.name, childFile.isDirectory()));
    });
    return tokenData;
  }
  else if (fileName.endsWith('.json')) {
    console.log('Loading file ' + fileName);
    let tokenFileData = fs.readFileSync(fileName);
    return JSON.parse(tokenFileData);
  }
  else {
    console.log('Unknown type of file ' + fileName);
    return {};
  }
}

// Takes a hierarchy and converts a { b { c:d } } to a-b-c: d
function flattenObject(objectPath, childObject, flattenedTokens) {
  Object.entries(childObject).forEach(([key, value]) => {
    const childPath = (objectPath) ? objectPath+'-'+key : key;
    if (typeof value === 'object') {
      flattenObject(childPath, value, flattenedTokens);
    } else {
      flattenedTokens[childPath] = value;
    }
  });
}

// Finds a flattened key in the non-flattened hierarchy
function findKey(keyParts, tokens) {
  // Complication: token names might have a hyphen in them, so we try combining the parts to see if we can find a match
  for (let i=1; i<=keyParts.length; i++) {
    const joinedKey = keyParts.slice(0,i).join('-');
    if (keyParts.length === i) {
      return tokens[joinedKey];
    } else if (joinedKey in tokens) {
      return findKey(keyParts.slice(i), tokens[joinedKey]);
    }
  }
  return null;
}

// Finds references, and returns an object with all references resolved
// You can probably break this with recursive references, can't be bothered to check
function resolveValue(currentToken, allTokens, coretokens) {
  if (typeof currentToken === 'object') { // If this is an object, return a version with all children resolved
    Object.entries(currentToken).forEach(([key, value]) => {
      currentToken[key] = resolveValue(value, allTokens, coretokens);
    });
    return currentToken;
  } else if ((typeof currentToken === 'string') && (currentToken.startsWith('@'))) { // If it's a reference, return the resolved object
    const tokenName = currentToken.slice(1);
    if (tokenName in coretokens) { // easy case - it refers to something in the core
      return coretokens[tokenName];
    } else { // Otherwise we've got to find the token
      const keyParts = tokenName.split('-');
      const value = findKey(keyParts, allTokens);
      if (value) {
        return resolveValue(value, allTokens, coretokens);
      } else {
        console.log('Uanble to find ' + currentToken + ' in ' + JSON.stringify(allTokens, null, 2));
        process.exit(1);
      }
    }
  } else { // Otherwise, we don't need to do any resolution
    return currentToken;
  }
}

let platform='Web';
if (args.platform) {
  platform = args.platform;
  delete args.platform;
}

let colorFormat='rgba';
if (args.colorFormat) {
  if (args.colorFormat === 'hex') {
    colorFormat = 'hex';
  } else if (args.colorFormat === 'rgba') {
    colorFormat = 'rgba';
  } else {
    console.log('Unknown color format: ' + args.colorFormat);
    process.exit(1);
  }
  delete args.colorFormat;
}

let sizeUnit='px';
if (args.sizeUnit) {
  if (args.sizeUnit === 'px') {
    sizeUnit = 'px';
  } else if (args.sizeUnit === 'pt') {
    sizeUnit = 'pt';
  } else if (args.sizeUnit === 'rem') {
    sizeUnit = 'rem';
  } else {
    console.log('Unknown size unit: ' + args.sizeUnit);
    process.exit(1);
  }
  delete args.sizeUnit;
}

let toStdOut=false;
if (args.toStdOut) {
  toStdOut = args.toStdOut;
  delete args.toStdOut;
}

if (Object.keys(args).length === 0) {
  console.log(`Usage: ${process.argv[1]} [OPTION]... [THEME FILE]...`);
  console.log('Options');
  console.log('  --colorFormat=[hex|rgba]    What color format to use in the output.');
  console.log('       rgba -> rgba(244,233,20,0.8)');
  console.log('       hex  -> #RRGGBBAA (or would be if someone fixes it)');
  console.log('  --sizeUnit=[px|pt|rem]      What unit to use for sizes in the output.');
  console.log('       px   -> pixels (matching that on Figma)');
  console.log('       pt   -> points (pixels * 0.75)');
  console.log('       rem  -> root em, used on web to create sizes relative to user font size');
  console.log('  --platform=PLATFORM         Which platform to generate for.');
  console.log('       web');
  console.log('       desktop');
  process.exit(1);
}

// Start by loading all the token files
console.log('=== Loading core files ===================');
let coreData = loadFile("core", true);
// Then flatten all the tokens
const flattenedCoreTokens = {};
flattenObject('', coreData, flattenedCoreTokens);
// normalise colours
Object.entries(flattenedCoreTokens).forEach(([key, value]) => {
  if ((typeof value === 'string') && (value.startsWith('#') || value.startsWith('rgb'))) {
    const c = parseColour(value);
    if (!c) {
      console.log('Unable to parse colour: ' + value);
      process.exit(1);
    }
    if (colorFormat === 'rgba') {
      flattenedCoreTokens[key] = `rgba(${c.values[0]}, ${c.values[1]}, ${c.values[2]}, ${c.alpha})`;
    } else if (colorFormat === 'hex') {
      flattenedCoreTokens[key] = ((c.values[0] << 24) | (c.values[1] << 16) | (c.values[2] << 8) | c.alpha).toString(16);
    }
  } else if ((typeof value === 'string') && (value.endsWith('px'))) {
    const pxSize = parseInt(value.slice(0,-2));
    if (isNaN(pxSize)) {
      console.log('Unable to parse size: ' + value);
      process.exit(1);
    }
    if (sizeUnit === 'px') {
      flattenedCoreTokens[key] = pxSize + 'px';
    } else if (sizeUnit === 'pt') {
      flattenedCoreTokens[key] = (pxSize * 0.75) + 'pt';
    } else if (sizeUnit === 'rem') {
      flattenedCoreTokens[key] = (pxSize/16) + 'rem';
    }
  }
});

console.log('=== Core files loaded ====================');

Object.keys(args).forEach(themeFileName => {
  console.log('=== Processing theme =====================');
  
  // Load all the files to build one big object
  let themeFileData = fs.readFileSync(themeFileName);
  let themeFile = JSON.parse(themeFileData);
  console.log(`Loading theme ${themeFile.name} for platform ${platform} using color format ${colorFormat}`);
  let tokenData = {};
  themeFile.files.forEach((fileName) => {
    if (fileName.endsWith('/')) {
      merge(tokenData, loadFile(fileName.slice(0, -1), true));
    } else {
      merge(tokenData, loadFile(fileName, false));
    }
  });
  /*console.log('=== After load theme data =====================');
  console.log(JSON.stringify(tokenData, null, 2));*/
  
  // Resolve all the references
  tokenData = resolveValue(tokenData, tokenData, flattenedCoreTokens);
  /*console.log('=== After resolve references ==================');
  console.log(JSON.stringify(tokenData, null, 2));*/

  // Flatten the token names
  const flattenedTokens = {};
  flattenObject('', tokenData, flattenedTokens);
  /*console.log('=== After flattening tokens ===================');
  console.log(JSON.stringify(flattenedTokens, null, 2));*/

  // And then expand every token into UI states
  const stateTokens = {};
  Object.entries(flattenedTokens).forEach(([key, value]) => {
    const keyParts = key.split('-');
    const validUiStates = ['normal', 'hovered', 'pressed', 'disabled', 'focused', 'active', 'checked'];
    let uiState = validUiStates[0];
    if (keyParts[keyParts.length-1].startsWith('#')) 
    {
      //This is a state, so sanity check it falls into allowed values
      uiState = keyParts.pop().slice(1);
      if (!validUiStates.includes(uiState)) {
        console.log(`Unknown ui state: ${uiState} when resolving ${key}`);
        process.exit(1);
      }
    }
    const baseKeyName = keyParts.join('-');
    if (platform === 'desktop') {
      if (!(baseKeyName in stateTokens)) {
        stateTokens[baseKeyName] = {};
      }
      stateTokens[baseKeyName][uiState] = value;
    }
    else {
      if (uiState === validUiStates[0]) {
        stateTokens[baseKeyName] = value;
      }
      else {
        stateTokens[baseKeyName+'-'+uiState] = value;
      }
    }
  });
  
  // Output the flattened file
  if (toStdOut) {
    console.log(stateTokens);
  } else {
    const outputFileName = camelCase(themeFile.name) + '.json';
    fs.writeFile(outputFileName, JSON.stringify(stateTokens, null, 2), 'utf8', function (err) {
      if (err) 
      {
        console.log("Error when writing JSON file: " + err);
        process.exit(1);
      }
    });
    console.log(`Written to ${outputFileName}`);
  }
  console.log('=== Theme processed ======================');
});
