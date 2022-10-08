const nextTokens = require("momentum-automation-center");

/**
 * Make an automated token grades appear as a localized token.
 *
 * @param {AutomationToken.Colors.Gradiation} colorGrades - Automation token color grades object.
 * @returns {LocalizedToken.Colors.Gradiation} - Autmoation token color gradiation translated to a localized token.
 */
const formatNextColorGrades = (colorGrades) =>
  Object.entries(colorGrades).reduce((newColorGrades, [key, value]) => {
    const mutable = { ...newColorGrades };
    const grade = key.split("-").pop();
    const { r, g, b, a } = colorGrades[key].rgba;

    mutable[grade] = `rgba(${r}, ${g}, ${b}, ${a})`;

    return mutable;
  }, {});

/**
 * Make an automated token color appear as a localized token.
 *
 * @param {AutomationToken.Colors} colors - Automation token color object
 * @returns {LocalizedToken.Colors} - Automation token colors translated to a localized token.
 */
const formatNextColors = (colors) =>
  Object.entries(colors).reduce((newColors, [key, value]) => {
    const mutable = { ...newColors };
    mutable[key] = formatNextColorGrades(value);

    return mutable;
  }, {});

/**
 * Consumes a target next core token file and translates it into a localized token.
 *
 * @param {AutomationToken} token - Raw automated token.
 * @returns {void}
 */
const formatNextCoreToken = (token) => {
  const functional = formatNextColors(nextTokens.color.core["core color"]);
  const decorative = formatNextColors(nextTokens.color.core["decorative color"]);

  console.log(JSON.stringify({ decorative, functional }));
};

formatNextCoreToken(nextTokens);
