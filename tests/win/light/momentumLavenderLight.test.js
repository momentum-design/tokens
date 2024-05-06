const glob = require("glob");
const path = require("path");

describe("momentumLavenderLight", () => {
  glob.sync("./dist/momentumLavenderLight.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumLavenderLight`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
