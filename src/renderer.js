import Framework from "./framework";
import World from "./world";
import Circle from "./circle";

export default class Renderer {

    constructor(framework) {
        this.offset = 50;
        this.scale = 70;

        this.screen = document.getElementById('screen');

        this.canvas = this.screen.getContext('2d');

        this._adjustCanvasSize();

        this._registerEventHandlers();

        this.framework = framework;
    }

    loop() {
        let fps = 60;
        let minFps = 10;
        let loops = 0;
        let nextGameTick = (new Date).getTime();
        let lastGameTick = (new Date).getTime();
        let startTime = (new Date).getTime();

        let loopCallback = () => {
            loops = 0;

            while ((new Date).getTime() > nextGameTick && loops < minFps) {
                this.update(
                    (nextGameTick - startTime) / 1000,
                    (nextGameTick - lastGameTick) * Framework.simulationSpeed() / 1000
                );

                lastGameTick = nextGameTick;
                nextGameTick += 1000 / fps;
                loops++;
            }

            this.draw();

            requestAnimationFrame(loopCallback);
        };

        requestAnimationFrame(loopCallback);
    }

    update(time, deltaTime) {
        this.framework.update(deltaTime);

        if (this.framework.simulationFinishedOnce()) {
            // this.framework.clearSimulation();
        }
    }

    draw() {
        if (!this.framework.isInitialized()) {
            return;
        }

        this.canvas.clearRect(
            0,
            0,
            this.screenWidth,
            this.screenHeight
        );

        this.canvas.beginPath();

        this.canvas.moveTo(15, 100);
        this.canvas.lineTo(15 + World.pixelsPerUnit(), 100);

        this.canvas.fill();
        this.canvas.stroke();

        this.canvas.beginPath();

        this.canvas.moveTo(15, 100);
        this.canvas.lineTo(15, 100 - World.pixelsPerUnit());

        this.canvas.fill();
        this.canvas.stroke();

        this.canvas.fillStyle = 'rgba(0, 0, 0, 1)';
        this.canvas.font = "16px Arial";
        this.canvas.fillText(this.framework.generation, 15, 15);

        Circle.fromVector(this.framework.world.start, 20).draw(this.canvas, 'rgba(0, 0, 0, 0.1)');
        Circle.fromVector(this.framework.world.start, 10).draw(this.canvas, 'rgba(0, 255, 0, 0.4)');

        /*this.framework.world.goals.forEach(goal => {
            Circle.fromVector(goal, 20).draw(this.canvas, 'rgba(0, 0, 0, 0.1)');
            Circle.fromVector(goal, 10).draw(this.canvas, 'rgba(255, 0, 0, 0.4)');
        });*/

        for (let i = 0; i < this.framework.world.obstacles.length; i++) {
            let obstacle = this.framework.world.obstacles[i];

            obstacle.draw(this.canvas);
        }

        let best = this.framework.world.best();

        if (best != null) {
            best.draw(this.canvas);
        }

        for (let i = 1; i < this.framework.world.population.length; i++) {
            let item = this.framework.world.population[i];

            item.draw(this.canvas);
        }

        for (let i = 1; i < this.framework.world.people.length; i++) {
            let item = this.framework.world.people[i];

            item.draw(this.canvas, 'rgba(123, 255, 123, 0.2)');
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
