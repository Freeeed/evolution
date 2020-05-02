export class Math2 {
    static clamp(min, max, a) {
        return Math.max(min, Math.min(a, max));
    }
}

export class Modulo {
    static modulo(a, b) {
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

export function cmp(a, b) {
    const e = 0.00000001;
    return Math.abs(a - b) < e;
}

export class Vector2 {

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
        const length = this.length();

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
        const nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
        const ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

        return new Vector2(nx, ny);
    }

    rotateBy(rotation) {
        const angle = this.angle() + rotation;

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

    equals(other) {
        return cmp(this.x, other.x) && cmp(this.y, other.y);
    }

    toObject() {
        return {x: this.x, y: this.y};
    }

    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }

    static fromAngle(angle) {
        return (new Vector2(1, 0)).rotate(angle);
    }

    static fromObject({x, y}) {
        return new Vector2(x, y);
    }

    draw(context, color) {
        context.fillStyle = color;
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(this.x - 3, this.y - 3);
        context.lineTo(this.x + 3, this.y + 3);
        context.fill();
        context.stroke();

        context.beginPath();
        context.moveTo(this.x - 3, this.y + 3);
        context.lineTo(this.x + 3, this.y - 3);
        context.fill();
        context.stroke();
    }
}

export function sgn(a) {
    return a < 0 ? -1 : 1;
}

export function unique(array, callback) {
    return array.reduce((result, item) => {
        if (!result.some((other) => callback(item, other))) {
            result.push(item);
        }

        return result;
    }, []);
}
