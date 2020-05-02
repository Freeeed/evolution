import assert from "assert";
import {describe, it} from "mocha";

import {Vector2} from "../src/helpers";

describe('Vector2', () => {
    describe('#equals', () => {
        it('should return false if two vectors are unequal', () => {
            assert.equal(new Vector2(1, 1).equals(new Vector2(0, 0)), false);
        });

        it('should return true if two vectors are equal', () => {
            assert.equal(new Vector2(1, 1).equals(new Vector2(1, 1)), true);
        });
    });
});
