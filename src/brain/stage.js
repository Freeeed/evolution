
export default class Stage {

    constructor(prevStage, size) {
        this.signalMultiplier = 2;

        this.prev = prevStage;

        this.output = [];
        this.axons = [];



        for(let i = 0; i < size; i++) {
            this.output.push(0);

            if(this.prev != null) {
                this.axons[i] = [];

                for(let j = 0; j < this.prev.output.length; j++) {
                    this.axons[i].push(0);
                }
            }
        }
    }

    calculate() {
        if(this.prev == null) {
            return;
        }

        for (let i = 0; i < this.axons.length; i++) {
            let sum = 0;

            for (let j = 0; j < this.axons[0].length - 1; j++) {
                sum += this.axons[i][j] * this.prev.output[j];
            }

            sum += this.axons[i][this.axons[0].length - 1] * this.signalMultiplier;

            this.output[i] = this.sigmoid(sum);
        }
    }

    sigmoid(x) {
        return (this.signalMultiplier / (1.0 + Math.exp(-x)) - 1);
    }
}
