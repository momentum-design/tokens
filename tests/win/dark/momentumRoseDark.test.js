const glob = require("glob");
const path = require("path");

describe("momentumRoseDark", () => {
  glob.sync("./dist/momentumRoseDark.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumRoseDark`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
