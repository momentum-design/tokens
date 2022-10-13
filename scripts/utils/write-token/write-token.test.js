const fs = require("fs/promises");
const path = require("path");

const writeToken = require("./write-token");

describe("utils.writeToken", () => {
  describe("writeToken()", () => {
    const projectDir = process.cwd();
    const serial = JSON.stringify({
      a: "1",
      b: "2",
      c: "3",
    });
    const target = "test";

    let spy;

    beforeEach(() => {
      spy = jest.spyOn(fs, "writeFile").mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should attempt to write file to the target destination ammended to the project directory", () => {
      writeToken(target, serial);

      expect(spy).toHaveBeenCalledWith(path.join(projectDir, target), expect.anything());
    });

    it("should ammend a new line to the end of the provided serial string", () => {
      writeToken(target, serial);

      const mutatedSerial = `${serial}\n`;

      expect(spy).toHaveBeenCalledWith(expect.anything(), mutatedSerial);
    });
  });
});
