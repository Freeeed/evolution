import {Modulo, Vector2} from "./helpers";
import World from "./world";
import Circle from "./circle";
import Brain from "./brain";

export default class Car {

    constructor(dna, world) {
        this.world = world;
        this.width = 25;
        this.length = 40;

        this.currentGoal = 0;
        this.lifeTime = 25;
        this.dead = false;
        this.goalReached = false;

        this.fieldOfViewSectors = 16;
        this.fieldOfViewDistance = 450;
        this.fieldOfViewAngle = 235;

        this.outerRadius = Math.sqrt(this.length * this.length + this.width * this.width) * 0.5;

        this.rbgColor = Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255);

        this.velocity = 3;
        this.position = Vector2.fromObject(this.world.start);
        this.initialDirection = Vector2.fromAngle(Math.random() * 2 * Math.PI);

        this.distanceTraveled = 0;

        this.brain = new Brain([this.fieldOfViewSectors * 2, 16, 2]);

        if (dna == null) {
            let dnaLength = this.brain.calcNumberOfAxons([this.fieldOfViewSectors * 2, 16, 2], false) + 1;

            dna = [];

            for (let i = 0; i < dnaLength; i++) {
                dna[i] = 2 * Math.random() - 1;
            }
        }

        this.brain.load(dna);

