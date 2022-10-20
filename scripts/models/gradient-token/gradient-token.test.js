const Token = require("../token");

const GradientToken = require("./gradient-token");

describe("models.GradientToken", () => {
  describe("static", () => {
    describe("constructor()", () => {
      const format = GradientToken.CONSTANTS.TOKEN_FORMATS.STANDARD;

      it("should extend Token", () => {
        const gradientToken = new GradientToken({ format });

        expect(gradientToken instanceof Token).toBe(true);
      });

      it("should automatically assign the ColorToken's category", () => {
        const gradientToken = new GradientToken({ format });

        expect(gradientToken.category).toBe(GradientToken.CONSTANTS.CATEGORIES.COLOR);
      });
    });

    describe("#CONSTANTS", () => {
      it("should match the Token constants definition", () => {
        expect(GradientToken.CONSTANTS).toMatchObject(Token.CONSTANTS);
      });

      it("should be immutable", () => {
        const constants = GradientToken.CONSTANTS;

        constants.EXTRA = "hello world";

        expect(GradientToken.CONSTANTS.EXTRA).toBeUndefined();
      });
    });

    describe("mergeGradations()", () => {
      const destination = {
        a: { key: "value" },
        b: { key: "value" },
        c: { key: "value" },
      };

      const source = {
        c: { key: "value-2" },
        d: { key: "value-2" },
        e: { key: "value-2" },
      };

      let spy;

      beforeEach(() => {
        spy = jest.spyOn(GradientToken, "mergeThemes").mockImplementation(({ source }) => ({ ...source }));
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to merge all source themes", () => {
        GradientToken.mergeGradations({ destination, source });
        expect(spy).toHaveBeenCalledTimes(3);
      });

      it("should return an object containing the merged gradations from source and destination", () => {
        const final = GradientToken.mergeGradations({ destination, source });
        expect(Object.keys(final).length).toBe(5);
      });

      it("should override any shared values with the source values", () => {
        const final = GradientToken.mergeGradations({ destination, source });
        expect(final).toMatchObject(source);
      });
    });

    describe("mergeThemes()", () => {
      const destination = {
        a: { key: "value" },
        b: { key: "value" },
        c: { key: "value" },
      };

      const source = {
        c: { key: "value-2" },
        d: { key: "value-2" },
        e: { key: "value-2" },
      };

      let spy;

      beforeEach(() => {
        spy = jest.spyOn(GradientToken, "mergeTiers").mockImplementation(({ source }) => ({ ...source }));
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to merge all source themes", () => {
        GradientToken.mergeThemes({ destination, source });
        expect(spy).toHaveBeenCalledTimes(3);
      });

      it("should return an object containing the merged gradations from source and destination", () => {
        const final = GradientToken.mergeThemes({ destination, source });
        expect(Object.keys(final).length).toBe(5);
      });

      it("should override any shared values with the source values", () => {
        const final = GradientToken.mergeThemes({ destination, source });
        expect(final).toMatchObject(source);
      });
    });

    describe("mergeTiers()", () => {
      const destination = {
        a: ["a", "b"],
        b: ["c", "d"],
        c: ["e", "f"],
      };

      const source = {
        c: ["g", "h"],
        d: ["i", "j"],
        e: ["k", "l"],
      };

      let spy;

      beforeEach(() => {
        spy = jest.spyOn(GradientToken, "mergeColors").mockImplementation(({ source }) => [...source]);
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to merge all source themes", () => {
        GradientToken.mergeTiers({ destination, source });
        expect(spy).toHaveBeenCalledTimes(3);
      });

      it("should return an object containing the merged gradations from source and destination", () => {
        const final = GradientToken.mergeTiers({ destination, source });
        expect(Object.keys(final).length).toBe(5);
      });

      it("should override any shared values with the source values", () => {
        const final = GradientToken.mergeTiers({ destination, source });
        expect(final).toMatchObject(source);
      });
    });

    describe("mergeColors()", () => {
      const destination = ["a", "b"];
      const source = ["a", "c"];

      it("should return a merged gradient color with two entries", () => {
        expect(GradientToken.mergeColors({ destination, source }).length).toBe(2);
      });

      it("should override the destination colors with the source colors", () => {
        expect(GradientToken.mergeColors({ destination, source })).toMatchObject(source);
      });

      it("should not mismatch the order of the source object when overriding", () => {
        const final = GradientToken.mergeColors({ destination, source });

        expect(final[0]).toBe(source[0]);
        expect(final[1]).toBe(source[1]);
      });
    });

    describe("normalizeGradations()", () => {
      const gradations = {
        a: { key: "value" },
        b: { key: "value" },
        c: { key: "value" },
      };

      let format;
      let spy;

      beforeEach(() => {
        format = GradientToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
        spy = jest.spyOn(GradientToken, "normalizeThemes").mockImplementation(({ source }) => ({ ...source }));
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return the provided gradations when format is "standard"', () => {
        expect(GradientToken.normalizeGradations({ format, gradations })).toBe(gradations);
      });

      it('should attempt to normalize the themes when the format is "automated"', () => {
        format = GradientToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;
        GradientToken.normalizeGradations({ format, gradations });

        expect(spy).toHaveBeenCalledTimes(3);
      });

      it("should throw an error if the provided format is not supported", () => {
        expect(() => ColorToken.normalizeGradations({ format: "invalid", gradations })).toThrow();
      });
    });

    describe("normalizeThemes()", () => {
      const themes = {
        "type-gradation-dark-first": {
          colors: {
            0: { rgba: { r: 0, g: 1, b: 2, a: 3 } },
            1: { rgba: { r: 4, g: 5, b: 6, a: 7 } },
          },
        },
        "type-gradation-dark-second": {
          colors: {
            0: { rgba: { r: 8, g: 9, b: 10, a: 11 } },
            1: { rgba: { r: 12, g: 13, b: 14, a: 15 } },
          },
        },
        "type-gradation-light-first": {
          colors: {
            0: { rgba: { r: 16, g: 17, b: 18, a: 19 } },
            1: { rgba: { r: 20, g: 21, b: 22, a: 23 } },
          },
        },
        "type-gradation-light-second": {
          colors: {
            0: { rgba: { r: 24, g: 25, b: 26, a: 27 } },
            1: { rgba: { r: 28, g: 29, b: 30, a: 31 } },
          },
        },
      };

      let format;

      beforeEach(() => {
        format = GradientToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return the provided gradations when format is "standard"', () => {
        expect(GradientToken.normalizeThemes({ format, themes })).toBe(themes);
      });

      it('should normalize the provided theme names when the format is "automated"', () => {
        format = GradientToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;
        const final = GradientToken.normalizeThemes({ format, themes });

        Object.keys(themes).forEach((name) => {
          const [type, gradation, theme, tier] = name.split("-");

          expect(final[theme][tier]).toBeDefined();
        });
      });

      it('should normalize the provided theme values when the format is "automated"', () => {
        format = GradientToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;
        const final = GradientToken.normalizeThemes({ format, themes });

        Object.keys(themes).forEach((name) => {
          const [type, gradation, theme, tier] = name.split("-");
          const target = final[theme][tier];
          const { r: r0, g: g0, b: b0, a: a0 } = themes[name].colors["0"].rgba;
          const { r: r1, g: g1, b: b1, a: a1 } = themes[name].colors["1"].rgba;
          const first = `rgba(${r0}, ${g0}, ${b0}, ${a0})`;
          const second = `rgba(${r1}, ${g1}, ${b1}, ${a1})`;

          expect(target[0]).toBe(first);
          expect(target[1]).toBe(second);
        });
      });

      it("should throw an error if the provided format is not supported", () => {
        expect(() => ColorToken.normalizeThemes({ format: "invalid", gradations })).toThrow();
      });
    });
  });

  describe("scoped", () => {
    describe("mergeData()", () => {
      const format = GradientToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      const currentData = { gradation: { a: "1" } };
      const nextData = { gradation: { a: "2" } };

      let spy;
      let first;
      let second;

      beforeEach(() => {
        first = new GradientToken({ format, data: currentData });
        second = new GradientToken({ format, data: nextData });
        spy = jest.spyOn(GradientToken, "mergeGradations").mockImplementation(({ source }) => ({ ...source }));
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to merge gradations", () => {
        first.mergeData({ data: second.data });

        expect(spy).toHaveBeenCalledWith({
          destination: currentData.gradation,
          source: second.data.gradation,
        });
      });

      it("should return itself", () => {
        expect(first.mergeData({ data: second.data })).toBe(first);
      });
    });

    describe("normalizeData()", () => {
      const format = GradientToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      const data = { gradation: { a: "1" } };

      let spy;
      let token;

      beforeEach(() => {
        token = new GradientToken({ format, data });
        spy = jest.spyOn(GradientToken, "normalizeGradations").mockImplementation(({ gradations }) => ({ ...gradations }));
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to merge gradations", () => {
        token.normalizeData();

        expect(spy).toHaveBeenCalledWith({
          format,
          gradations: data.gradation,
        });
      });

      it("should return itself", () => {
        expect(token.normalizeData()).toBe(token);
      });
    });
  });
});
