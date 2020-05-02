import {cmp, Vector2} from "./helpers";

export default class Line {

    constructor(origin, direction, length = null) {
        this.origin = origin;
        this.direction = direction.normalize();
        this.length = length;

        if (direction.lengthSq() === 0) {
            throw new Error("direction vector must have a length");
        }
    }

    get target() {
        const length = this.length === null ? 1 : this.length;
        return this.origin.add(this.direction.scale(length));
    }

    draw(context, color) {
        context.fillStyle = color;
        context.strokeStyle = color;
        context.beginPath();

        if (this.length === null) {
            context.moveTo(this.origin.x - this.direction.x * 1000, this.origin.y - this.direction.y * 1000);
            context.lineTo(this.origin.x + this.direction.x * 1000, this.origin.y + this.direction.y * 1000);
        } else {
            context.moveTo(this.origin.x, this.origin.y);
            context.lineTo(this.origin.x + this.direction.x * this.length, this.origin.y + this.direction.y * this.length);
        }

        context.fill();
        context.stroke();
    }

    on(point) {
        if (this.direction.x === 0) {
            return point.x === this.origin.x;
        }

        if (this.direction.y === 0) {
            return point.y === this.origin.y;
        }

        let x = (point.x - this.origin.x) / this.direction.x;
        let y = (point.y - this.origin.y) / this.direction.y;

        return cmp(x, y);
    }

    scalar(hit) {
        return (hit.x - this.origin.x) / this.direction.x;
    }

    intersectLine(other) {
        const x1 = this.origin.x;
        const y1 = this.origin.y;
        const x2 = this.target.x;
        const y2 = this.target.y;

        const x3 = other.origin.x;
        const y3 = other.origin.y;
        const x4 = other.target.x;
        const y4 = other.target.y;

        const D = ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

        if (D === 0) {
            return null;
        }

        let px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / D;
        let py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / D;

        return new Vector2(px, py);
    }
}
