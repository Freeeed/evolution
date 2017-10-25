
class Renderer {
    
    constructor(framework) {
        this.offset = 50;
        this.scale = 70;

        this.screen = document.getElementById('screen');

        this.canvas = this.screen.getContext('2d');

        this._adjustCanvasSize();

        this._registerEventHandlers();

        this.framework = framework;

        this.brain = new Brain(3, 5);
    }

    loop() {
        let fps = 1;
        let minFps = 1;
        let loops = 0;
        let nextGameTick = (new Date).getTime();
        let lastGameTick = (new Date).getTime();
        let startTime = (new Date).getTime();

        let loopCallback = (timestamp) => {
            loops = 0;

            while ((new Date).getTime() > nextGameTick && loops < minFps) {
                this.update(nextGameTick - startTime, nextGameTick - lastGameTick);

                lastGameTick = nextGameTick;
                nextGameTick += 1000 / fps;
                loops++;
            }

            this.draw();

            requestAnimationFrame(loopCallback);
        }

        requestAnimationFrame(loopCallback);
    }

    update(time, deltaTime) {
        this.brain.use([0.5, 0.1, -0.7, 1, -0.2]);

        for(let x = 0; x < this.brain.width - 1; x++) {
            for(let y = 0; y < this.brain.height; y++) {
                for(let z = 0; z < this.brain.height - 1; z++) {
                    this.brain.axons[x][y][z] = this.brain.axons[x][y][z].mutate();
                }
            }
        }
    }

    draw() {
        if(!this.framework.isInitialized()) {
            return;
        }

        this.canvas.clearRect(
            0,
            0,
            document.getElementById('screen').width,
            document.getElementById('screen').height
        );

        this.canvas.fillStyle = 'rgba(0, 0, 0, 1)';
        this.canvas.font = "16px Arial";
        this.canvas.fillText(this.framework.generation, 15, 15);

        for(let i = 0; i < this.framework.circles.length; i++) {
            let item = this.framework.circles[i];

            this._drawCircle(item.x, item.y, item.r);
        }

        this._drawCircle(
            this.framework.population[0].x,
            this.framework.population[0].y,
            this.framework.population[0].r,
            'rgba(223, 223, 0, 1)',
            'rgba(223, 223, 0, 1)',
        );

        for(let i = 1; i < this.framework.population.length; i++) {
            let item = this.framework.population[i];

            this._drawCircle(item.x, item.y, item.r, 'rgba(0, 0, 0, 0)', 'rgba(255, 0, 0, .5)');
        }

        this._drawBestBrain();
    }

    _drawCircle(x, y, r, color, border) {
        this.canvas.beginPath();

        this.canvas.arc(
            x,
            y,
            r,
            0,
            2 * Math.PI
        );

        if(typeof color == 'undefined') {
            color = 'rgba(0, 0, 0, 0)';
        }

        if(typeof border == 'undefined') {
            border = 'rgba(0, 0, 0, 1)';
        }

        this.canvas.fillStyle = color;
        this.canvas.strokeStyle = border;

        this.canvas.stroke();
        this.canvas.fill();
    }

    _drawBestBrain() {
        let neuronSize = 0.2;

        let abw = this.brain.width * 2 - 1;

        this.canvas.fillStyle = "rgba(100, 100, 100, 1)";
        this.canvas.fillRect(
            -neuronSize * 2 * this.scale + this.offset,
            -neuronSize * 2 * this.scale + this.offset,
            (abw + neuronSize * 2) * this.scale,
            (this.brain.height + neuronSize * 2) * this.scale
        );

        for(let x = 0; x < this.brain.width; x++){
            for(let y = 0; y < this.brain.height; y++){

                let neuron = this.brain.neurons[x][y];

                this.canvas.beginPath();
                
                this.canvas.strokeStyle = this._neuronFillColor(neuron);
                this.canvas.fillStyle = this._neuronFillColor(neuron);

                this.canvas.arc(
                    x * 2 * this.scale + this.offset,
                    y * this.scale + this.offset,
                    neuronSize * this.scale,
                    0,
                    2 * Math.PI
                );

                this.canvas.stroke();
                this.canvas.fill();

                this.canvas.font = "12px Arial";
                this.canvas.fillStyle = this._neuronTextColor(neuron);
                this.canvas.strokeStyle = this._neuronTextColor(neuron);
                this.canvas.fillText(
                    neuron,
                    (x + neuronSize * -0.15) * 2 * this.scale + this.offset,
                    (y + neuronSize * 0.35) * this.scale + this.offset
                );
            }
        }

        for(let x = 0; x < this.brain.width - 1; x++) {
            for(let y = 0; y < this.brain.height; y++) {
                for(let z = 0; z < this.brain.height; z++) {
                    this._drawAxon(x, y, x + 1, z);
                }
            }
        }
    }

    _drawAxon(x1, y1, x2, y2){
        this.canvas.beginPath();

        this.canvas.fillStyle = this._neuronFillColor(
            this.brain.axons[x1][y1][y2].weight * this.brain.neurons[x1][y1]
        );

        this.canvas.strokeStyle = this._neuronFillColor(
            this.brain.axons[x1][y1][y2].weight * this.brain.neurons[x1][y1]
        );

        this.canvas.moveTo(x1 * 2 * this.scale + this.offset, y1 * this.scale + this.offset);
        this.canvas.lineTo(x2 * 2 * this.scale + this.offset, y2 * this.scale + this.offset);

        this.canvas.stroke();
        this.canvas.fill();
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

    _registerEventHandlers() {
        window.addEventListener('resize', () => {
            this._adjustCanvasSize();
        });
    }

    _adjustCanvasSize() {
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;

        this.screenWidth = this.screen.width;
        this.screenHeight = this.screen.height;
    }
};
