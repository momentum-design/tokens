const Token = require("../token");

/**
 * Token used to represent a gradient token collection.
 */
class GradientToken extends Token {
  /**
   * Construct a new ColorToken.
   *
   * @param {Token.Config} config GradientToken configuration Object.
   */
  constructor(config) {
    super({ category: Token.CONSTANTS.CATEGORIES.COLOR, ...config });
  }

  /**
   * Merge a GradientToken Object's data into this GradientToken Object's data. The first key in the data object for
   * GradationToken.Data Objects is a redundant `gradation`, with the rest of the object nested below. This just happens
   * to be the normalized shape from our existing local tokens.
   *
   * @param {DTO} dto
   * @param {GradientToken.Data} dto.data Data to be merged into this Token Object's data.
   * @returns {This} This GradientToken.
   */
  mergeData({ data }) {
    this.data = { gradation: GradientToken.mergeGradations({ destination: this.data.gradation, source: data.gradation }) };

    return this;
  }

  /**
   * Normalize the Data of this GradientToken into the `standard` format.
   *
   * @returns {This} This GradientToken.
   */
  normalizeData() {
    this.data = { gradation: GradientToken.normalizeGradations({ format: this.format, gradations: this.data.gradation }) };

    return this;
  }

  /**
   * Merge GradientToken Gradations into an existing GradientToken's Gradations.
   *
   * @param {DTO} dto
   * @param {GradientToken.Gradations} dto.source GradientToken Gradations to merge into the destination GradientToken Gradations.
   * @param {GradientToken.Gradations} [dto.destination] GradientToken Gradations to be receiving a merge.
   * @returns {GradientToken.Gradations} Merged GradientToken Gradations.
   */
  static mergeGradations({ destination = {}, source }) {
    return Object.entries(source).reduce(
      (final, [gradation, themes]) => ({
        ...final,
        [gradation]: GradientToken.mergeThemes({ destination: destination[gradation], source: themes }),
      }),
      { ...destination }
    );
  }

  /**
   * Merge GradientToken Themes into an existing GradientToken's Themes.
   *
   * @param {DTO} dto
   * @param {GradientToken.Themes} dto.source GradientToken Themes to merge into the destination GradientToken Themes.
   * @param {GradientToken.Themes} [dto.destination] GradientToken Themes to be receiving a merge.
   * @returns {GradientToken.Themes} Merged GradientToken Themes.
   */
  static mergeThemes({ destination = {}, source }) {
    return Object.entries(source).reduce(
      (final, [theme, tiers]) => ({
        ...final,
        [theme]: GradientToken.mergeTiers({ destination: destination[theme], source: tiers }),
      }),
      { ...destination }
    );
  }

  /**
   * Merge GradientToken Tiers into an existing GradientToken's Tiers.
   *
   * @param {DTO} dto
   * @param {GradientToken.Tiers} dto.source GradientToken Tiers to merge into the destination GradientToken Tiers.
   * @param {GradientToken.Tiers} [dto.destination] GradientToken Tiers to be receiving a merge.
   * @returns {GradientToken.Tiers} Merged GradientToken Tiers.
   */
  static mergeTiers({ destination = {}, source }) {
    return Object.entries(source).reduce(
      (final, [tier, colors]) => ({
        ...final,
        [tier]: GradientToken.mergeColors({ destination: destination[tier], source: colors }),
      }),
      { ...destination }
    );
  }

  /**
   * Merge GradientToken Colors into an existing GradientToken's Colors.
   *
   * @param {DTO} dto
   * @param {GradientToken.Colors} dto.source GradientToken Colors to merge into the destination GradientToken Colors.
   * @param {GradientToken.Colors} [dto.destination] GradientToken Colors to be receiving a merge.
   * @returns {GradientToken.Colors} Merged GradientToken Colors.
   */
  static mergeColors({ destination = [], source }) {
    return source.reduce(
      (final, color, index) => {
        const mutable = [...final];
        mutable[index] = color;

        return mutable;
      },
      [...destination]
    );
  }

  /**
   * Normalize GradientToken Gradations.
   *
   * @param {DTO} dto
   * @param {GradientToken.Gradations} dto.gradations Gradations to be normalized.
   * @param {GradientToken.Format} dto.format Format of the provided Gradations.
   * @returns {GradientToken.Gradations} The provided GradientToken Gradations, normalized.
   */
  static normalizeGradations({ format, gradations }) {
    let normalized;

    switch (format) {
      case GradientToken.CONSTANTS.TOKEN_FORMATS.STANDARD:
        normalized = gradations;
        break;

      case GradientToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED:
        normalized = Object.entries(gradations).reduce(
          (mutated, [key, value]) => ({
            ...mutated,
            [key]: GradientToken.normalizeThemes({ format, themes: value }),
          }),
          {}
        );
        break;

      case GradientToken.CONSTANTS.TOKEN_FORMATS.DESIGN:
        normalized = Object.entries(gradations).reduce((mutated, [key, value]) => {
          const normalized = GradientToken.normalizeThemes({ format, themes: value });
          return {
            ...mutated,
            [key]: { ...normalized },
          };
        }, {});
        break;

      default:
        throw new Error(`models.GradientToken.normalizeGradations() :: "${from}" is not a supported format`);
    }

    return normalized;
  }

  /**
   * Normalize GradientToken Themes.
   *
   * @param {DTO} dto
   * @param {GradientToken.Themes} dto.gradations Themes to be normalized.
   * @param {GradientToken.Format} dto.format Format of the provided Themes.
   * @returns {GradientToken.Themes} The provided GradientToken Themes, normalized.
   */
  static normalizeThemes({ format, themes }) {
    let normalized;

    switch (format) {
      case GradientToken.CONSTANTS.TOKEN_FORMATS.STANDARD:
        normalized = themes;
        break;

      case GradientToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED:
        normalized = Object.entries(themes).reduce((mutated, [key, value]) => {
          const mutable = { ...mutated };
          const [type, gradation, theme, tier] = key.split("-");

          if (!mutable[theme]) {
            mutable[theme] = {};
          }

          if (!mutable[theme][tier]) {
            mutable[theme][tier] = [];
          }

          const target = mutable[theme][tier];
          const { r: r0, g: g0, b: b0, a: a0 } = value.colors["0"].rgba;
          const { r: r1, g: g1, b: b1, a: a1 } = value.colors["1"].rgba;

          target.push(`rgba(${r0}, ${g0}, ${b0}, ${a0})`);
          target.push(`rgba(${r1}, ${g1}, ${b1}, ${a1})`);

          return mutable;
        }, {});
        break;

      case GradientToken.CONSTANTS.TOKEN_FORMATS.DESIGN:
        normalized = Object.entries(themes).reduce((mutated, [key, value]) => {
          const scheme = Object.entries(value).reduce((level, [key, value]) => {
            level[key] = level[key] || {};
            level[key] = [value.value];
            return { ...level };
          }, {});
          mutated[key] = mutated[key] || {};
          mutated[key] = { ...scheme };
          return { ...mutated };
        }, {});
        break;

      default:
        throw new Error(`models.GradientToken.normalizeGradations() :: "${from}" is not a supported format`);
    }

    return normalized;
  }

  /**
   * Constants associated with the GradientToken Object.
   *
   * @type {GradientToken.Constants}
   */
  static get CONSTANTS() {
    return { ...Token.CONSTANTS };
  }
}

module.exports = GradientToken;
