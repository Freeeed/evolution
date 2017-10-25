
class Modulo {
    static modulo(a, b){
        let k = Math.floor(a / b);
        if (a < 0) k--;
        return a - b * k;
    }

    static signed(a, b) {
        let mod = Modulo.modulo(a, b);

        if (mod >= b / 2) mod -= b;

        return mod;
    }
}

class Vector2 {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector2(
            this.x + other.x,
            this.y + other.y,
        );
    }

    substract(other) {
        return new Vector2(
            this.x - other.x,
            this.y - other.y,
        );
    }

    scale(scalar) {
        return new Vector2(
            this.x * scalar,
            this.y * scalar
        );
    }

    normalize() {
        var length = this.length();

        if (length === 0) {
            return new Vector2(1, 0);
        }

        return this.scale(1 / length);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    cross(other) {
        return (this.x * other.y) - (this.y * other.x);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle) {
        var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
        var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

        return new Vector2(nx, ny);
    }

    rotateBy(rotation) {
        var angle = this.angle() + rotation;

        return this.rotate(angle);
    }

    distance(other) {
        return Math.sqrt(this.distanceSq(other));
    }

    distanceSq(other) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;

        return dx * dx + dy * dy;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    toObject() {
        return { x: this.x, y: this.y };
    }

    static fromAngle(angle) {
        return (new Vector2(1, 0)).rotate(angle);
    }

    static fromObject({ x, y }) {
        return new Vector2(x, y);
    }
}
