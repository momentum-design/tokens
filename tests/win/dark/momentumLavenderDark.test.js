const glob = require("glob");
const path = require("path");

describe("momentumLavenderDark", () => {
  glob.sync("./dist/momentumLavenderDark.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumLavenderDark`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
