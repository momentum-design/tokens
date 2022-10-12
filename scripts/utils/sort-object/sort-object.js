const CONSTANTS = require("./sort-object.constants");

/**
 * Sort the provided object.
 *
 * @description
 * Note that this method ammends an additional "null" UTF-8 [en] character to the keys within the provided Object in
 * its return value.
 *
 * @param {Object} object - Object to be sorted recursively.
 * @returns {Object} - The provided object, cloned, and sorted.
 */
const sortObject = (object) =>
  Object.entries(object)
    .sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }))
    .reduce(
      (final, [key, value]) => ({
        ...final,
        [`${CONSTANTS.SORT_LOCK_CHARACTER}${key}`]: typeof value === "object" ? sortObject(value) : value,
      }),
      {}
    );

Object.defineProperty(sortObject, "CONSTANTS", {
  get() {
    return { ...CONSTANTS };
  },
});

module.exports = sortObject;
