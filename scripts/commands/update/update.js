const nextTokens = {
  core: require("momentum-abstract/color/core.json"),
};

const prevTokens = {
  decorative: require("../../../core/color/decorative.json"),
  functional: require("../../../core/color/functional.json"),
};

const utils = require("../../utils");
const common = require("../../common");

const ColorToken = require("../../models/color-token");

/**
 * Update all tokens within this project.
 */
const update = () => {
  // Next tokens are mapped onto legacy tokens. These must be normalized to
  // match the existing local tokens.
  const next = {
    functional: {
      color: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED,
        category: ColorToken.CONSTANTS.CATEGORIES.COLOR,
        data: nextTokens.core["core color"],
        name: "functional",
      }).normalize(),
    },
    decorative: {
      color: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED,
        category: ColorToken.CONSTANTS.CATEGORIES.COLOR,
        data: nextTokens.core["decorative color"],
        name: "decorative",
      }).normalize(),
    },
  };

  // Prev tokens are local tokens to be updated with the next tokens.
  const prev = {
    functional: {
      color: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD,
        category: ColorToken.CONSTANTS.CATEGORIES.COLOR,
        data: prevTokens.functional.color,
        name: "functional",
      }),
    },
    decorative: {
      color: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD,
        category: ColorToken.CONSTANTS.CATEGORIES.COLOR,
        data: prevTokens.decorative.color,
        name: "decorative",
      }),
    },
  };

  // Final tokens are the prev tokens [local] after updating with new values
  // from the next tokens [automated via dependency].
  const final = {
    functional: ColorToken.merge({
      source: next.functional.color,
      destination: prev.functional.color,
    }),
    decorative: ColorToken.merge({
      source: next.decorative.color,
      destination: prev.decorative.color,
    }),
  };

  // Write the tokens to the file system.
  utils.writeToken(common.CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.DECORATIVE, final.decorative.serial);
  utils.writeToken(common.CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.FUNCTIONAL, final.functional.serial);
};

module.exports = update;
