const glob = require("glob");
const path = require("path");

describe("momentumJadeDark", () => {
  glob.sync("./dist/momentumJadeDark.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumJadeDark`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
