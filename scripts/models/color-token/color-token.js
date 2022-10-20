const Token = require("../token");

/**
 * Token used to represent a color token collection.
 */
class ColorToken extends Token {
  /**
   * Construct a new ColorToken.
   *
   * @param {Token.Config} config ColorToken configuration Object.
   */
  constructor(config) {
    super({ category: Token.CONSTANTS.CATEGORIES.COLOR, ...config });
  }

  /**
   * Merge a ColorToken Object's data into this ColorToken Object's Data.
   *
   * @protected
   * @param {DTO} dto
   * @param {ColorToken.Data} dto.data Data to be merged into this Token Object's data.
   * @returns {This} This ColorToken.
   */
  mergeData({ data }) {
    this.data = ColorToken.mergeColors({ destination: this.data, source: data });

    return this;
  }

  /**
   * Normalize the Data of this ColorToken into the `standard` format.
   *
   * @protected
   * @returns {This} This ColorToken.
   */
  normalizeData() {
    this.data = ColorToken.normalizeColors({ colors: this.data, format: this.format });

    return this;
  }

  /**
   * Merge ColorToken Grades into an existing ColorToken's Grades.
   *
   * @private
   * @param {DTO} dto
   * @param {ColorToken.Grades} dto.source ColorToken Grades to merge into the destination ColorToken Grades.
   * @param {ColorToken.Grades} dto.destination ColorToken Grades to be receiving a merge.
   * @returns {ColorToken.Grades} Merged ColorToken Grades.
   */
  static mergeColors({ destination = {}, source }) {
    return Object.entries(source).reduce(
      (final, [color, value]) => ({
        ...final,
        [color]: ColorToken.mergeGrades({ source: value, destination: destination[color] }),
      }),
      { ...destination }
    );
  }

  /**
   * Merge ColorToken Grades into an existing ColorToken's Grades.
   *
   * @param {DTO} dto
   * @param {ColorToken.Grades} dto.source ColorToken Grades to merge into the destination ColorToken Grades.
   * @param {ColorToken.Grades} dto.destination ColorToken Grades to be receiving a merge.
   * @returns {ColorToken.Grades} Merged ColorToken Grades.
   */
  static mergeGrades({ destination = {}, source }) {
    return Object.entries(source).reduce((final, [grade, value]) => ({ ...final, [grade]: value }), { ...destination });
  }

  /**
   * Normalize ColorToken Colors.
   *
   * @param {DTO} dto
   * @param {ColorToken.Colors} dto.colors Colors to be normalized.
   * @param {ColorToken.Format} dto.format Format of the provided Colors.
   * @returns {ColorToken.Colors} The provided ColorToken Colors, normalized.
   */
  static normalizeColors({ colors, format }) {
    let normalized;

    switch (format) {
      case ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD:
        normalized = colors;
        break;

      case ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED:
        normalized = Object.entries(colors).reduce(
          (mutated, [key, value]) => ({
            ...mutated,
            [key]: ColorToken.normalizeGrades({ format, grades: value }),
          }),
          {}
        );
        break;

      default:
        throw new Error(`models.ColorToken.normalizeColors() :: "${format}" is not a supported format`);
    }

    return normalized;
  }

  /**
   * Normalize ColorToken Grades.
   *
   * @param {DTO} dto
   * @param {ColorToken.Grades} dto.colors Grades to be normalized.
   * @param {ColorToken.Format} dto.format Format of the provided Grades.
   * @returns {ColorToken.Grades} The provided ColorToken Grades, normalized.
   */
  static normalizeGrades({ format, grades }) {
    let normalized;

    switch (format) {
      case ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD:
        normalized = grades;
        break;

      case ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED:
        normalized = Object.entries(grades).reduce(
          (
            mutated,
            [
              key,
              {
                rgba: { r, g, b, a },
              },
            ]
          ) => ({
            ...mutated,
            [key.split("-").pop()]: `rgba(${r}, ${g}, ${b}, ${a})`,
          }),
          {}
        );
        break;

      default:
        throw new Error(`models.ColorToken.normalizeGrades() :: "${format}" is not a supported format`);
    }

    return normalized;
  }

  /**
   * Constants associated with the ColorToken Object.
   *
   * @type {ColorToken.Constants}
   */
  static get CONSTANTS() {
    return { ...Token.CONSTANTS };
  }
}

module.exports = ColorToken;
