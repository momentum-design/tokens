const glob = require("glob");
const path = require("path");

describe("momentumRoseLight", () => {
  glob.sync("./dist/momentumRoseLight.json").forEach(function (file) {
    const fileContent = require(path.resolve(file));
    it(`should match snapshot of momentumRoseLight`, () => {
      expect(fileContent).toMatchSnapshot();
    });
  });
});
