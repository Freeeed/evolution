import {cmp, sgn, unique, Vector2} from "./helpers";

export default class Circle {

    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;

        this.marked = false;
        this.color = null;
    }

    mark(color) {
        this.marked = true;
        this.color = color;
    }

    toVector() {
        return Vector2.fromObject(this);
    }

    static fromVector({x, y}, radius) {
        return new Circle(x, y, radius);
    }

    hit(other) {
        let distanceX = this.x - other.x;
        let distanceY = this.y - other.y;
        let radiusSum = this.r + other.r;

        return distanceX * distanceX + distanceY * distanceY <= radiusSum * radiusSum
    }

    intersectsLine(line) {
        let a = line.origin.substract(this.toVector());
        let b = line.target.substract(this.toVector());

        let d = line.direction;
        let d_len = d.lengthSq();

        let D = a.cross(b);

        let discriminant = (this.r * this.r) * d_len - D * D;

        // discriminant:
        // < 0 - no intersection
        // = 0 - one intersection
        // > 0 - two intersections

        if (discriminant < 0) {
            return [];
        }

        let delta = Math.sqrt(discriminant);

        let x1 = (d.y * D + sgn(d.y) * d.x * delta) / d_len;
        let x2 = (d.y * D - sgn(d.y) * d.x * delta) / d_len;

        let y1 = (-d.x * D + Math.abs(d.y) * delta) / d_len;
        let y2 = (-d.x * D - Math.abs(d.y) * delta) / d_len;

        let v1 = new Vector2(x1, y1).add(this.toVector());

        if (cmp(discriminant, 0)) {
            return [v1];
        }

        let v2 = new Vector2(x1, y2).add(this.toVector());
        let v3 = new Vector2(x2, y1).add(this.toVector());
        let v4 = new Vector2(x2, y2).add(this.toVector());

        return unique([v1, v2, v3, v4], (a, b) => a.equals(b)).filter((v) => line.on(v));
    }

    distance(x, y, w, h) {
        // distance to mid - radius
    }

    draw(context, color) {
        if (typeof color == 'undefined') {
            color = 'rgba(0, 0, 0, .05)';
        }

        if (this.marked) {
            color = this.color ? this.color : 'rgba(255, 0, 0, .2)';
        }

        context.beginPath();

        context.fillStyle = color;
        context.strokeStyle = 'rgba(0, 0, 0, .1)';

        context.arc(this.x, this.y, this.r, 0, 2 * Math.PI);

        context.stroke();
        context.fill();
    }
}
