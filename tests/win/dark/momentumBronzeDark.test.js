const glob = require("glob");
const path = require("path");

describe("momentumBronzeDark", () => {
  glob.sync("./dist/momentumBronzeDark.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumBronzeDark`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
