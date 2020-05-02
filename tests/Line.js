import assert from "assert";
import {describe, it} from "mocha";

import {Vector2} from "../src/helpers";
import Line from "../src/line";

describe('Line', () => {
    describe('#construct', () => {
        it('direction vector must have a positive length', () => {
            assert.throws(() => {
                new Line(new Vector2(1, 1), new Vector2(0, 0));
            });
        });
    });

    describe('#on', () => {
        it('should return false if point is not on the line', () => {
            let line = new Line(new Vector2(1, 1), new Vector2(1, -1));

            assert.equal(
                line.on(new Vector2(2, 2)),
                false
            );
        });

        it('should return true if point is on the line', () => {
            let line = new Line(new Vector2(1, 1), new Vector2(1, -1));

            assert.equal(
                line.on(new Vector2(1, 1)),
                true
            );
        });

        it('should return true if point is on the line #2', () => {
            let line = new Line(new Vector2(4, 3), new Vector2(1, -1));

            assert.equal(
                line.on(new Vector2(5, 2)),
                true
            );
        });

        it('should return true if point is on the line #3', () => {
            let line = new Line(new Vector2(4, 3), new Vector2(1, 0));

            assert.equal(
                line.on(new Vector2(5, 3)),
                true
            );
        });

        it('should return true if point is on the line #4', () => {
            let line = new Line(new Vector2(4, 3), new Vector2(0, 1));

            assert.equal(
                line.on(new Vector2(4, 5)),
                true
            );
        });
    });
});
