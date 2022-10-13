const sortObject = require("./sort-object");
const CONSTANTS = require("./sort-object.constants");

describe("utils.sortObject", () => {
  describe("sortObject()", () => {
    const lockCharacter = sortObject.CONSTANTS.SORT_LOCK_CHARACTER;
    let object;

    beforeEach(() => {
      object = {
        c: {
          30: "#bbbbbb",
          40: "#cccccc",
          80: "#dddddd",
        },
        a: {
          10: "#000000",
          30: "#888888",
          20: "#ffffff",
        },
        b: {
          100: "#abcedf",
          "00": "#123456",
          50: "#654321",
        },
      };
    });

    it("should sort top level keys", () => {
      const keysInOrder = Object.keys(sortObject(object));

      expect(keysInOrder.indexOf(`${lockCharacter}a`)).toBe(0);
      expect(keysInOrder.indexOf(`${lockCharacter}b`)).toBe(1);
      expect(keysInOrder.indexOf(`${lockCharacter}c`)).toBe(2);
    });

    it("should sort nested keys", () => {
      const keysInOrder = Object.keys(sortObject(object)[`${lockCharacter}b`]);

      expect(keysInOrder.indexOf(`${lockCharacter}00`)).toBe(0);
      expect(keysInOrder.indexOf(`${lockCharacter}50`)).toBe(1);
      expect(keysInOrder.indexOf(`${lockCharacter}100`)).toBe(2);
    });

    it("should prepend lock characters to keys to prevent automatic object sorting in JavaScript", () => {
      const sorted = sortObject(object);
      const sortedKeys = Object.keys(sortObject(object));
      const sortedAKeys = Object.keys(sorted[`${lockCharacter}a`]);
      const sortedBKeys = Object.keys(sorted[`${lockCharacter}b`]);
      const sortedCKeys = Object.keys(sorted[`${lockCharacter}c`]);

      const checkKeys = (keys) => {
        const everyKeyHasLockCharacter = keys.every((key) => key.charAt(0) === lockCharacter);

        expect(everyKeyHasLockCharacter).toBe(true);
      };

      checkKeys(sortedKeys);
      checkKeys(sortedAKeys);
      checkKeys(sortedBKeys);
      checkKeys(sortedCKeys);
    });
  });

  describe("#sortObject.CONSTANTS", () => {
    it("should match the local constants definition", () => {
      expect(sortObject.CONSTANTS).toMatchObject(CONSTANTS);
    });

    it("should be immutable", () => {
      const constants = sortObject.CONSTANTS;

      constants.EXTRA = "hello world";

      expect(sortObject.CONSTANTS.EXTRA).toBeUndefined();
    });
  });
});
