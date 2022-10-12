const Token = require("../token");

const ColorToken = require("./color-token");

describe("models.ColorToken", () => {
  describe("static", () => {
    describe("constructor()", () => {
      const format = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;

      it("should extend Token", () => {
        const colorToken = new ColorToken({ format });

        expect(colorToken instanceof Token).toBe(true);
      });

      it("should automatically assign the ColorToken's category", () => {
        const colorToken = new ColorToken({ format });

        expect(colorToken.category).toBe(ColorToken.CONSTANTS.CATEGORIES.COLOR);
      });
    });

    describe("#CONSTANTS", () => {
      it("should match the Token constants definition", () => {
        expect(ColorToken.CONSTANTS).toMatchObject(Token.CONSTANTS);
      });

      it("should be immutable", () => {
        const constants = ColorToken.CONSTANTS;

        constants.EXTRA = "hello world";

        expect(ColorToken.CONSTANTS.EXTRA).toBeUndefined();
      });
    });

    describe("mergeGrades()", () => {
      const destination = {
        "00": "#111111",
        25: "#222222",
        75: "#333333",
      };
      const source = {
        "00": "#000000",
        50: "#888888",
        100: "#ffffff",
      };
      const merged = ColorToken.mergeGrades({ source, destination });

      it("should return ColorToken Grades containing all new color grades of the destination object", () => {
        expect(merged).toMatchObject(source);
      });

      it("should override any existing destination grades with source grades", () => {
        expect(merged["00"]).toBe(source["00"]);
      });

      it("should not duplicate any overwritten grades", () => {
        expect(Object.keys(merged).length).toBe(5);
      });
    });

    describe("mergeColors()", () => {
      const destination = {
        "color-a": {
          "00": "#111111",
        },
        "color-b": {
          "00": "#000000",
        },
      };
      const source = {
        "color-a": {
          "00": "#222222",
          50: "#444444",
        },
        "color-c": {
          "00": "#333333",
        },
      };
      const merged = ColorToken.mergeColors({ source, destination });

      it("should return ColorToken Colors containing all new colors of the destination object", () => {
        expect(merged).toMatchObject(source);
      });

      it("should override any existing destination colors with source colors", () => {
        expect(merged["color-a"]).toStrictEqual(source["color-a"]);
      });

      it("should not duplicate any overwritten grades", () => {
        expect(Object.keys(merged).length).toBe(3);
      });

      it("should merge all grades within the source colors into the destination colors", () => {
        expect(merged["color-a"]["50"]).toBe(source["color-a"]["50"]);
      });
    });

    describe("merge()", () => {
      const destinationData = {
        "color-a": {
          "00": "#111111",
          25: "#555555",
        },
        "color-b": {
          "00": "#000000",
        },
      };
      const sourceData = {
        "color-a": {
          "00": "#222222",
          50: "#444444",
        },
        "color-c": {
          "00": "#333333",
        },
      };

      const format = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;

      let destination;
      let source;

      beforeEach(() => {
        destination = new ColorToken({ data: destinationData, format });
        source = new ColorToken({ data: sourceData, format });
      });

      it("should throw an error when the source token's category isn't color", () => {
        source.category = "invalid";

        expect(() => ColorToken.merge({ destination, source })).toThrow();
      });

      it("should throw an error when the destination token's category isn't color", () => {
        destination.category = "invalid";

        expect(() => ColorToken.merge({ destination, source })).toThrow();
      });

      it("should throw an error when the destination and source token do not share a format", () => {
        source.format = ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;

        expect(() => ColorToken.merge({ destination, source })).toThrow();
      });

      it('should throw an error when the source token format is not "standard"', () => {
        source.format = "other-format";

        expect(() => ColorToken.merge({ destination, source })).toThrow();
      });

      it('should throw an error when the source token format is not "standard"', () => {
        source.format = ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;

        expect(() => ColorToken.merge({ destination, source })).toThrow();
      });

      it('should throw an error when the destination token format is not "standard"', () => {
        destination.format = ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;

        expect(() => ColorToken.merge({ destination, source })).toThrow();
      });

      it("should return a new ColorToken", () => {
        const final = ColorToken.merge({ destination, source });

        expect(final instanceof ColorToken).toBe(true);
      });

      it("should return a new ColorToken with merged data", () => {
        const final = ColorToken.merge({ destination, source });

        expect(final.data).toMatchObject(source.data);
        expect(Object.keys(final.data["color-a"]).length).toBe(3);
        expect(Object.keys(final.data).length).toBe(3);
      });
    });

    describe("translateGrades()", () => {
      let from;
      let grades;
      let to;

      beforeEach(() => {
        from = ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;
        grades = {
          ["color-20"]: {
            rgba: {
              r: 0,
              g: 1,
              b: 2,
              a: 1,
            },
          },
          ["color-40"]: {
            rgba: {
              r: 3,
              g: 4,
              b: 5,
              a: 0,
            },
          },
        };
        to = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      });

      it('should return the provided grades when from is "standard"', () => {
        from = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;

        const final = ColorToken.translateGrades({ from, to, grades });

        expect(final).toStrictEqual(grades);
      });

      it('should return a convert rgba value when from is "automated"', () => {
        const final = ColorToken.translateGrades({ from, to, grades });
        const { r: ar, g: ag, b: ab, a: aa } = grades["color-20"].rgba;
        const { r: br, g: bg, b: bb, a: ba } = grades["color-40"].rgba;
        const expected20 = `rgba(${ar}, ${ag}, ${ab}, ${aa})`;
        const expected40 = `rgba(${br}, ${bg}, ${bb}, ${ba})`;

        expect(final["20"]).toStrictEqual(expected20);
        expect(final["40"]).toStrictEqual(expected40);
      });

      it("should throw an error when the from value is not a supported value", () => {
        from = "invalid";

        expect(() => ColorToken.translateGrades({ from, to, grades })).toThrow();
      });

      it('should return the formatted token when to is "standard"', () => {
        from = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;

        const final = ColorToken.translateGrades({ from, to, grades });

        expect(final).toStrictEqual(grades);
      });

      it("should throw an error when the to value is not a supported value", () => {
        to = "invalid";

        expect(() => ColorToken.translateGrades({ from, to, grades })).toThrow();
      });
    });
  });
});
