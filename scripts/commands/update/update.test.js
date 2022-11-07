const { CONSTANTS } = require("../../common");

const utils = require("../../utils");

const update = require("./update");

describe("commands.update()", () => {
  let spy;

  beforeEach(() => {
    spy = jest.spyOn(utils, "writeToken").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should attempt to write a merged core color decorative token", () => {
    update("automated");
    expect(spy).toHaveBeenCalledWith(CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.DECORATIVE, expect.anything());
  });

  it("should attempt to write a merged core color functional token", () => {
    update("automated");
    expect(spy).toHaveBeenCalledWith(CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.DECORATIVE, expect.anything());
  });

  it("should attempt to write a merged core color gradation token", () => {
    update("automated");
    expect(spy).toHaveBeenCalledWith(CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.GRADATION, expect.anything());
  });

  // uncomment these once design tokens are published
  // it("should attempt to write a merged core color decorative token", () => {
  //   update("design");
  //   expect(spy).toHaveBeenCalledWith(CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.DECORATIVE, expect.anything());
  // });

  // it("should attempt to write a merged core color functional token", () => {
  //   update("design");
  //   expect(spy).toHaveBeenCalledWith(CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.DECORATIVE, expect.anything());
  // });

  // it("should attempt to write a merged core color gradation token", () => {
  //   update("design");
  //   expect(spy).toHaveBeenCalledWith(CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.GRADATION, expect.anything());
  // });
});
