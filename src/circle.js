import {Vector2} from "./helpers";

export default class Circle {

    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;

        this.marked = false;
    }

    mark() {
        this.marked = true;
    }

    toVector() {
        return Vector2.fromObject(this);
    }

    static fromVector({ x, y }, radius) {
        return new Circle(x, y, radius);
    }

    hit(other) {
        let distanceX = this.x - other.x;
        let distanceY = this.y - other.y;
        let radiusSum = this.r + other.r;

        return distanceX * distanceX + distanceY * distanceY <= radiusSum * radiusSum
    }

    intersectsLine(a, b) {
        a = a.substract(this.toVector());
        b = b.substract(this.toVector());

        let d = b.substract(a);

        let D = a.cross(b);

        let discriminant = (this.r * this.r) * d.lengthSq() - D * D;

        // discriminant:
        // < 0 - no intersection
        // = 0 - one intersection
        // > 0 - two intersections

        return discriminant >= 0;
    }

    intersectsLineSegment(a, b) {
        let c = Vector2.fromObject(this);

        let dir = b.substract(a);
        let diff = c.substract(a);

        let t = diff.dot(dir) / dir.dot(dir);

        if (t < 0.0) {
            t = 0.0;
        }

        if (t > 1.0) {
            t = 1.0;
        }

        let closest = a.add(dir.scale(t));
        let d = c.substract(closest);

        let distsqr = d.dot(d);

        return distsqr <= this.r * this.r;
    }

    distance(x, y, w, h) {
        // distance to mid - radius
    }

    draw(context, color) {
        if(typeof color == 'undefined') {
            color = 'rgba(0, 0, 0, .05)';
        }

        if(this.marked) {
            color = 'rgba(255, 0, 0, 1)';
        }

        context.beginPath();

        context.fillStyle = color;
        context.strokeStyle = 'rgba(0, 0, 0, .1)';

        context.arc(this.x, this.y, this.r, 0, 2 * Math.PI);

        context.stroke();
        context.fill();
    }
}
