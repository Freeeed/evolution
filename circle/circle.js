
class Circle {
    
    constructor(x, y, r, obstacles) {
        this.x = x;
        this.y = y;
        this.r = r;

        this.obstacles = obstacles;
    }

    giveBirth(other) {
        return new Circle(
            Math.random() < 0.5 ? this.x : other.x,
            Math.random() < 0.5 ? this.y : other.y,
            Math.random() < 0.5 ? this.r : other.r
        );
    }

    mutate(mutationRate) {
        this.x += getRandomInt(-20, 20) * mutationRate;
        this.y += getRandomInt(-20, 20) * mutationRate;
        this.r += getRandomInt(-2, 20) * mutationRate;

        if(this.r < 1) {
            this.r = 1;
        }

        this.fittness = this.getFitness(
            this.x, this.y, this.r
        );
    }

    getFitness() {
        let overlapping = this._checkOverlappingCircles(this.x, this.y, this.r);

        let outside = (this.x - this.r < 0 || this.x + this.r > 500 || this.y - this.r < 0 || this.y + this.r > 400) ? 1 : 0;

        let area = 2 * Math.PI * this.r * this.r;

        let fittness = area;

        if(outside > 0 || overlapping > 0) {
            fittness = -fittness;

            if(overlapping > 0) {
                fittness += 2 * overlapping;
            }

            if(outside > 0) {
                fittness *= 4 * outside;
            }
        }

        return fittness;
    }

    _checkOverlappingCircles() {
        let number = 0;

        for(let i = 0; i < this.obstacles.length; i++) {
            let other = this.obstacles[i];

            if(this._checkOverlapping(other)) {
                number++;
            }
        }

        return number;
    }

    _checkOverlapping(other) {
        let distanceX = this.x - other.x;
        let distanceY = this.y - other.y;
        let radiusSum = this.r + other.r;

        return distanceX * distanceX + distanceY * distanceY <= radiusSum * radiusSum
    }
}
