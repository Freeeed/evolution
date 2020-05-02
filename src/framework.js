import Car from './car';
import Circle from './circle';
import World from './world';

export default class Framework {

    constructor() {
        this.world = new World(this);

        //this.world.obstacles = [];
        this.world.obstacles = [
            new Circle(120, 400, 20),
            new Circle(470, 40, 20),
            new Circle(850, 350, 20),
            new Circle(20, 480, 20),
            new Circle(500, 350, 20),
        ];

        this.generation = 0;
        this.generations = 0;
        this.iteration = 0;
        this.updatesPerGeneration = 1;
        this.timePerGenerations = 30;

        this.speed = null;
        this.paused = true;

        this.progressHandlers = [];

        this.loopTimer = null;
    }

    static simulationSpeed() {
        return 1;
    }

    setGenerations(generations) {
        this.generations = generations;

        return this;
    }

    setSpeed(speed) {
        this.speed = speed;

        return this;
    }

    initialize(populationNumber, updatesPerGeneration, timePerGenerations) {
        clearTimeout(this.loopTimer);

        this.generation = 0;
        this.iteration = 0;

        this.world.population = [];
        this.updatesPerGeneration = updatesPerGeneration;
        this.timePerGenerations = timePerGenerations;

        for (let k = 0; k < 8; k++) {
            this.world.spawnPerson();
        }

        for (let k = 0; k < populationNumber; k++) {
            this.world.population.push(
                new Car(null, this.world)
            );
        }

        this.world.reset();

        return this;
    }

    update(deltaTime) {
        if (this.paused) {
            return;
        }

        this.world.update(this.speed * deltaTime);
    }

    start() {
        if (!this.paused) {
            return;
        }

        this.paused = false;
    }

    pause() {
        if (this.paused) {
            return;
        }

        this.paused = true;
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

        for (let i = 0; i < this.world.population.length; i++) {
            if (this.world.population[i].canMove()) {
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
        if (!this.paused && this.simulationFinished()) {

            if (this.iteration >= this.generations/*this.generationsFinished()*/) {
                this.paused = true;

                this.reportProgress(100);
            } else {
                this.updatePopulation();

                this.world.reset();

                this.reportProgress((this.iteration + 1) / this.generations * 100);

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
        for (let i = 0; i < this.progressHandlers.length; i++) {
            this.progressHandlers[i](progress);
        }
    }
};
