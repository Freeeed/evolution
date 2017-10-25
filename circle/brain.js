
class Brain {

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.axons = [];
        this.neurons = [];

        for(let x = 0; x < width - 1; x++) {
            this.axons[x] = [];
            for(let y = 0; y < height; y++) {
                this.axons[x][y] = [];

                for(let z = 0; z < height; z++) {
                    let startingWeight = (Math.random() * 2 - 1) * 1;

                    this.axons[x][y][z] = new Axon(
                        this,
                        startingWeight,
                        0.05
                    );
                }
            }
        }

        this.setUpBasics(width, height);
    }

    setUpBasics(width, height){
        this.neurons = [];

        for(let x = 0; x < this.width; x++) {
            this.neurons[x] = [];
            for(let y = 0; y < this.height; y++) {
                if(y == this.height - 1) {
                    this.neurons[x][y] = 1;
                } else {
                    this.neurons[x][y] = -1;
                }
            }
        }
    }

    compute() {

    }

    use(input) {
        for(let i = 0; i < input.length; i++) {
            this.neurons[0][i] = input[i];
        }

        for(let x = 1; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                let total = 0;

                for(let input = 0; input < this.height; input++) {
                    total += this.neurons[x - 1][input] * this.axons[x - 1][input][y].weight;
                }

                if(x == this.width - 1) {
                    // TODO: rectify x <= 0 --> y = 0 ???
                    this.neurons[x][y] = total;
                } else {
                    this.neurons[x][y] = this._sigmoid(total);
                }
            }
        }

        let output = [];

        for(let i = 0; i < input.length; i++) {
            output.push(this.neurons[this.width - 1][i]);
        }

        return output;
    }

    _sigmoid(x) {
        return 1.0 / (1.0 + Math.pow(Math.E, -x));
    }
}
