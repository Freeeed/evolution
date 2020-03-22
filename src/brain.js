import Stage from "./brain/stage";

export default class Brain {

    constructor(stageSizes) {
        this.stages = [];

        let prevStage = null;

        for (let i = 0; i < stageSizes.length; i++) {
            this.stages[i] = new Stage(prevStage, stageSizes[i]);
            prevStage = this.stages[i];
        }
    }

    load(axons) {
        let idx = 0;

        for (let s = 1; s < this.stages.length; s++) {
            for (let i = 0; i < this.stages[s].axons.length; i++) {
                for (let j = 0; j < this.stages[s].axons[0].length; j++) {
                    this.stages[s].axons[i][j] = axons[idx++];
                }
            }
        }
    }

    combine(other) {
        let data = this.axons();
        let dataOther = other.axons();

        let newData = [];

        let numswaps = data.length / 10;
        let swaps = [];

        for (let i = 0; i < swaps.length-1; i++) {
            swaps[i] = Math.floor(Math.random() * data.length);
        }

        swaps[numswaps] = data.length;

        swaps.sort();

        let swapidx = 0;

        let that = true;

        for (let i = 0; i < data.length; i++) {
            if (i >= swaps[swapidx]) {
                swapidx++;
                that = !that;
            }

            let d = 0;

            if (that) {
                d = data[i];
            } else {
                d = dataOther[i];
            }

            d += (2 * Math.random() - 1) * 0.5;

            newData[i] = d;
        }

        return newData;
    }

    use(input) {
        for (let i = 0; i < input.length; i++) {
            this.stages[0].output[i] = input[i];
        }

        for (let i = 1; i < this.stages.length; i++) {
            this.stages[i].calculate();
        }

        return this.stages[this.stages.length - 1].output;
    }

    calcNumberOfAxons(stageSizes, symmetrical) {
        let sum = 0;

        if (stageSizes.length < 2) {
            return 0;
        }

        for (let i = 1; i < stageSizes.length; i++) {
            if (symmetrical) {
                sum += (stageSizes[i] * (stageSizes[i - 1] + 1) + 1) / 2;
            } else {
                sum += stageSizes[i] * (stageSizes[i - 1] + 1);
            }
        }

        return sum;
    }

    axons() {
        let data = [];

        for (let s = 1; s < this.stages.length; s++) {
            for (let i = 0; i < this.stages[s].axons.length; i++) {
                for (let j = 0; j < this.stages[s].axons[0].length; j++) {
                    data.push(this.stages[s].axons[i][j]);
                }
            }
        }

        return data;
    }

    draw(canvas) {
        for (let s = 1; s < this.stages.length; s++) {
            let x1 = (s) * Math.floor(700 / (this.stages.length + 1));
            let x2 = (s + 1) * Math.floor(700 / (this.stages.length + 1));

            for (let i = 0; i < this.stages[s].axons.length; i++) {
                for (let j = 0; j < this.stages[s].axons[0].length - 1; j++) {
                    let weight = this.stages[s].axons[i][j];

                    if (Math.abs(weight) < 0)
                        continue;

                    let y1 = (j + 1) * Math.floor(400 / (this.stages[s - 1].output.length + 1));
                    let y2 = (i + 1) * Math.floor(400 / (this.stages[s].output.length + 1));

                    let b = (this.stages[s - 1].output[j] / this.stages[s].signalMultiplier);

                    canvas.beginPath();

                    canvas.strokeStyle = this._neuronFillColor(weight);
                    canvas.fillStyle = this._neuronFillColor(weight);

                    canvas.moveTo(x1, y1);
                    canvas.lineTo(x2, y2);
                    canvas.fill();
                    canvas.stroke();
                }
            }
        }

        for (let s = 0; s < this.stages.length; s++) {
            let x = (s + 1) * Math.floor(700 / (this.stages.length + 1));
            let d = (400 / (this.stages[s].output.length + 7));
            for (let i = 0; i < this.stages[s].output.length; i++) {
                let y = (i + 1) * Math.floor(400 / (this.stages[s].output.length + 1));

                let output = this.stages[s].output[i];

                canvas.strokeStyle = "rgba(0, 0, 0, 2)";
                canvas.fillStyle = this._neuronFillColor(output);

                canvas.beginPath();

                canvas.arc(
                    x - d / 2,
                    y - d / 2,
                    d, 0, 2 * Math.PI
                );

                canvas.fill();
                canvas.stroke();
            }
        }
    }

    _neuronFillColor(weight){
        if(weight >= 0){
            return 'rgba(255,255,255,' + weight + ')';
        }else{
            return 'rgba(1, 1, 1,' + Math.abs(weight) + ')';
        }
    }

    _neuronTextColor(weight) {
        if(weight >= 0){
            return 'rgb(0,0,0)';
        }else{
           return 'rgb(255,255,255)';
        }
    }
}
