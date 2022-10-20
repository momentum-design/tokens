const Token = require("../token");

const SolidToken = require("./solid-token");

describe("models.SolidToken", () => {
  describe("static", () => {
    describe("constructor()", () => {
      const format = SolidToken.CONSTANTS.TOKEN_FORMATS.STANDARD;

      it("should extend Token", () => {
        const solidToken = new SolidToken({ format });

        expect(solidToken instanceof Token).toBe(true);
      });

      it("should automatically assign the SolidToken's category", () => {
        const solidToken = new SolidToken({ format });

        expect(solidToken.category).toBe(SolidToken.CONSTANTS.CATEGORIES.COLOR);
      });
    });

    describe("#CONSTANTS", () => {
      it("should match the Token constants definition", () => {
        expect(SolidToken.CONSTANTS).toMatchObject(Token.CONSTANTS);
      });

      it("should be immutable", () => {
        const constants = SolidToken.CONSTANTS;

        constants.EXTRA = "hello world";

        expect(SolidToken.CONSTANTS.EXTRA).toBeUndefined();
      });
    });

    describe("mergeTokens()", () => {
      const destination = {
        solid: {
          scheme: {
            theme: {
              primary: "#FFFFF",
              secondary: "#FFFFF",
            },
            theme2: {
              primary: "#FFFFF",
              secondary: "#FFFFF",
            },
          },
        },
      };
      const source = {
        solid: {
          scheme: {
            theme: {
              primary: "rgba(0, 0, 0, 0)",
              secondary: "rgba(0, 0, 0, 0)",
            },
            theme2: {
              primary: "rgba(0, 0, 0, 0)",
              secondary: "rgba(0, 0, 0, 0)",
            },
          },
        },
      };
      const merged = SolidToken.mergeTokens({ source, destination });

      it("should return SolidToken Colors containing all new colors of the destination object", () => {
        expect(merged).toMatchObject(source);
      });

      it("should override any existing destination colors with source colors", () => {
        expect(merged["solid"]).toStrictEqual(source["solid"]);
      });

      it("should not duplicate any overwritten grades", () => {
        expect(Object.keys(merged["solid"]["scheme"]).length).toBe(2);
      });

      it("should merge all grades within the source colors into the destination colors", () => {
        expect(merged["solid"]["scheme"]).toStrictEqual(source["solid"]["scheme"]);
      });
    });

    describe("normalizeColors()", () => {
      let colors;
      let format;

      beforeEach(() => {
        colors = {
          solid: {
            color: {
              "solid-color-light-primary": {
                rgba: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0,
                },
              },
              "solid-color-light-secondary": {
                rgba: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0,
                },
              },
              "solid-color-dark-primary": {
                rgba: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0,
                },
              },
              "solid-color-dark-secondary": {
                rgba: {
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0,
                },
              },
            },
          },
        };
        format = SolidToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return the provided colors if the format is "standard"', () => {
        expect(SolidToken.normalizeColors({ colors, format })).toMatchObject(colors);
      });

      it("should attempt to normalize the grades of each color", () => {
        format = SolidToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED;
        const spy = jest.spyOn(SolidToken, "normalizeTokens").mockImplementation((k) => k);

        SolidToken.normalizeColors({ colors, format });

        expect(spy).toHaveBeenCalledTimes(Object.values(colors).length);
      });

      it("should throw an error if the provided format is not supported", () => {
        expect(() => SolidToken.normalizeColors({ colors, format: "invalid" })).toThrow();
      });
    });

    describe("normalizeTokens()", () => {
      let format;
      let tokens;

      beforeEach(() => {
        format = SolidToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
        tokens = {
          color: {
            "solid-color-scheme-primary": {
              rgba: {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
              },
            },
            "solid-color-scheme-secondary": {
              rgba: {
                r: 0,
                g: 0,
                b: 0,
                a: 0,
              },
            },
          },
        };
      });

      it('should return the provided colors if the format is "standard"', () => {
        expect(SolidToken.normalizeTokens({ format, tokens })).toMatchObject(tokens);
      });

      it('should return a convert rgba value when format is "automated"', () => {
        const final = SolidToken.normalizeTokens({ format: SolidToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED, tokens: tokens.color });
        const { r: ar, g: ag, b: ab, a: aa } = tokens["color"]["solid-color-scheme-primary"].rgba;
        const { r: br, g: bg, b: bb, a: ba } = tokens["color"]["solid-color-scheme-secondary"].rgba;
        const expectedPrimary = `rgba(${ar}, ${ag}, ${ab}, ${aa})`;
        const expectedSecondary = `rgba(${br}, ${bg}, ${bb}, ${ba})`;

        expect(final["solid"]["color"]["scheme"]["primary"]).toStrictEqual(expectedPrimary);
        expect(final["solid"]["color"]["scheme"]["secondary"]).toStrictEqual(expectedSecondary);
      });

      it("should throw an error if the provided format is not supported", () => {
        expect(() => SolidToken.normalizeTokens({ grades, format: "invalid" })).toThrow();
      });
    });
  });

  describe("scoped", () => {
    describe("mergeData()", () => {
      const format = SolidToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      const category = SolidToken.CONSTANTS.CATEGORIES.COLOR;

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to merge colors", () => {
        const data = { key: "value" };
        const primary = new SolidToken({ category, data: { ...data }, format });
        const secondary = new SolidToken({ category, data: { ...data }, format });
        const primaryData = { ...primary.data };
        const secondaryData = { ...secondary.data };

        const spy = jest.spyOn(SolidToken, "mergeTokens").mockImplementation(() => {});

        primary.mergeData({ data: secondary.data });

        expect(spy).toHaveBeenCalledWith({ destination: primaryData, source: secondaryData });
      });

      it("should return itself", () => {
        const primary = new SolidToken({ category, format });
        const secondary = new SolidToken({ category, format });

        SolidToken.mergeColors = jest.fn().mockImplementation(() => {});

        const final = primary.mergeData({ data: secondary.data });

        expect(final).toBe(primary);
      });
    });

    describe("normalizeData()", () => {
      const format = SolidToken.CONSTANTS.TOKEN_FORMATS.STANDARD;
      const category = SolidToken.CONSTANTS.CATEGORIES.COLOR;

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it("should attempt to normalize colors", () => {
        const data = { key: "value" };
        const primary = new SolidToken({ category, data: { ...data }, format });
        const primaryData = { ...primary.data };

        const spy = jest.spyOn(SolidToken, "normalizeColors").mockImplementation(() => {});

        primary.normalizeData();

        expect(spy).toHaveBeenCalledWith({ colors: primaryData, format: primary.format });
      });

      it("should return itself", () => {
        const primary = new SolidToken({ category, format });

        SolidToken.normalizeColors = jest.fn().mockImplementation(() => {});

        const final = primary.normalizeData();

        expect(final).toBe(primary);
      });
    });
  });
});
