<template>
    <div class="h-screen">
        <div class="input-controls">
            <div class="progress-bar">
                <div id="progress" class="progress">{{ progress }}%</div>
            </div>

            <div class="flex items-center">
                <label class="flex-grow text-right p-2" for="inputPopulation">Population:</label><input
                class="border solid border-black py-1 px-2" id="inputPopulation" type="text"
                v-model.number="population">
            </div>
            <div class="flex items-center">
                <label class="flex-grow text-right p-2" for="inputGenerations">Generations:</label><input
                class="border solid border-black py-1 px-2" id="inputGenerations" type="text"
                v-model.number="generations">
            </div>
            <div class="flex items-center">
                <label class="flex-grow text-right p-2" for="inputTimePerGeneration">Time p. gen.:</label><input
                class="border solid border-black py-1 px-2" id="inputTimePerGeneration" type="text"
                v-model.number="timePerGeneration">
            </div>
            <div class="flex items-center">
                <label class="flex-grow text-right p-2" for="inputSpeed">Speed:</label><input
                class="border solid border-black py-1 px-2" id="inputSpeed" type="text" v-model.number="speed">
            </div>

            <div class="flex">
                <button
                    class="flex-grow mr-1 p-1 bg-blue-600 hover:bg-blue-400 rounded border-solid border border-blue-900"
                    @click="initialize">Initialize
                </button>
                <button
                    v-if="framework.paused"
                    class="flex-grow ml-1 p-1 bg-blue-600 hover:bg-blue-400 rounded border-solid border border-blue-900"
                    @click="start">Start
                </button>
                <button
                    v-else
                    class="flex-grow ml-1 p-1 bg-blue-600 hover:bg-blue-400 rounded border-solid border border-blue-900"
                    @click="pause">Pause
                </button>
            </div>

            <div class="flex">
                <button
                    class="flex-grow mr-1 p-1 bg-blue-600 hover:bg-blue-400 rounded border-solid border border-blue-900"
                    @click="save">Save
                </button>
                <button
                    class="flex-grow ml-1 p-1 bg-blue-600 hover:bg-blue-400 rounded border-solid border border-blue-900"
                    @click="load">Load
                </button>
            </div>

            <div id="debug">
                {{ debug }}
            </div>
        </div>

        <canvas class="w-full h-full" id="screen" ref="screen"></canvas>
    </div>
</template>

<script>
    import Framework from './framework';
    import Renderer from './renderer';

    export default {
        name: "App",

        data() {
            return {
                framework: new Framework(),
                renderer: null,
                progress: 0,
                debug: null,
                population: 1,
                generations: 10,
                timePerGeneration: 30,
                speed: 1,
            };
        },

        mounted() {
            this.framework.addProgressHandler(progress => {
                this.progress = progress;
            });

            this.initialize();

            this.renderer = new Renderer(this.framework);
            this.renderer.loop();
        },

        methods: {
            initialize() {
                this.framework
                    .initialize(this.population, Math.floor(this.population / 3))
                    .setGenerations(this.generations)
                    .setSpeed(this.speed);
            },

            start() {
                if (this.framework.isInitialized()) {
                    this.framework.start();
                }
            },

            pause() {
                this.framework.pause();
            },

            save() {
                localStorage.setItem(`population`, this.population);
                localStorage.setItem(`generations`, this.generations);
                localStorage.setItem(`timePerGeneration`, this.timePerGeneration);
                localStorage.setItem(`speed`, this.speed);

                this.framework.world.population.forEach((inhabitant, index) => {
                    const brain = inhabitant.brain;

                    const dna = brain.axons().join(';');

                    localStorage.setItem(`inhabitant.${index}`, dna);
                })
            },

            load() {
                this.population = parseInt(localStorage.getItem(`population`));
                this.generations = parseInt(localStorage.getItem(`generations`));
                this.timePerGeneration = parseInt(localStorage.getItem(`timePerGeneration`));
                this.speed = parseInt(localStorage.getItem(`speed`));

                this.initialize();

                for (let index = 0; index < this.population; index++) {
                    const dna = localStorage.getItem(`inhabitant.${index}`).split(';').map((axon) => parseFloat(axon));

                    this.framework.world.population[index].brain.load(dna);
                }
            },
        },
    };
</script>

<style scoped>

</style>