        this.reset();
    }

    reset() {
        this.lifeTime = 10;
        this.dead = false;
        this.goalReached = false;
        this.distanceTraveled = 0;

        this.velocity = 2;
        this.position = Vector2.fromObject(this.world.start);
        this.direction = this.initialDirection;

        this.cachedObjectsInFieldOfView = [];

        this.cachedCollider = null;
        this.cacheCollider();

        this.cachedObjectsInFieldOfView = [];
        this.cacheObjectsInFieldOfView();
    }

    update(deltaTime) {
        if (!this.canMove()) {
            return;
        }

        this.lifeTime -= deltaTime;

        this.cacheCollider();

        this.cacheObjectsInFieldOfView();

        let input = [];

        this.cachedObjectsInFieldOfView.forEach((item, index) => {
            if (item.type === ItemNone) {
                input[index] = 0;
                input[index + this.fieldOfViewSectors] = 0;
            } else {
                input[index + item.type * this.fieldOfViewSectors] = item.distance;
                input[index + (1 - item.type) * this.fieldOfViewSectors] = 0;
            }
        });

        let output = this.brain.use(input);

        let rotation = deltaTime * (output[0] + output[1]) / 180 * Math.PI * 200;

        this.direction = this.direction.rotate(rotation);

        // move
        this.move(deltaTime);

        this.cacheCollider();

        // check for collisions
        if (this.hitBoundries()) {
            this.die();
        }

        if (this.hitObstacle()) {
            this.die();
        }

        if (this.hitPerson()) {
            this.currentGoal++;
            this.lifeTime += 8;
        }

        /*if (this.hitGoal()) {
            this.currentGoal++;
            this.lifeTime += 25;

            if (this.currentGoal >= this.world.goals) {
                // this.goalReached = true;
            }
        }*/
    }

    move(deltaTime) {
        let speed = World.pixelsPerUnit() * deltaTime * this.velocity;

        let movement = this.direction.scale(speed);

        this.distanceTraveled += movement.length();

        this.position = this.position.add(movement);
    }

    die() {
        this.dead = true;
        this.goalReached = false;
    }

    canMove() {
        return this.lifeTime > 0 && !this.dead && !this.goalReached;
    }

    centerX() {
        return this.position.x;
    }

    centerY() {
        return this.position.y;
    }

    cacheCollider() {
        this.cachedCollider = new Circle(this.centerX(), this.centerY(), this.outerRadius);
    }

    collider() {
        return this.cachedCollider;
    }

    nextGoal() {
        return this.world.goals[this.currentGoal % this.world.goals.length];
    }

    cacheObjectsInFieldOfView() {
        /*
        Checks all sectors for obstacles

        1. check global circle and store obstables in range

        2. for each sector check each obstacle in range

        2.1. check for outer lines of individuel sector
        */

        this.cachedObjectsInFieldOfView = [];

        let fieldOfView = Circle.fromVector(this.position, this.fieldOfViewDistance);

        let fieldOfViewRadian = this.fieldOfViewAngle * Math.PI / 180;

        let fieldOfViewStart = this.direction.angle() - fieldOfViewRadian * 0.5;

        for (let sector = 0; sector < this.fieldOfViewSectors; sector++) {
            this.cachedObjectsInFieldOfView[sector] = new Item(ItemNone, 0);
        }

        // objects in range
        for (let i = 0; i < this.world.obstacles.length; i++) {
            let obstacle = this.world.obstacles[i];

            if (!fieldOfView.hit(obstacle)) {
                continue;
            }

            let directionToObstacle = obstacle.toVector().substract(this.position);

            let angleBetweenThisAndObstacle = Math.atan2(directionToObstacle.y, directionToObstacle.x);
            let ownAngle = Modulo.modulo(this.direction.angle(), 2 * Math.PI);

            let a = Modulo.signed(angleBetweenThisAndObstacle - ownAngle, Math.PI * 2);

            if (a > Math.PI) {
                a = a - Math.PI * 2;
            }

            if ((a >= 0 && a < fieldOfViewRadian / 2) || (a <= 0 && -a < fieldOfViewRadian / 2)) {
                let sector = Math.floor(a * this.fieldOfViewSectors / fieldOfViewRadian) + this.fieldOfViewSectors / 2;

                let distanceToObstacleBorder = obstacle.toVector().distance(this.position) - obstacle.r;
                let newDistance = distanceToObstacleBorder / this.fieldOfViewDistance;

                if (this.cachedObjectsInFieldOfView[sector].type === ItemNone ||
                    Math.abs(this.cachedObjectsInFieldOfView[sector].distance) >= newDistance) {
                    this.cachedObjectsInFieldOfView[sector].type = ItemObstacle;
                    this.cachedObjectsInFieldOfView[sector].distance = newDistance;
                }
            }
        }

        for (let i = 0; i < this.world.people.length; i++) {
            let obstacle = this.world.people[i];

            if (!fieldOfView.hit(obstacle)) {
                continue;
            }

            let directionToObstacle = obstacle.toVector().substract(this.position);

            let angleBetweenThisAndObstacle = Math.atan2(directionToObstacle.y, directionToObstacle.x);
            let ownAngle = Modulo.modulo(this.direction.angle(), 2 * Math.PI);

            let a = Modulo.signed(angleBetweenThisAndObstacle - ownAngle, Math.PI * 2);

            if (a > Math.PI) {
                a = a - Math.PI * 2;
            }

            if ((a >= 0 && a < fieldOfViewRadian / 2) || (a <= 0 && -a < fieldOfViewRadian / 2)) {
                let sector = Math.floor(a * this.fieldOfViewSectors / fieldOfViewRadian) + this.fieldOfViewSectors / 2;

                let distanceToObstacleBorder = obstacle.toVector().distance(this.position) - obstacle.r;
                let newDistance = distanceToObstacleBorder / this.fieldOfViewDistance;

                if (this.cachedObjectsInFieldOfView[sector].type === ItemNone ||
                    Math.abs(this.cachedObjectsInFieldOfView[sector].distance) >= newDistance) {
                    this.cachedObjectsInFieldOfView[sector].type = ItemGoal;
                    this.cachedObjectsInFieldOfView[sector].distance = newDistance;
                }
            }
        }
    }

    objectsInFieldOfView() {
        return this.cachedObjectsInFieldOfView;
    }

    hitObstacle() {
        for (let i = 0; i < this.world.obstacles.length; i++) {
            let obstacle = this.world.obstacles[i];

            if (obstacle.hit(this.collider())) {
                return true;
            }
        }

        return false;
    }

    hitBoundries() {
        return false;

        let collider = this.collider();

        if (collider.x - collider.r <= 0 || collider.y - collider.r <= 0) {
            return true;
        }

        return collider.x + collider.r >= this.world.size.width || collider.y + collider.r >= this.world.size.height;

        // accurate but computation heavier check

        let cX = this.centerX();
        let cY = this.centerY();

        let Ox = this.length / 2;
        let Oy = this.width / 2;

        let angle = this.direction.angle();

        let edgeAx = cX + Ox * Math.cos(angle) - Oy * Math.sin(angle);
        let edgeAy = cY + Ox * Math.sin(angle) + Oy * Math.cos(angle);

        let edgeBx = cX - Ox * Math.cos(angle) + Oy * Math.sin(angle);
        let edgeBy = cY - Ox * Math.sin(angle) - Oy * Math.cos(angle);

        let edgeCx = cX - Ox * Math.cos(angle) - Oy * Math.sin(angle);
        let edgeCy = cY - Ox * Math.sin(angle) + Oy * Math.cos(angle);

        let edgeDx = cX + Ox * Math.cos(angle) + Oy * Math.sin(angle);
        let edgeDy = cY + Ox * Math.sin(angle) - Oy * Math.cos(angle);

        return this._checkHelper(edgeAx, edgeAy) ||
            this._checkHelper(edgeBx, edgeBy) ||
            this._checkHelper(edgeCx, edgeCy) ||
            this._checkHelper(edgeDx, edgeDy);
    }

    hitPerson() {
        for (let i = 0; i < this.world.people.length; i++) {
            let person = this.world.people[i];

            if (person.hit(this.collider())) {
                this.world.removePerson(person);

                return true;
            }
        }

        return false;
    }

    hitGoal() {
        return Circle.fromVector(this.nextGoal(), 20).hit(this.collider());
    }

    _checkHelper(x, y) {
        if (x <= 0 || y <= 0) {
            return true;
        }

        return x >= this.world.width || y >= this.world.height;
    }

    mutate(mutationRate) {

    }

    getFitness() {
        if (this.dead) {
            return 0;
        }

        if (this.lifeTime <= 0) {
            return this.currentGoal / 4;
        }

        return this.currentGoal;
    }

    color() {
        return "rgba(" + this.rbgColor + ", " + this.getFitness() + ")";
    }

    draw(context) {
        let cX = this.centerX();
        let cY = this.centerY();

        let Ox = this.length / 2;
        let Oy = this.width / 2;

        let angle = this.direction.angle();

        // Egdes
        if (true /* draw edges */) {
            let edges = [
                [
                    cX + Ox * Math.cos(angle) - Oy * Math.sin(angle),
                    cY + Ox * Math.sin(angle) + Oy * Math.cos(angle)
                ],
                [
                    cX - Ox * Math.cos(angle) + Oy * Math.sin(angle),
                    cY - Ox * Math.sin(angle) - Oy * Math.cos(angle)
                ],
                [
                    cX - Ox * Math.cos(angle) - Oy * Math.sin(angle),
                    cY - Ox * Math.sin(angle) + Oy * Math.cos(angle)
                ],
                [
                    cX + Ox * Math.cos(angle) + Oy * Math.sin(angle),
                    cY + Ox * Math.sin(angle) - Oy * Math.cos(angle)
                ],
            ];

            for (let edge = 0; edge < edges.length; edge++) {
                context.beginPath();

                context.fillStyle = this.color();
                context.strokeStyle = 'rgba(255, 0, 0, 1)';

                context.arc(edges[edge][0], edges[edge][1], 3, 0, 2 * Math.PI);

                context.stroke();
                context.fill();
            }
        }

        // car torso

        context.save();

        context.fillStyle = this.color();
        context.strokeStyle = 'rgba(0, 0, 0, 1)';

        context.translate(this.centerX(), this.centerY());

        context.rotate(this.direction.angle());

        context.beginPath();

        context.rect(
            -Ox,
            -Oy,
            this.length,
            this.width
        );

        context.stroke();
        context.fill();

        context.font = "12px Arial";

        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.fillText(this.currentGoal, -18, -1);

        context.fillText(Math.round(this.lifeTime * 100) / 100, -18, 11);

        context.restore();

        // collider
        this.collider().draw(context);

        if (true /* field of view */) {
            let fieldOfViewRadian = this.fieldOfViewAngle * Math.PI / 180;

            let fieldOfViewStart = this.direction.angle() - fieldOfViewRadian * 0.5;

            for (let sector = 0; sector < this.fieldOfViewSectors; sector++) {
                // FoV
                context.beginPath();

                let alpha = 0.05 + (sector / this.fieldOfViewSectors * 0.3);

                if (this.objectsInFieldOfView()[sector].type === ItemObstacle) {
                    context.fillStyle = 'rgba(200, 100, 100, ' + Math.abs(this.objectsInFieldOfView()[sector].distance * 0.5) + ')';
                    context.strokeStyle = 'rgba(200, 100, 100, ' + Math.abs(this.objectsInFieldOfView()[sector].distance * 0.5) + ')';
                } else if (this.objectsInFieldOfView()[sector].type === ItemGoal) {
                    context.fillStyle = 'rgba(100, 200, 100, ' + Math.abs(this.objectsInFieldOfView()[sector].distance * 0.5) + ')';
                    context.strokeStyle = 'rgba(100, 200, 100, ' + Math.abs(this.objectsInFieldOfView()[sector].distance * 0.5) + ')';
                } else {
                    context.fillStyle = 'rgba(200, 200, 200, ' + alpha + ')';
                    context.strokeStyle = 'rgba(200, 200, 200, ' + alpha + ')';
                }

                context.moveTo(this.centerX(), this.centerY());

                context.arc(
                    this.centerX(),
                    this.centerY(),
                    this.fieldOfViewDistance,
                    fieldOfViewStart + (fieldOfViewRadian / this.fieldOfViewSectors) * sector,
                    fieldOfViewStart + (fieldOfViewRadian / this.fieldOfViewSectors) * (sector + 1)
                );

                context.lineTo(this.centerX(), this.centerY());

                context.fill();
                context.stroke();
            }
        }

        // this.brain.draw(context);
    }
}

const ItemNone = -1;
const ItemObstacle = 0;
const ItemGoal = 1;

class Item {

    constructor(type, distance) {
        this.type = type;
        this.distance = distance;
    }
}
