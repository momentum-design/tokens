const glob = require("glob");
const path = require("path");

describe("momentumBronzeLight", () => {
  glob.sync("./dist/momentumBronzeLight.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumBronzeLight`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
