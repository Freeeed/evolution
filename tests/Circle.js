import assert from "assert";
import {describe, it} from "mocha";

import Circle from "../src/circle";
import {Vector2} from "../src/helpers";
import Line from "../src/line";

describe('Circle', () => {
    describe('#intersectLine', () => {
        it('should return an empty array if line does not intersect (0, 0)', () => {
            let intersections = new Circle(0, 0, 1).intersectsLine(new Line(new Vector2(1, 1), new Vector2(1, -1)));

            assert.equal(intersections.length, 0);
        });

        it('should return one point if line as one intersection (0, 0)', () => {
            let intersections = new Circle(0, 0, 1).intersectsLine(new Line(new Vector2(1, 0), new Vector2(0, 1)));

            assert.equal(intersections.length, 1);
            assert.ok(intersections[0].equals(new Vector2(1, 0)));
        });

        it('should return one point if line as one intersection #2 (0, 0)', () => {
            let intersections = new Circle(0, 0, 1).intersectsLine(new Line(new Vector2(0, 1), new Vector2(1, 0)));

            assert.equal(intersections.length, 1);
            assert.ok(intersections[0].equals(new Vector2(0, 1)));
        });

        it('should return two points if line intersects (0, 0)', () => {
            let intersections = new Circle(0, 0, 1).intersectsLine(new Line(new Vector2(0, 0), new Vector2(1, 0)));

            //  TODO. fix array comparision
            assert.equal(
                intersections,
                [
                    new Vector2(1, 0),
                    new Vector2(-1, 0)
                ]
            );
        });

        it('should return an empty array if line does not intersect (1, 1)', () => {
            let intersections = new Circle(0, 0, 1).intersectsLine(new Line(new Vector2(2, 2), new Vector2(1, -1)));

            assert.equal(intersections.length, 0);
        });

        it('should return one point if line as one intersection (1, 1)', () => {
            let intersections = new Circle(1, 1, 1).intersectsLine(new Line(new Vector2(2, 1), new Vector2(0, 1)));

            assert.equal(intersections.length, 1);
            assert.ok(intersections[0].equals(new Vector2(2, 1)));
        });

        it('should return two points if line intersects (1, 1)', () => {
            let intersections = new Circle(1, 1, 1).intersectsLine(new Line(new Vector2(1, 1), new Vector2(1, 0)));

            console.log(intersections);

            //  TODO. fix array comparision
            assert.equal(
                intersections,
                [
                    new Vector2(2, 1),
                    new Vector2(0, 1)
                ]
            );
        });
    });
});
