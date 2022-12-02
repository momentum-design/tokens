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
   * @param {Token.Config} dto Token configuration Object.
   * @param {Token.Category} dto.category The Category of the provided Token data.
   * @param {Token.Data} dto.data The Data associated with this Token.
   * @param {Token.Format} dto.format The Format of the provided Token data.
   * @param {Token.Name} dto.name The name of this Token.
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
   * Validate if the provided Token can be merged into this Token.
   *
   * @param {DTO} dto
   * @param {Token} dto.token Token to validate if it can be merged into this Token.
   * @returns {{can: Boolean, reason: String}} If the Token can be merged into the provided Token.
   */
  canMerge({ token }) {
    let can = true;
    let reason;

    if (this.category !== token.category) {
      can = false;
      reason = 'token "category" properties do not match';
    } else if (this.format !== Token.CONSTANTS.TOKEN_FORMATS.STANDARD) {
      can = false;
      reason = `token format "${this.format}" for this token cannot be merged, normalize this token first`;
    } else if (token.format !== Token.CONSTANTS.TOKEN_FORMATS.STANDARD) {
      can = false;
      reason = `token format "${token.format}" for this token cannot be merged, normalize the provided token first`;
    }

    return { can, reason };
  }

  /**
   * Merge the provided Token into this Token.
   *
   * @param {DTO} dto
   * @param {Token} dto.token Token to merge into this Token.
   * @returns {This} This Token merged with new values from the provided Token.
   */
  merge({ token }) {
    const { can, reason } = this.canMerge({ token });

    if (!can) {
      throw new Error(`models.${this.constructor.name}.merge() :: can not merge the provided token into this token: ${reason}`);
    }

    this.mergeData({ data: token.data });

    return this;
  }

  /**
   * Normalize this Token into the `standard` format.
   *
   * @returns {This} This Token with its data and format value normalized.
   */
  normalize() {
    this.normalizeData();
    this.format = Token.CONSTANTS.TOKEN_FORMATS.STANDARD;

    return this;
  }

  /**
   * Merge the provided Token data into this Token.
   *
   * @protected
   * @abstract
   * @param {DTO} dto
   * @param {Token.Data} dto.data Token data to merge into this token.
   * @returns {This} This Token merged with the provided data merged into it.
   */
  mergeData({ data }) {
    throw new Error(`models.Token.mergeData() :: abstract method "mergeData()" for class "${this.constructor.name}" has not bee implemented`);
  }

  /**
   * Normalize this Token's data into the `standard` Token format.
   *
   * @protected
   * @abstract
   * @returns {This} This Token with its data normalized.
   */
  normalizeData() {
    throw new Error(`models.Token.normalizeData() :: abstract method "normalizeData()" for class "${this.constructor.name}" has not be implemented`);
  }

  /**
   * Constants associated with the Token Object.
   *
   * @type {Token.Constants}
   */
  static get CONSTANTS() {
    return { ...CONSTANTS };
  }
}

module.exports = Token;
