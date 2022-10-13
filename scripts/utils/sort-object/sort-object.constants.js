/**
 * Special character used to prevent JavaScript auto-sorting in non-serialized JSON Objects.
 * This value is injected as the first character of each string to prevent JavaScript auto-sorting based on the first
 * character, and should be removed prior to emitting the object.
 *
 * @example
 * The following sorted output is generated via the sortObject() method:
 *
 * ```js
 * const obj = {
 *   '00': 'value',
 *   '05': 'value',
 *   '50': 'value',
 *   '100': 'value',
 * };
 * ```
 *
 * JavaScript then autosorts the entries by key, which outputs the following:
 *
 * ```js
 * console.log(obj);
 * // OR
 * console.log(JSON.stringify(obj, null, 2));
 *
 * // {
 * //   "50": "value",
 * //   "100": "value",
 * //   "00": "value",
 * //   "05": "value"
 * // }
 * ```
 */
const SORT_LOCK_CHARACTER = "�";

module.exports = {
  SORT_LOCK_CHARACTER,
};
