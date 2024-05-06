const glob = require("glob");
const path = require("path");

// momentumDefault = momentumLight (see token generator script for more details)

describe("momentumDefault", () => {
  glob.sync("./dist/momentumDefault.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumDefault`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
