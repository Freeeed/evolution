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

        window.debug.innerHTML = deathCounter + " " + this.population.length;
    }

    addNewPopulation() {

        let matingPool = this.makeMatingpool();

        let idx1 = Math.floor(Math.random() * matingPool.length);
        let idx2 = Math.floor(Math.random() * matingPool.length);

        let a = matingPool[idx1];
        let b = matingPool[idx2];

        let dna = a.brain.combine(b.brain);

        this.population.push(new Car(dna, this));
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
}
