class Car {

    constructor(dna, world) {
        this.world = world;
        this.width = 25;
        this.length = 40;

        this.currentGoal = 0;
        this.lifeTime = 25;
        this.dead = false;
        this.goalReached = false;

        this.fieldOfViewSectors = 16;
        this.fieldOfViewDistance = 350;
        this.fieldOfViewAngle = 235;

        this.outerRadius = Math.sqrt(this.length * this.length + this.width * this.width) * 0.5;

        this.rbgColor = Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255);

        this.velocity = 2;
        this.position = Vector2.fromObject(this.world.start);
        this.initialDirection = Vector2.fromAngle(Math.random() * 2 * Math.PI);

        this.distanceTraveled = 0;

        this.brain = new Brain([this.fieldOfViewSectors * 2, 16, 2]);

        if(dna == null) {
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

        this.lifeTime-= deltaTime;

        this.cacheCollider();

        this.cacheObjectsInFieldOfView();

        // use brain
        let directionToNextGoal = this.world.goals[this.currentGoal].substract(this.position).normalize();

        let angleToNextGoal = directionToNextGoal.angle() / (2 * Math.PI);
        let angle = this.direction.angle() / (2 * Math.PI);

        let output = this.brain.use([angleToNextGoal, angle].concat(this.cachedObjectsInFieldOfView));

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

        if (this.hitGoal()) {
            this.currentGoal++;
            this.lifeTime+= 25;

            if(this.currentGoal >= this.world.goals) {
                this.goalReached = true;
            }
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

    brain() {
        return this.brain;
    }

    distanceTravled() {
        return this.distanceTraveled;
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
        /*
        Checks all sectors for obstacles

        1. check global circle and store obstables in range

        2. for each sector check each obstacle in range

        2.1. check for outer lines of individuel sector
        */

        this.cachedObjectsInFieldOfView = [];

        let fieldOfView = new Circle(this.centerX(), this.centerY(), this.fieldOfViewDistance);

        let obstaclesInRange = [];

        // objects in range
        for (let i = 0; i < this.world.obstacles.length; i++) {
            let obstacle = this.world.obstacles[i];

            if (!fieldOfView.hit(obstacle)) {
                continue;
            }

            obstaclesInRange.push(obstacle);
        }

        let fieldOfViewRadian = this.fieldOfViewAngle * Math.PI / 180;

        let fieldOfViewStart = this.direction.angle() - fieldOfViewRadian * 0.5;

        for (let sector = 0; sector < this.fieldOfViewSectors; sector++) {
            this.cachedObjectsInFieldOfView[sector] = 0;
        }

        for (let i = 0; i < obstaclesInRange.length; i++) {
            let obstacle = obstaclesInRange[i];

            let directionToObstacle = obstacle.toVector().substract(this.position);

            let angleBetweenThisAndObstacle = Math.atan2(directionToObstacle.y, directionToObstacle.x);
            let ownAngle = Modulo.modulo(this.direction.angle(), 2 * Math.PI);
            
            let a = Modulo.signed(angleBetweenThisAndObstacle - ownAngle, Math.PI * 2);

            window.debug.innerHTML = fieldOfViewRadian + "<br>" + a + "<br>" + angleBetweenThisAndObstacle + "<br>" + ownAngle;

            if (a >= 0 && a < fieldOfViewRadian) {
                obstacle.mark();
                /*if (d < this.cachedObjectsInFieldOfView[Math.floor(a * FOVDIVISIONS / fieldOfViewRadian)].distance) {
                    this.cachedObjectsInFieldOfView[Math.floor(a * FOVDIVISIONS / fieldOfViewRadian)].distance = d;
                    this.cachedObjectsInFieldOfView[Math.floor(a * FOVDIVISIONS / fieldOfViewRadian)].type = type;
                }*/
            } else if (a <= 0 && -a < fieldOfViewRadian) {
                obstacle.mark();
                /*if (d < this.cachedObjectsInFieldOfView[Math.floor(-a * FOVDIVISIONS / fieldOfViewRadian) + FOVDIVISIONS].distance) {
                    this.cachedObjectsInFieldOfView[Math.floor(-a * FOVDIVISIONS / fieldOfViewRadian) + FOVDIVISIONS].distance = d;
                    this.cachedObjectsInFieldOfView[Math.floor(-a * FOVDIVISIONS / fieldOfViewRadian) + FOVDIVISIONS].type = type;
                }*/
            }

            let sector = 0;

            if (true /*obstacle.intersectsLineSegment(this.position, pointB) ||
                obstacle.intersectsLineSegment(this.position, pointC)*/) {

                let distanceToObstacleBorder = obstacle.toVector().distance(this.position) - obstacle.r;

                let newDistance = distanceToObstacleBorder / this.fieldOfViewDistance - 1;

                if(this.cachedObjectsInFieldOfView[sector] > 0) {
                    newDistance = Math.min(this.cachedObjectsInFieldOfView[sector], newDistance);
                }

                this.cachedObjectsInFieldOfView[sector] = newDistance;
            }
        }

        // window.debug.innerHTML = this.cachedObjectsInFieldOfView;
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

    hitGoal() {
        return Circle.fromVector(this.world.goals[this.currentGoal], 20).hit(this.collider());
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
        if(this.dead) {
            // return 0;
        }

        return this.currentGoal + this.lifeTime / 4;
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

        context.restore();

        // direction
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.strokeStyle = 'rgba(0, 0, 0, 1)';

        context.beginPath();

        context.moveTo(this.position.x, this.position.y);
        context.lineTo(this.position.x + this.direction.x * 50, this.position.y + this.direction.y * 50);

        context.stroke();
        context.fill();

        // collider
        this.collider().draw(context);

        let fieldOfViewRadian = this.fieldOfViewAngle * Math.PI / 180;

        let fieldOfViewStart = this.direction.angle() - fieldOfViewRadian * 0.5;

        for (let sector = 0; sector < this.fieldOfViewSectors; sector++) {
            // FoV
            context.beginPath();

            let alpha = 0.05 + (sector / this.fieldOfViewSectors * 0.3);

            if (this.objectsInFieldOfView()[sector] < 0) {
                context.fillStyle = 'rgba(200, 100, 100, ' + alpha + ')';
                context.strokeStyle = 'rgba(200, 100, 100, ' + alpha + ')';
            } else if(this.objectsInFieldOfView()[sector] > 0) {
                context.fillStyle = 'rgba(100, 200, 100, ' + alpha + ')';
                context.strokeStyle = 'rgba(100, 200, 100, ' + alpha + ')';
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

        // this.brain.draw(context);
    }
}

const ItemObstacle = 0;
const ItemGoal = 1;

class Item {

    constructor(type, distance) {
        this.type = type;
        this.distance = distance;
    }
}
