/**
 * Supported token categories.
 */
const CATEGORIES = {
  COLOR: "color",
};

/**
 * Specifications and formatting for Token Serial output value.
 */
const SERIAL_SPECIFICATIONS = {
  INDENT_TAB_SIZE: 2,
};

/**
 * Formats that a token can exist as. `automated` tokens are received from the
 * `momentum-abstract` dependency. `standard` tokens are received locally. The
 * Shape of these tokens' interfaces can vary massively based on the `CATEGORY`.
 * Be sure to review the token's format via their source content. This can be
 * done by inspecting the various local files within this project for `standard`
 * tokens, and within the `node_modules/momentum-abstract` folder for
 * `automated` tokens.
 */
const TOKEN_FORMATS = {
  STANDARD: "standard",
  AUTOMATED: "automated",
};

module.exports = {
  CATEGORIES,
  SERIAL_SPECIFICATIONS,
  TOKEN_FORMATS,
};
