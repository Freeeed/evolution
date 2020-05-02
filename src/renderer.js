import Framework from "./framework";
import Circle from "./circle";

export default class Renderer {

    constructor(framework) {
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

        Circle.fromVector(this.framework.world.start, 20).draw(this.canvas, 'rgba(0, 0, 0, 0.1)');
        Circle.fromVector(this.framework.world.start, 10).draw(this.canvas, 'rgba(0, 255, 0, 0.4)');

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
