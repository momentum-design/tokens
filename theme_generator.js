const fs = require('fs');
var parseColour = require('color-parse');

function loadFile(fileName, isDirectory) {
  if (isDirectory) {
    console.log('Loading directory ' + fileName);
    let fileList = fs.readdirSync(fileName, {withFileTypes: true});
    let tokenData = {};
    fileList.forEach((childFile) => {
      tokenData = {...tokenData, ...loadFile(fileName+"/"+childFile.name, childFile.isDirectory())};
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



// Start by loading all the token files
let coreData = loadFile("core", true);
//console.log(coreData);

let themeFileData = fs.readFileSync(process.argv[2]);
let themeFile = JSON.parse(themeFileData);
console.log('Loading theme ' + themeFile.name);
let tokenData = {};
themeFile.files.forEach((fileName) => {
  if (fileName.endsWith('/')) {
    tokenData = {...tokenData, ...loadFile(fileName.slice(0, -1), true)};
  } else {
    tokenData = {...tokenData, ...loadFile(fileName, false)};
  }
});
//console.log(tokenData);



// Then flatten all the tokens
const flattenedCoreTokens = {};
flattenObject('', coreData, flattenedCoreTokens);
// normalise colours
Object.entries(flattenedCoreTokens).forEach(([key, value]) => {
  if ((typeof value === 'string') && (value.startsWith('#') || value.startsWith('rgb'))) {
    const c = parseColour(value);
    flattenedCoreTokens[key] = `rgba(${c.values[0]}, ${c.values[1]}, ${c.values[2]}, ${c.alpha})`;
  }
});
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
    uiState = keyParts.pop().slice(1);
  }
  const baseKeyName = keyParts.join('-');
  if (!(baseKeyName in stateTokens)) {
    stateTokens[baseKeyName] = {};
  }
  stateTokens[baseKeyName][uiState] = value;
});
console.log(stateTokens);
