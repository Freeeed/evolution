class World {

    constructor(framework) {
        this.framework = framework;

        this.start = new Vector2(300, 300);

        this.goals = [
            new Vector2(600, 100),
            new Vector2(1300, 320),
        ];

        this.size = {
            width: 1440,
            height: 483
        };

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
        let deathCounter = 0;

        this.population.forEach(item => {
            item.update(deltaTime);

            if(!item.canMove()) {
                deathCounter++;
            }
        });

        for(let death = 0; death < deathCounter; death++) {
            this.addNewPopulation();
        }

        let newPopulation = [];
        this.population.forEach(item => {
            if(item.canMove()) {
                newPopulation.push(item);
            }
        });

        this.population = newPopulation;

        this.population.sort((a, b) => {
            if(a.getFitness() == b.getFitness()) {
                return 0;
            }

            if(a.getFitness() > b.getFitness()) {
                return -1;
            }

            if(a.getFitness() < b.getFitness()) {
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

        this.population.forEach(item => {
            let amount = Math.floor(item.getFitness() * 100 / maxScore);

            for (let i = 0; i < amount; i++) {
                matingPool.push(item);
            }
        });

        return matingPool;
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

        let medianPosition = this.population.length - Math.ceil(this.population.length / 2);

        return this.population[medianPosition];
    }
}
