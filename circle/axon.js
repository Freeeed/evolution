
class Axon {

    constructor(brain, weight, mutability) {
        this.brain = brain;
        this.weight = weight;
        this.mutability = mutability;

        this.mutabilityMutability = 0.7;
        this.mutatePower = 9;
        this.murateMultiplicator = Math.pow(0.5, this.mutatePower);
    }

    mutate() {
        let mutabilityMutate = 0.7;

        let mutation = this._plusMinusRandom() * this.mutability;

        let newM = this.weight + mutation;

        // console.log(newM);

        return new Axon(this.brain, newM, this.mutability * mutabilityMutate);
    }

    /**
     * random number between -1 and 1
     */
    _plusMinusRandom() {
        return (Math.random() * 2 - 1);
    }
}
