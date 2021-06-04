const fs = require('fs');
const parseColour = require('color-parse');
const merge = require('lodash.merge');
const args = require('args-parser')(process.argv);
const camelCase = require('camelcase');

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



function resolveValue(key, value, tokens, coretokens, breadcrumbs) {
  if ((typeof value === 'string') && (value.startsWith('@'))) {
    const tokenName = value.slice(1);
    if (breadcrumbs.includes(tokenName)) {
      console.log('Found loop when resolving ' + key);
      process.exit(1);
    }
    breadcrumbs.push(tokenName);
    if (tokenName in coretokens) {
      return coretokens[tokenName];
    }
    if (!(tokenName in tokens)) {
      console.log('Unknown token: ' + tokenName + ' when resolving ' + key);
      process.exit(1);
    }
    return resolveValue(key, tokens[tokenName], tokens, coretokens, breadcrumbs);
  }
  else
  {
    return value;
  }
}

let platform='Web';
if (args.platform) {
  platform = args.platform;
  delete args.platform;
}

let colorFormat='rgba';
if (args.colorFormat) {
  if (args.colorFormat == 'hex') {
    colorFormat = 'hex';
  } else if (args.colorFormat == 'rgba') {
    colorFormat = 'rgba';
  } else {
    console.log('Unknown color format: ' + args.colorFormat);
    process.exit(1);
  }
  delete args.colorFormat;
}

let toStdOut=false;
if (args.toStdOut) {
  toStdOut = args.toStdOut;
  delete args.toStdOut;
}

if (Object.keys(args).length == 0) {
  console.log(`Usage: ${process.argv[1]} [OPTION]... [THEME FILE]...`);
  console.log('Options');
  console.log('  --colorFormat=[hex|rgba]    What color format to use in the output.');
  console.log('       rgba -> rgba(244,233,20,0.8)');
  console.log('       hex  -> #RRGGBBAA (or would be if someone fixes it)');
  console.log('  --platform=PLATFORM         Which platform to generate for.');
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
      console.log('Unable to parse colour' + value);
      process.exit(1);
    }
    if (colorFormat == 'rgba') {
      flattenedCoreTokens[key] = `rgba(${c.values[0]}, ${c.values[1]}, ${c.values[2]}, ${c.alpha})`;
    } else if (colorFormat == 'hex') {
      flattenedCoreTokens[key] = ((c.values[0] << 24) | (c.values[1] << 16) | (c.values[2] << 8) | c.alpha).toString(16);
    }
  }
});

console.log('=== Core files loaded ====================');

Object.keys(args).forEach(themeFileName => {
  console.log('=== Processing theme =====================');
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
  //console.log(tokenData);



  const flattenedTokens = {};
  flattenObject('', tokenData, flattenedTokens);
  //console.log(flattenedCoreTokens);
  //console.log(flattenedTokens);



  // Then resolve all the tokens
  Object.entries(flattenedTokens).forEach(([key, value]) => {
    flattenedTokens[key] = resolveValue(key, value, flattenedTokens, flattenedCoreTokens, []);
  });
  //console.log(flattenedTokens);



  // And then expand every token into UI states
  const stateTokens = {};
  Object.entries(flattenedTokens).forEach(([key, value]) => {
    const keyParts = key.split('-');
    let uiState = 'normal';
    if (keyParts[keyParts.length-1].startsWith('#')) 
    {
      //This is a state, so sanity check it falls into allowed values
      uiState = keyParts.pop().slice(1);
      const validUiStates = ['normal', 'hovered', 'pressed', 'disabled', 'focused', 'active', 'checked'];
      if (!validUiStates.includes(uiState)) {
        console.log(`Unknown ui state: ${uiState} when resolving ${key}`);
        process.exit(1);
      }
    }
    const baseKeyName = keyParts.join('-');
    if (!(baseKeyName in stateTokens)) {
      stateTokens[baseKeyName] = {};
    }
    stateTokens[baseKeyName][uiState] = value;
  });
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
