const glob = require("glob");
const path = require("path");

describe("json dist snapshots", () => {
  glob.sync("./dist/**/*.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of ${file}`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
