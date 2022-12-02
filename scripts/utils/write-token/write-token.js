const fs = require("fs/promises");
const path = require("path");

/**
 * Write the provided Token Serial to the target location.
 *
 * @param {String} target - Target destination to write the provided Token Serial
 * @param {Token.Serial} serial - Data to be written to the local file system.
 * @returns {Promise<void>}
 */
const writeToken = (target, serial) => {
  const projectDir = process.cwd();

  return fs.writeFile(path.join(projectDir, target), `${serial}\n`);
};

module.exports = writeToken;
