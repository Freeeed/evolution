<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">

	<title>Circle Evolution</title>

	<style>

		* {
			box-sizing: border-box;
		}

		html,
		body {
			padding: 0;
			margin: 0;
			height: 100vh;
			/*overflow: hidden;*/
		}

		body > * {
			vertical-align: middle;
		}

		.input-controlls {
			position: absolute;
			background-color: rgba(200, 200, 200, 0.5);
			padding: 1em;
			top: 0;
			right: 0;
			margin: 0;
			width: 20em;
		}

		.progress-bar {
			width: 100%;
			border: 1px solid grey;
		}

		.progress {
			height: 25px;
			min-width: 30px;
			width: 0%;
			line-height: 27px;
			text-align: center;
			background-color: rgb(123, 123, 200);
			color: white;
		}

	</style>
</head>
<body>
	<div class="input-controlls">
		<div class="progress-bar">
			<div id="progress" class="progress">0%</div>
		</div>

		<span id="stats">Median: | Best: </span>

		<br>

		Population: <input type="text" id="populationInput" value="15"><br>
		Generations: <input type="text" id="generationsInput" value="10"><br>

		<button id="initialize-button">Initialize</button>
		<button id="start-button">Start</button>
		Speed: <input type="text" id="speedInput" value="2" size="5">
		<div id="debug"></div>
	</div>

	<canvas id="screen" width="500" height="600"></canvas>

	<?php

	$scripts = [
		'helpers.js',
		'framework.js',
		'renderer.js',
		'circle.js',
		'world.js',
		'car.js',
		'brain.js',
		'brain/stage.js',
	];

	foreach($scripts as $script) {
		echo '<script src="' . $script . '?t=' .  microtime(true) . '"></script>';
	}

	?>

	<!--<script src="drawer/brain.js"></script>
	<script src="drawer/circle.js"></script>-->

	<script>
		window.debugField = document.getElementById('debug');

		let progressBar = document.getElementById('progress');
		let stats = document.getElementById('stats');

		let populationInput = document.getElementById('populationInput');
		let generationsInput = document.getElementById('generationsInput');
		let speedInput = document.getElementById('speedInput');

		function getRandomInt(lower, upper)
		{
		    return Math.floor(lower + (Math.random() * (upper - lower + 1)));
		}
		
		let framework = new Framework();

		framework.addProgressHandler(progress => {
			stats.innerHTML = "Median: " + Math.round(framework.world.median().getFitness()) +
				" | Best: " + Math.round(framework.world.median().getFitness()) + " ";

			progressBar.style.width = progress + "%";
			progressBar.innerHTML = (Math.round(progress * 100) / 100) + "%";
		});

		framework.initialize(populationInput.value, Math.floor(populationInput.value / 3));
		document.getElementById('initialize-button').addEventListener('click', () => {
			framework.initialize(populationInput.value, Math.floor(populationInput.value / 3));
		});

		document.getElementById('start-button').addEventListener('click', () => {
			if(framework.isInitialized()) {
				framework.start(generationsInput.value, speedInput.value);
			}
		});

		renderer = new Renderer(framework);

		renderer.loop();

	</script>
</body>
</html>