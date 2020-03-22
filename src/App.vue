<template>
    <div>

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
            };
        },

        mounted() {
            this.framework.addProgressHandler(progress => {
                this.progress = progress;
                return;

                stats.innerHTML = "Median: " + Math.round(this.framework.world.median().getFitness()) +
                    " | Best: " + Math.round(this.framework.world.median().getFitness()) + " ";

                progressBar.style.width = progress + "%";
                progressBar.innerHTML = (Math.round(progress * 100) / 100) + "%";
            });

            this.framework.initialize(populationInput.value, Math.floor(populationInput.value / 3));
            document.getElementById('initialize-button').addEventListener('click', () => {
                this.framework.initialize(populationInput.value, Math.floor(populationInput.value / 3));
            });

            document.getElementById('start-button').addEventListener('click', () => {
                if (this.framework.isInitialized()) {
                    this.framework.start(generationsInput.value, speedInput.value);
                }
            });

            this.renderer = new Renderer(this.framework);
            this.renderer.loop();
        }
    };
</script>

<style scoped>

</style>
