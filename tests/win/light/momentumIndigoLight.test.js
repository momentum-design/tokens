const glob = require("glob");
const path = require("path");

describe("momentumIndigoLight", () => {
  glob.sync("./dist/momentumIndigoLight.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumIndigoLight`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
