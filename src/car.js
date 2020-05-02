import {Modulo, Vector2} from "./helpers";
import World from "./world";
import Circle from "./circle";
import Brain from "./brain";
import Line from "./line";

export default class Car {

    constructor(dna, world) {
        this.world = world;
        this.width = 25;
        this.length = 40;

        this.currentGoal = 0;
        this.lifeTime = 8;
        this.dead = false;
        this.goalReached = false;

        this.fieldOfViewRays = 24;
        this.fieldOfViewDistance = 450;
        this.fieldOfViewAngle = 235;

        this.outerRadius = Math.sqrt(this.length * this.length + this.width * this.width) * 0.5;

        this.rbgColor = Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255);

        this.velocity = 3;
        this.position = Vector2.fromObject(this.world.start);
        this.initialDirection = Vector2.fromAngle(Math.random() * 2 * Math.PI);

        this.distanceTraveled = 0;

        this.brain = new Brain([this.fieldOfViewRays * 2, 16, 3]);

        if (dna == null) {
            let dnaLength = this.brain.calcNumberOfAxons([this.fieldOfViewRays * 2, 16, 3], false) + 1;

            dna = [];

            for (let i = 0; i < dnaLength; i++) {
                dna[i] = 2 * Math.random() - 1;
            }
        }

        this.brain.load(dna);

        this.reset();
    }

    reset() {
        this.lifeTime = 8;
        this.dead = false;
        this.goalReached = false;
        this.distanceTraveled = 0;

        this.velocity = 2;
        this.position = Vector2.fromObject(this.world.start);
        this.direction = this.initialDirection;

        this.cachedCollider = null;
        this.cacheCollider();

        this.hits = [];
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

        this.hits.forEach((item, index) => {
            if (item.type === ItemNone) {
                input[index] = 0;
                input[index + this.fieldOfViewRays] = 0;
            } else {
                input[index + item.type * this.fieldOfViewRays] = item.distance;
                input[index + (1 - item.type) * this.fieldOfViewRays] = 0;
            }
        });

        let output = this.brain.use(input);

        let rotation = deltaTime * (output[0] + output[1]) / 180 * Math.PI * 200;

        this.direction = this.direction.rotate(rotation);
        this.velocity = output[2] * 3;

        // move
        this.move(deltaTime);

        this.cacheCollider();

        if (this.hitBoundries()) {
            this.die();
        }

        if (this.hitObstacle()) {
            this.die();
        }

        if (this.hitPerson()) {
            this.currentGoal++;
            this.lifeTime += 4;
        }
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

    cacheObjectsInFieldOfView() {
        this.hits = [];

        let fieldOfView = Circle.fromVector(this.position, this.fieldOfViewDistance);
        let fieldOfViewRadian = this.fieldOfViewAngle * Math.PI / 180;
        let fieldOfViewStart = this.direction.angle() - fieldOfViewRadian * 0.5;

        for (let ray = 0; ray < this.fieldOfViewRays; ray++) {
            this.hits[ray] = new Item(ItemNone, Infinity);

            //this.castRayAgainst(ray, this.world.people, ItemGoal);

            for (let i = 0; i < this.world.people.length; i++) {
                let obstacle = this.world.people[i];

                if (!fieldOfView.hit(obstacle)) {
                    continue;
                }

                let angle = fieldOfViewStart + (ray / this.fieldOfViewRays) * fieldOfViewRadian;

                let direction = Vector2.fromAngle(angle);

                let cast = new Line(this.position, direction, 1);

                let intersection = obstacle.intersectsLine(cast);

                if (intersection.length > 0) {
                    let hit = intersection
                        .reduce(
                            (min, next) => next.distanceSq(this.position) < min.distanceSq(this.position) ? next : min,
                            new Vector2(Infinity, Infinity)
                        );

                    let hitDistance = this.position.distance(hit);

                    if (hitDistance > fieldOfView) {
                        continue;
                    }

                    if (cast.scalar(hit) < 0) {
                        continue;
                    }

                    this.hits[ray] = this.hits[ray].distance <= hitDistance ?
                        this.hits[ray] :
                        new Item(ItemGoal, hitDistance)
                }
            }

            for (let i = 0; i < this.world.obstacles.length; i++) {
                let obstacle = this.world.obstacles[i];

                if (!fieldOfView.hit(obstacle)) {
                    continue;
                }

                let angle = fieldOfViewStart + (ray / this.fieldOfViewRays) * fieldOfViewRadian;

                let direction = Vector2.fromAngle(angle);

                let cast = new Line(this.position, direction, 1);

                let intersection = obstacle.intersectsLine(cast);

                if (intersection.length > 0) {
                    let hit = intersection
                        .reduce(
                            (min, next) => next.distanceSq(this.position) < min.distanceSq(this.position) ? next : min,
                            new Vector2(Infinity, Infinity)
                        );

                    let hitDistance = this.position.distance(hit);

                    if (hitDistance > fieldOfView) {
                        continue;
                    }

                    if (cast.scalar(hit) < 0) {
                        continue;
                    }

                    this.hits[ray] = this.hits[ray].distance <= hitDistance ?
                        this.hits[ray] :
                        new Item(ItemObstacle, hitDistance)
                }
            }
        }
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
        let collider = this.collider();

        if (collider.x - collider.r <= 0 || collider.y - collider.r <= 0) {
            return true;
        }

        return collider.x + collider.r >= this.world.size.width || collider.y + collider.r >= this.world.size.height;
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
        if (false /* draw edges */) {
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
        context.fillText(this.getFitness(), -18, -1);

        context.fillText(Math.round(this.lifeTime * 100) / 100, -18, 11);

        context.restore();

        // collider
        this.collider().draw(context);

        let fieldOfViewRadian = this.fieldOfViewAngle * Math.PI / 180;

        let fieldOfViewStart = this.direction.angle() - fieldOfViewRadian * 0.5;

        for (let ray = 0; ray < this.fieldOfViewRays; ray++) {
            let angle = fieldOfViewStart + (ray / this.fieldOfViewRays) * fieldOfViewRadian;

            let direction = Vector2.fromAngle(angle);

            if (this.hits[ray].type === ItemNone) {
                new Line(this.position, direction, this.fieldOfViewDistance).draw(context, `rgba(0, 0, 0, 0.2)`);
            } else {
                let color = this.hits[ray].type === ItemGoal ? `rgba(123, 255, 123, 0.2)` : `rgba(255, 123, 123, 0.2)`;
                new Line(this.position, direction, this.hits[ray].distance).draw(context, color);
            }
        }
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
