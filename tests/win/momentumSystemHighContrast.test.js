const glob = require("glob");
const path = require("path");

describe("momentumSystemHighContrast", () => {
  glob.sync("./dist/momentumSystemHighContrast.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumSystemHighContrast`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
