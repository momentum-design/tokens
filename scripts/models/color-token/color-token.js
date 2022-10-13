const Token = require("../token");

/**
 * Token used to represent a color token collection.
 */
class ColorToken extends Token {
  /**
   * Construct a new ColorToken.
   *
   * @param {Token.Config} dto - ColorToken configuration Object.
   */
  constructor(config) {
    super({ category: Token.CONSTANTS.CATEGORIES.COLOR, ...config });
  }

  /**
   * Update the format of this ColorToken.
   *
   * @param {DTO} dto
   * @param {Token.Format} dto.format - The format to update this ColorToken to.
   * @returns {this} - This ColorToken.
   */
  updateFormat({ format }) {
    const final = ColorToken.translateColors({ from: this.format, to: format, colors: this.data });
    this.format = format;
    this.data = final;

    return this;
  }

  /**
   * Normalizes this ColorToken into the project's Standard format.
   *
   * @returns {this} - This color token.
   */
  normalize() {
    return this.updateFormat({ format: Token.CONSTANTS.TOKEN_FORMATS.STANDARD });
  }

  /**
   * Constants associated with the ColorToken Object.
   */
  static get CONSTANTS() {
    return { ...Token.CONSTANTS };
  }

  /**
   * Merge ColorToken Grades into an existing ColorToken's Grades.
   *
   * @param {DTO} dto
   * @param {ColorToken.Grades} dto.source - ColorToken Grades to merge into the destination ColorToken Grades.
   * @param {ColorToken.Grades} dto.destination - ColorToken Grades to be receiving a merge.
   * @returns {ColorToken.Grades} - Merged ColorToken Grades.
   */
  static mergeGrades({ source, destination }) {
    return Object.entries(source).reduce((final, [grade, value]) => ({ ...final, [grade]: value }), { ...destination });
  }

  /**
   * Merge ColorToken Colors into an existing ColorToken's Colors.
   *
   * @param {DTO} dto
   * @param {ColorToken.Colors} dto.source - ColorToken Colors to merge into the destination ColorToken Colors.
   * @param {ColorToken.Colors} dto.destination - ColorToken Colors to be receiving a merge.
   * @returns {ColorToken.Colors} - Merged ColorToken Colors.
   */
  static mergeColors({ source, destination }) {
    return Object.entries(source).reduce(
      (final, [color, value]) => ({
        ...final,
        [color]: ColorToken.mergeGrades({ source: value, destination: destination[color] }),
      }),
      { ...destination }
    );
  }

  /**
   * Merge a ColorToken into an existing ColorToken.
   *
   * @param {DTO} dto
   * @param {ColorToken} dto.source - ColorToken to merge into the destination ColorToken.
   * @param {ColorToken} dto.destination - ColorToken to be receiving a merge.
   * @returns {ColorToken} - Merged ColorToken.
   */
  static merge({ source, destination }) {
    if (source.category !== Token.CONSTANTS.CATEGORIES.COLOR || destination.category !== Token.CONSTANTS.CATEGORIES.COLOR) {
      throw new Error(`models.ColorToken.merge() :: cannot merge non-ColorToken tokens`);
    } else if (source.format !== destination.format) {
      throw new Error(`models.ColorToken.merge() :: cannot merge non-matching formatted tokens`);
    } else if (source.format !== Token.CONSTANTS.TOKEN_FORMATS.STANDARD) {
      throw new Error(`models.ColorToken.merge() :: source token format must be "${Token.CONSTANTS.TOKEN_FORMATS.STANDARD}`);
    } else if (destination.format !== Token.CONSTANTS.TOKEN_FORMATS.STANDARD) {
      throw new Error(`models.ColorToken.merge() :: destination token format must be "${Token.CONSTANTS.TOKEN_FORMATS.STANDARD}`);
    }

    const data = ColorToken.mergeColors({
      source: source.data,
      destination: destination.data,
    });

    return new ColorToken({
      format: Token.CONSTANTS.TOKEN_FORMATS.STANDARD,
      category: Token.CONSTANTS.CATEGORIES.COLOR,
      data: data,
    }).normalize();
  }

  /**
   * Translate the format of a ColorToken's Grades.
   *
   * @param {DTO} dto
   * @param {Token.Format} dto.from - The ColorToken Grades' current format.
   * @param {Token.Format} [dto.to] - The ColorToken Grades' desired format.
   * @param {ColorToken.Grades} dto.grades - The ColorToken Grades to be formatted.
   * @returns {ColorToken.Grades} - Formatted ColorToken Grades.
   */
  static translateGrades({ from, to = Token.CONSTANTS.TOKEN_FORMATS.STANDARD, grades }) {
    let final;

    switch (from) {
      case Token.CONSTANTS.TOKEN_FORMATS.STANDARD:
        final = grades;
        break;

      case Token.CONSTANTS.TOKEN_FORMATS.AUTOMATED:
        final = Object.entries(grades).reduce((formatted, [key, value]) => {
          const mutable = { ...formatted };
          const grade = key.split("-").pop();
          const { r, g, b, a } = value.rgba;

          mutable[grade] = `rgba(${r}, ${g}, ${b}, ${a})`;

          return mutable;
        }, {});
        break;

      default:
        throw new Error(`models.ColorToken.translateGrades() :: "${from}" is not a supported "from" format`);
    }

    switch (to) {
      case Token.CONSTANTS.TOKEN_FORMATS.STANDARD:
        final = final;
        break;

      default:
        throw new Error(`models.ColorToken.translateGrades() :: "${to}" is not a supported "to" format`);
    }

    return final;
  }

  /**
   * Translate the format of a ColorToken's Colors.
   *
   * @param {DTO} dto
   * @param {Token.Format} dto.from - The ColorToken Colors' current format.
   * @param {Token.Format} [dto.to] - The ColorToken Colors' desired format.
   * @param {ColorToken.Colors} dto.grades - The ColorToken Colors to be formatted.
   * @returns {ColorToken.Colors} - Formatted ColorToken Colors.
   */
  static translateColors({ from, to, colors }) {
    let final;

    switch (from) {
      case Token.CONSTANTS.TOKEN_FORMATS.STANDARD:
        final = colors;
        break;

      case Token.CONSTANTS.TOKEN_FORMATS.AUTOMATED:
        final = Object.entries(colors).reduce(
          (formatted, [key, value]) => ({
            ...formatted,
            [key]: ColorToken.translateGrades({ from, to, grades: value }),
          }),
          {}
        );
        break;

      default:
        throw new Error(`models.ColorToken.translateGrades() :: "${from}" is not a supported "from" format`);
    }

    switch (to) {
      case Token.CONSTANTS.TOKEN_FORMATS.STANDARD:
        final = final;
        break;

      default:
        throw new Error(`models.ColorToken.translateGrades() :: "${to}" is not a supported "to" format`);
    }

    return final;
  }
}

module.exports = ColorToken;
