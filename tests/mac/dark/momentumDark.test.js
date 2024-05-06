const glob = require("glob");
const path = require("path");

describe("momentumDark", () => {
  glob.sync("./dist/momentumDark.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumDark`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
