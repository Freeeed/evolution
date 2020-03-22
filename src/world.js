import {Math2, Vector2} from "./helpers";
import Circle from "./circle";
import Car from "./car";


export default class World {

    constructor(framework) {
        this.framework = framework;

        this.start = new Vector2(700, 250);

        this.goals = [
            new Vector2(600, 100),
            new Vector2(1300, 320),
        ];

        this.size = {
            width: 1440,
            height: 483
        };

        this.people = [];
        this.population = [];
        this.obstacles = [];
    }

    static pixelsPerUnit() {
        return 50;
    }

    reset() {
        this.population.forEach(item => {
            item.reset();
        });
    }

    update(deltaTime) {
        let peopleCounter = 8;

        if (this.people.length < peopleCounter) {
            for (let person = 0; person < peopleCounter - this.people.length; person++) {
                this.spawnPerson();
            }
        }

        let deathCounter = 0;

        this.population.forEach(item => {
            item.update(deltaTime);

            if (!item.canMove()) {
                deathCounter++;
            }
        });

        for (let death = 0; death < deathCounter; death++) {
            this.addNewPopulation();
        }

        let newPopulation = [];
        this.population.forEach(item => {
            if (item.canMove()) {
                newPopulation.push(item);
            }
        });

        this.population = newPopulation;

        this.population.sort((a, b) => {
            if (a.getFitness() === b.getFitness()) {
                return 0;
            }

            if (a.getFitness() > b.getFitness()) {
                return -1;
            }

            if (a.getFitness() < b.getFitness()) {
                return 1;
            }
        });

        this.framework.reportProgress(0);
    }

    addNewPopulation() {
        let matingPool = this.makeMatingpool();

        let idx1 = Math.floor(Math.random() * matingPool.length);
        let idx2 = Math.floor(Math.random() * matingPool.length);

        let a = matingPool[idx1];
        let b = matingPool[idx2];

        let dna = a.brain.combine(b.brain);

        this.population.push(new Car(dna, this));

        this.generation += 1 / this.population.length;
    }

    makeMatingpool() {
        let matingPool = [];

        let maxScore = 0;
        this.population.forEach(item => {
            if (item.getFitness() > maxScore) {
                maxScore = item.getFitness();
            }
        });

        if (maxScore === 0) {
            return this.population;
        }

        this.population.forEach(item => {
            let amount = Math.floor(item.getFitness() * 100 / maxScore);

            for (let i = 0; i < amount; i++) {
                matingPool.push(item);
            }
        });

        return matingPool;
    }

    best() {
        if (this.population.length < 1) {
            return null;
        }

        return this.population[0];
    }

    median() {
        if (this.population.length < 1) {
            return null;
        }

        let medianPosition = this.population.length - Math.ceil(this.population.length / 2);

        return this.population[medianPosition];
    }

    spawnPerson() {

        let x = Math2.clamp(0.1, 0.9, Math.random()) * this.size.width;
        let y = Math2.clamp(0.1, 0.9, Math.random()) * this.size.height;
        let r = 20;

        this.people.push(new Circle(x, y, r));
    }

    removePerson(person) {
        let index = this.people.indexOf(person);

        if (index !== -1) {
            this.people.splice(index, 1);
        }
    }
}

