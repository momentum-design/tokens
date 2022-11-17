const nextTokens = {};

const prevTokens = {
  decorative: require("../../../core/color/decorative.json"),
  functional: require("../../../core/color/functional.json"),
  gradation: require("../../../core/color/gradation.json"),
  solids: require("../../../core/color/solids.json"),
};

const utils = require("../../utils");
const common = require("../../common");
const { ColorToken, GradientToken, SolidToken } = require("../../models");

/**
 * Update all tokens within this project.
 */
const update = (format) => {
  // Next tokens are mapped onto legacy tokens. These must be normalized to
  // match the existing local tokens.
  let next;
  const nextTokens = {};
  if (format === ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED) {
    nextTokens.abstract = require("momentum-abstract/color/core.json");
    const automated = {
      functional: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED,
        data: nextTokens.abstract["core color"],
      }).normalize(),
      decorative: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED,
        data: nextTokens.abstract["decorative color"],
      }).normalize(),
      gradation: new GradientToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED,
        data: { gradation: nextTokens.abstract["gradation color"] }, // automated gradation token is missing the `gradation` key.
      }).normalize(),
      solids: new SolidToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.AUTOMATED,
        data: nextTokens.abstract["mobile solid background"],
      }).normalize(),
    };
    next = automated;
  } else if (format === ColorToken.CONSTANTS.TOKEN_FORMATS.DESIGN) {
    nextTokens.design = require("@momentum-design/tokens/dist/webex/json/core.json");
    const design = {
      functional: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.DESIGN,
        data: nextTokens.design.color.core,
      }).normalize(),
      decorative: new ColorToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.DESIGN,
        data: nextTokens.design.color.decorative,
      }).normalize(),
      gradation: new GradientToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.DESIGN,
        data: { gradation: nextTokens.design.color.gradient },
      }).normalize(),
      solids: new SolidToken({
        format: ColorToken.CONSTANTS.TOKEN_FORMATS.DESIGN,
        data: nextTokens.design.color.mobile,
      }).normalize(),
    };
    next = design;
  }

  // Prev tokens are local tokens to be updated with the next tokens.
  const prev = {
    functional: new ColorToken({
      format: ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD,
      data: prevTokens.functional.color,
    }),
    decorative: new ColorToken({
      format: ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD,
      data: prevTokens.decorative.color,
    }),
    gradation: new GradientToken({
      format: ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD,
      data: prevTokens.gradation.color,
    }),
    solids: new SolidToken({
      format: ColorToken.CONSTANTS.TOKEN_FORMATS.STANDARD,
      data: prevTokens.solids.color,
    }),
  };

  // Final tokens are the prev tokens [local] after updating with new values
  // from the next tokens [automated via dependency].
  const final = {
    functional: prev.functional.merge({ token: next?.functional }),
    decorative: prev.decorative.merge({ token: next?.decorative }),
    gradation: prev.gradation.merge({ token: next?.gradation }),
    solids: prev.solids.merge({ token: next?.solids }),
  };

  // Write the tokens to the file system.
  utils.writeToken(common.CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.DECORATIVE, final.decorative.serial);
  utils.writeToken(common.CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.FUNCTIONAL, final.functional.serial);
  utils.writeToken(common.CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.GRADATION, final.gradation.serial);
  utils.writeToken(common.CONSTANTS.TOKENS.STANDARD.PATHS.CORE.COLOR.SOLIDS, final.solids.serial);
};

module.exports = update;
