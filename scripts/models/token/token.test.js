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

      it(`should accept the "${Token.CONSTANTS.CATEGORIES.COLOR}" category`, () => {
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
  });
});
