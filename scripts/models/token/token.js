const { sortObject } = require("../../utils");

const CONSTANTS = require("./token.constants");

/**
 * Abstract Token class to standardize token manipulation.
 *
 * @abstract
 */
class Token {
  /**
   * Construct a new Token.
   *
   * @param {Token.Config} dto - Token configuration Object.
   * @param {Token.Category} dto.category - The Category of the provided Token data.
   * @param {Token.Data} dto.data - The Data associated with this Token.
   * @param {Token.Format} dto.format - The Format of the provided Token data.
   * @param {Token.Name} dto.name - The name of this Token.
   */
  constructor({ category, data = {}, format, name }) {
    if (!Object.values(CONSTANTS.CATEGORIES).includes(category)) {
      throw new Error(`models.token.constructor() :: "${category}" is not a valid category`);
    }

    if (!Object.values(CONSTANTS.TOKEN_FORMATS).includes(format)) {
      throw new Error(`models.ColorToken.constructor() :: "${format}" is not a valid format`);
    }

    this.category = category;
    this.data = data;
    this.format = format;
    this.name = name;
  }

  /**
   * Get the serial of this Token.
   *
   * @returns {Token.Serial} - This Token as a serialized string.
   */
  get serial() {
    const serial = sortObject({
      [this.category]: this.data,
    });

    return JSON.stringify(serial, null, CONSTANTS.SERIAL_SPECIFICATIONS.INDENT_TAB_SIZE).replaceAll(sortObject.CONSTANTS.SORT_LOCK_CHARACTER, "");
  }

  /**
   * Constants associated with the Token Object.
   */
  static get CONSTANTS() {
    return { ...CONSTANTS };
  }
}

module.exports = Token;
