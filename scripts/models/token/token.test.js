const Token = require("./token");
const CONSTANTS = require("./token.constants");

describe("models.Token", () => {
  describe("static", () => {
    describe("constructor()", () => {
      const category = Token.CONSTANTS.CATEGORIES.COLOR;
      const format = Token.CONSTANTS.TOKEN_FORMATS.STANDARD;

      it("should throw an error if no category is provided", () => {
        expect(() => {
          new Token({ format });
        }).toThrow();
      });

      it("should throw an error if no category is provided", () => {
        expect(() => {
          new Token({ category });
        }).toThrow();
      });

      it("should throw an error if the provided category is not valid", () => {
        expect(() => {
          new Token({ category: "not-valid", format });
        }).toThrow();
      });

      it("should throw an error if the provided category is not valid", () => {
        expect(() => {
          new Token({ category, format: "not-valid" });
        }).toThrow();
      });

      it(`should accept the '${Token.CONSTANTS.CATEGORIES.COLOR}' category`, () => {
        expect(() => {
          new Token({ category: Token.CONSTANTS.CATEGORIES.COLOR, format });
        }).not.toThrow();
      });

      it("should assign the provided category to itself", () => {
        const token = new Token({ category, format });

        expect(token.category).toBe(category);
      });

      it("should assign the provided data to itself", () => {
        const data = { value: "example" };

        const token = new Token({ category, data, format });

        expect(token.data).toBe(data);
      });

      it("should assign the provided name to itself", () => {
        const name = "example";

        const token = new Token({ category, format, name });

        expect(token.name).toBe(name);
      });
    });

    describe("#CONSTANTS", () => {
      it("should match the local constants definition", () => {
        expect(Token.CONSTANTS).toMatchObject(CONSTANTS);
      });

      it("should be immutable", () => {
        const constants = Token.CONSTANTS;

        constants.EXTRA = "hello world";

        expect(Token.CONSTANTS.EXTRA).toBeUndefined();
      });
    });
  });

  describe("scoped", () => {
    describe("#serial", () => {
      const category = Token.CONSTANTS.CATEGORIES.COLOR;
      const data = {
        "color-a": {
          "00": "#123456",
          100: "#654321",
        },
        "color-b": {
          100: "#111111",
          "00": "#222222",
        },
      };
      const format = Token.CONSTANTS.TOKEN_FORMATS.STANDARD;

      it("should assign the data to the category in the serial", () => {
        const token = new Token({ category, data, format });

        const serial = JSON.parse(token.serial);

        expect(serial[category]).toMatchObject(data);
      });

      it("should convert the data into a string", () => {
        const token = new Token({ category, data, format });

        expect(typeof token.serial).toBe("string");
      });
    });

    describe("canMerge()", () => {
      const category = Token.CONSTANTS.CATEGORIES.COLOR;
      const format = Token.CONSTANTS.TOKEN_FORMATS.STANDARD;

      it("should return false with an appropriate message when the provided token does not have matching categories", () => {
        const primary = new Token({ category, format });
        const secondary = new Token({ category, format });

        secondary.category = "different";

        expect(primary.canMerge({ token: secondary })).toMatchObject({
          can: false,
          reason: 'token "category" properties do not match',
        });
      });

      it('should return false with an appropriate message when the source Token is not in the "standard" format', () => {
        const primary = new Token({ category, format: Token.CONSTANTS.TOKEN_FORMATS.AUTOMATED });
        const secondary = new Token({ category, format });

        expect(primary.canMerge({ token: secondary })).toMatchObject({
          can: false,
          reason: `token format "${primary.format}" for this token cannot be merged, normalize this token first`,
        });
      });

      it('should return false with an appropriate message when the target Token is not in the "standard" format', () => {
        const primary = new Token({ category, format });
        const secondary = new Token({ category, format: Token.CONSTANTS.TOKEN_FORMATS.AUTOMATED });

        expect(primary.canMerge({ token: secondary })).toMatchObject({
          can: false,
          reason: `token format "${secondary.format}" for this token cannot be merged, normalize the provided token first`,
        });
      });

      it("should return true with no reason when the target Token can be merged", () => {
        const primary = new Token({ category, format });
        const secondary = new Token({ category, format });

        expect(primary.canMerge({ token: secondary })).toMatchObject({
          can: true,
          reason: undefined,
        });
      });
    });

    describe("merge()", () => {
      const category = Token.CONSTANTS.CATEGORIES.COLOR;
      const format = Token.CONSTANTS.TOKEN_FORMATS.STANDARD;

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should throw an error when the provided token cannot be merged", () => {
        const primary = new Token({ category, format });
        const secondary = new Token({ category, format: Token.CONSTANTS.TOKEN_FORMATS.AUTOMATED });

        jest.spyOn(primary, "mergeData").mockImplementation(() => undefined);

        expect(() => primary.merge({ token: secondary })).toThrow();
      });

      it("should attempt to merge its data with the provided token", () => {
        const primary = new Token({ category, format });
        const secondary = new Token({ category, format });

        const spy = jest.spyOn(primary, "mergeData").mockImplementation(() => undefined);

        primary.merge({ token: secondary });

        expect(spy).toHaveBeenCalledWith({ data: secondary.data });
      });
    });

    describe("normalize()", () => {
      const category = Token.CONSTANTS.CATEGORIES.COLOR;
      const format = Token.CONSTANTS.TOKEN_FORMATS.STANDARD;

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to normalize the data of this Token", () => {
        const token = new Token({ category, format });

        const spy = jest.spyOn(token, "normalizeData").mockImplementation(() => undefined);

        token.normalize();

        expect(spy).toHaveBeenCalled();
      });

      it("should update the format of this Token", () => {
        const token = new Token({ category, format: Token.CONSTANTS.TOKEN_FORMATS.AUTOMATED });

        const spy = jest.spyOn(token, "normalizeData").mockImplementation(() => undefined);

        token.normalize();

        expect(token.format).toBe(Token.CONSTANTS.TOKEN_FORMATS.STANDARD);
      });
    });

    describe("mergeData()", () => {
      it("should throw an error", () => {
        const token = new Token({
          category: Token.CONSTANTS.CATEGORIES.COLOR,
          format: Token.CONSTANTS.TOKEN_FORMATS.STANDARD,
        });

        expect(() => token.mergeData()).toThrow();
      });
    });

    describe("normalizeData()", () => {
      it("should throw an error", () => {
        const token = new Token({
          category: Token.CONSTANTS.CATEGORIES.COLOR,
          format: Token.CONSTANTS.TOKEN_FORMATS.STANDARD,
        });

        expect(() => token.normalizeData()).toThrow();
      });
    });
  });
});
