const glob = require("glob");
const path = require("path");

describe("momentumJadeLight", () => {
  glob.sync("./dist/momentumJadeLight.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumJadeLight`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
