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

    describe("normalizeColors()", () => {
      let colors;
      let format;

      beforeEach(() => {
        colors = {
          ["color-name"]: {
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
          },
        };
        format = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return the provided colors if the format is "standard"', () => {
        expect(ColorToken.normalizeColors({ colors, format })).toMatchObject(colors);
      });

      it("should attempt to normalize the grades of each color", () => {
        format = ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;
        const spy = jest.spyOn(ColorToken, "normalizeGrades").mockImplementation(() => {});

        ColorToken.normalizeColors({ colors, format });

        expect(spy).toHaveBeenCalledTimes(Object.values(colors).length);
      });

      it("should throw an error if the provided format is not supported", () => {
        expect(() => ColorToken.normalizeColors({ colors, format: "invalid" })).toThrow();
      });
    });

    describe("normalizeGrades()", () => {
      let format;
      let grades;

      beforeEach(() => {
        format = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
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
      });

      it('should return the provided colors if the format is "standard"', () => {
        expect(ColorToken.normalizeGrades({ format, grades })).toMatchObject(grades);
      });

      it('should return a convert rgba value when from is "automated"', () => {
        const final = ColorToken.normalizeGrades({ format: ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED, grades });
        const { r: ar, g: ag, b: ab, a: aa } = grades["color-20"].rgba;
        const { r: br, g: bg, b: bb, a: ba } = grades["color-40"].rgba;
        const expected20 = `rgba(${ar}, ${ag}, ${ab}, ${aa})`;
        const expected40 = `rgba(${br}, ${bg}, ${bb}, ${ba})`;

        expect(final["20"]).toStrictEqual(expected20);
        expect(final["40"]).toStrictEqual(expected40);
      });

      it("should throw an error if the provided format is not supported", () => {
        expect(() => ColorToken.normalizeGrades({ grades, format: "invalid" })).toThrow();
      });
    });
  });

  describe("scoped", () => {
    describe("mergeData()", () => {
      const format = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      const category = ColorToken.CONSTANTS.CATEGORIES.COLOR;

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to merge colors", () => {
        const data = { key: "value" };
        const primary = new ColorToken({ category, data: { ...data }, format });
        const secondary = new ColorToken({ category, data: { ...data }, format });
        const primaryData = { ...primary.data };
        const secondaryData = { ...secondary.data };

        const spy = jest.spyOn(ColorToken, "mergeColors").mockImplementation(() => {});

        primary.mergeData({ data: secondary.data });

        expect(spy).toHaveBeenCalledWith({ destination: primaryData, source: secondaryData });
      });

      it("should return itself", () => {
        const primary = new ColorToken({ category, format });
        const secondary = new ColorToken({ category, format });

        ColorToken.mergeColors = jest.fn().mockImplementation(() => {});

        const final = primary.mergeData({ data: secondary.data });

        expect(final).toBe(primary);
      });
    });

    describe("normalizeData()", () => {
      const format = ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      const category = ColorToken.CONSTANTS.CATEGORIES.COLOR;

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to normalize colors", () => {
        const data = { key: "value" };
        const primary = new ColorToken({ category, data: { ...data }, format });
        const primaryData = { ...primary.data };

        const spy = jest.spyOn(ColorToken, "normalizeColors").mockImplementation(() => {});

        primary.normalizeData();

        expect(spy).toHaveBeenCalledWith({ colors: primaryData, format: primary.format });
      });

      it("should return itself", () => {
        const primary = new ColorToken({ category, format });

        ColorToken.normalizeColors = jest.fn().mockImplementation(() => {});

        const final = primary.normalizeData();

        expect(final).toBe(primary);
      });
    });
  });
});
