
class Framework {

    constructor() {
        this.circles = [
            {x:50,y:80,r:150},
            {x:350,y:250,r:150},
            {x:20,y:480,r:90},
            {x:120,y:400,r:20},
            //{x:420,y:300,r:20},
            {x:120,y:300,r:20},
        ];

        this.generation = 0;
        this.population = [];
        this.updatesPerGeneration = 1;

        this.paused = true;

        this.progressHandlers = [];

        this.loopTimer = null;
    }

    initialize(populationNumber, updatesPerGeneration) {
        clearTimeout(this.loopTimer);

        this.generation = 0;
        this.population = [];
        this.updatesPerGeneration = updatesPerGeneration;

        for(let k = 0; k < populationNumber; k++) {
            this.population.push(
                this._createRandomItem()
            );
        }

        this.resortPopulation();
    }

    loop(iterations, speed) {
        clearTimeout(this.loopTimer);

        let lastPerc = 0;
        let totalIterations = iterations;

        let loopCallback = () => {
            let percentage = (totalIterations - iterations + 1) / totalIterations * 100;

            if(percentage > lastPerc + .1) {
                this.reportProgress(percentage);

                lastPerc = percentage;
            }

            this.updatePopulation();

            if(--iterations > 0) {
                this.loopTimer = setTimeout(loopCallback, 1000 / speed);
            } else {
                this.reportProgress(100);
            }
        };
        
        this.reportProgress(0);
        this.loopTimer = setTimeout(loopCallback, 1000 / speed);
    }

    isInitialized() {
        return this.population.length > 0;
    }

    addProgressHandler(callback) {
        this.progressHandlers.push(callback);   
    }

    reportProgress(progress) {
        for(let i = 0; i < this.progressHandlers.length; i++) {
            this.progressHandlers[i](progress);
        }
    }

    updatePopulation() {
        this.addNewGeneration();

        this.resortPopulation();

        this.removeUnfittest();

        this.generation++;
    }

    addNewGeneration() {
        for(let generation = 0; generation < this.updatesPerGeneration; generation++) {
            let parents = this._chooseParents();

            let child = this._combineParents(
                parents.a,
                parents.b
            );

            this._mutateOffspring(child);

            this._addChildToPopulation(child);
        }
    }

    resortPopulation() {
        this.population.sort(function(a, b) {
            if(a.fittness == b.fittness) {
                return 0;
            }

            if(a.fittness > b.fittness) {
                return -1;
            }

            if(a.fittness < b.fittness) {
                return 1;
            }
        });
    }

    removeUnfittest() {
        for(let generation = 0; generation < this.updatesPerGeneration; generation++) {
            this.population.pop();
        }
    }

    best() {
        if(this.population.length < 1) {
            return null;
        }

        return this.population[0];
    }

    median() {
        if(this.population.length < 1) {
            return null;
        }

        let medianPosition = Math.ceil(this.population.length / 2);

        return this.population[medianPosition];
    }

    _createRandomItem() {
        return this._createItem(
            getRandomInt(0, 500),
            getRandomInt(0, 400),
            getRandomInt(5, 50)
        );
    }

    _createItem(x, y, r) {
        return {
            x, y, r,
            fittness: this.rateOffspring(x, y, r),
        }
    }

    _chooseParents() {
        return {
            a: this.getRandomChild(),
            b: this.getRandomChild(),
        }
        // return 2 random items
        // return 2 random items from upper half?
    }

    _combineParents(a, b) {
        return this._createItem(
            Math.random() < 0.5 ? a.x : b.x,
            Math.random() < 0.5 ? a.y : b.y,
            Math.random() < 0.5 ? a.r : b.r
        );
    }

    _mutateOffspring(item) {
        item.x += getRandomInt(-20, 20);
        item.y += getRandomInt(-20, 20);
        item.r += getRandomInt(-2, 20);

        if(item.r < 1) {
            item.r = 1;
        }

        item.fittness = this.rateOffspring(
            item.x, item.y, item.r
        );
    }

    rateOffspring(x, y, r) {
        let overlapping = this._checkOverlappingCircles(x, y, r);

        let outside = (x - r < 0 || x + r > 500 || y - r < 0 || y + r > 400) ? 1 : 0;

        let area = 2 * Math.PI * r * r;

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

    _addChildToPopulation(child) {
        this.population.push(child);
    }

    getRandomChild() {
        return this.population[getRandomInt(0, this.population.length - 1)];
    }

    _checkOverlappingCircles(x, y, r) {
        let number = 0;

        for(let i = 0; i < this.circles.length; i++) {
            let item = this.circles[i];

            if(this._checkOverlapping({x, y, r}, item)) {
                number++;
            }
        }

        return number;
    }

    _checkOverlapping(circleA, circleB) {
        let distanceX = circleA.x - circleB.x;
        let distanceY = circleA.y - circleB.y;
        let radiusSum = circleA.r + circleB.r;

        return distanceX * distanceX + distanceY * distanceY <= radiusSum * radiusSum
    }
};
