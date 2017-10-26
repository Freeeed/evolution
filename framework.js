
class Framework {

    constructor() {
        this.world = new World(this);

        this.world.obstacles = [
            new Circle(120, 400, 20),
            new Circle(470, 40, 20),
            new Circle(850, 350, 20),
            new Circle(20, 480, 20),
            //420, 300, 20,
            new Circle(500, 350, 20),
        ];

        let wallObS = 8;

        for (let x = 0; x < this.world.size.width; x += wallObS * 2) {
            this.world.obstacles.push(new Circle(x, 0, wallObS));
            this.world.obstacles.push(new Circle(x, this.world.size.height, wallObS));
        }

        for (let y = 0; y < this.world.size.height; y += wallObS * 2) {
            this.world.obstacles.push(new Circle(0, y, wallObS));
            this.world.obstacles.push(new Circle(this.world.size.width, y, wallObS));
        }

        /*for(let i = 0; i < 5; i++) {
            let x = 500 + Math.random() * 1000;

            let y;

            if(x > 500) {
                y = Math.random() * 400;
            } else {
                y = 300 + Math.random() * 100;
            }

            this.world.obstacles.push(
                new Circle(x, y, 30)
            );
        }*/

        this.generation = 0;
        this.iterations = 0;
        this.iteration = 0;
        this.updatesPerGeneration = 1;

        this.speed = null;
        this.paused = true;

        this.progressHandlers = [];

        this.loopTimer = null;
    }

    static simulationSpeed() {
        return 1;
    }

    initialize(populationNumber, updatesPerGeneration) {
        clearTimeout(this.loopTimer);

        this.generation = 0;
        this.world.population = [];
        this.updatesPerGeneration = updatesPerGeneration;

        for(let k = 0; k < populationNumber; k++) {
            this.world.population.push(
                new Car(null, this.world)
            );
        }

        // this.world.resortPopulation();
    }

    update(deltaTime) {
        if(this.paused) {
            return;
        }

        this.world.update(this.speed * deltaTime);
    }

    start(iterations, speed) {

        if(!this.paused) {
            return;
        }

        this.world.reset();

        this.speed = speed;
        this.iterations = iterations;
        this.iteration = 0;
        this.paused = false;
    }

    isInitialized() {
        return this.world.population.length > 0;
    }

    /**
     * Triggered once when simulation has finished
     * 
     */
    simulationFinished() {
        return false;

        for(let i = 0; i < this.world.population.length; i++) {
            if(this.world.population[i].canMove()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Triggered once when simulation has finished
     * 
     */
    simulationFinishedOnce() {
        if(!this.paused && this.simulationFinished()) {

            if(this.iteration >= this.iterations/*this.iterationsFinished()*/) {
                this.paused = true;

                this.reportProgress(100);
            } else {
                this.updatePopulation();

                this.world.reset();

                this.reportProgress((this.iteration + 1) / this.iterations * 100);

                this.iteration++;
            }

            return true;
        }

        return false;
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
        this.resortPopulation();

        window.debug.innerHTML = `${this.median().getFitness()} <br> ${this.best().getFitness()}`;

        this.removeUnfittest();

        this.addNewGeneration();

        this.generation++;
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
        let dna = a.brain.combine(b.brain);

        return new Car(dna, this.world);
    }

    getRandomChild() {
        return this.world.population[getRandomInt(0, this.world.population.length - 1)];
    }
};
