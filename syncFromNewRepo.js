const _ = require("lodash");
const fs = require("fs");

// merge deep function - goes through each leaf in the object and replaces the key with the same
// key in the new tokens
function mergeDeep(target, source) {
  if (_.isObject(target) && _.isObject(source)) {
    Object.keys(target).forEach((key) => {
      if (_.isObject(source[key])) {
        mergeDeep(target[key], source[key]);
      } else if (source.hasOwnProperty(key)) {
        let replacement = source[key];

        // this is for replacing linear-gradients (since in the old tokens the format for gradients is [start, end])
        if (replacement.startsWith("linear-gradient(")) {
          let gradientParts = replacement.split(",");
          gradientParts.shift();
          gradientParts = gradientParts.map((part) => {
            return part.trim().split(" ")[0];
          });
          replacement = gradientParts;
        }
        target[key] = replacement;
      }
    });
  }
  return target;
}

// Function to update the existing JSON file with values from the new JSON file
const updateJsonFile = (existingFilePath, newFilePath) => {
  // Read the existing JSON file
  fs.readFile(existingFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading the existing file: ${err}`);
      return;
    }

    // Parse the existing JSON data
    let existingData = JSON.parse(data);

    // Read the new JSON file
    fs.readFile(newFilePath, "utf8", (err, newData) => {
      if (err) {
        console.error(`Error reading the new file: ${err}`);
        return;
      }

      const newJsonData = mergeDeep(_.cloneDeep(existingData), JSON.parse(newData).color);

      // Update the existing JSON data with the new JSON data
      existingData = { ...existingData, ...newJsonData };

      // Write the updated JSON data back to the existing file
      fs.writeFile(existingFilePath, JSON.stringify(existingData, null, 2), (err) => {
        if (err) {
          console.error(`Error writing the updated data to the file: ${err}`);
        } else {
          console.log(`The file has been updated successfully.`);
        }
      });
    });
  });
};

// dark:
updateJsonFile("./theme-data/common/common.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/dark-stable.json");
updateJsonFile("./theme-data/dark/dark-common.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/dark-stable.json");
updateJsonFile("./theme-data/dark/dark-additional.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/dark-stable.json");
updateJsonFile("./theme-data/dark/dark-webex.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/dark-stable.json");

// light:
updateJsonFile("./theme-data/common/common.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/light-stable.json");
updateJsonFile("./theme-data/light/light-common.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/light-stable.json");
updateJsonFile("./theme-data/light/light-additional.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/light-stable.json");
updateJsonFile("./theme-data/light/light-webex.json", "./node_modules/@momentum-design/tokens/dist/json-minimal/theme/webex/light-stable.json");

// TODO: other themes (bronze, lavender, etc.), high contrast for win (separate script or by providing arg)
