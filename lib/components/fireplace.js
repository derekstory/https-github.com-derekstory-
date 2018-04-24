const color = require('../helpers/color.js');
const _ = require('lodash');
const HEIGHT = 16; // Total vertical LEDs
const WIDTH = 48; // Total horizontal LEDS
const TOTAL = HEIGHT * WIDTH; // Total number of LEDs
const SPEED = 100; // How fast to render each frame


/*-----------------------
/////////////////////////
// Fireplace Animation //
/////////////////////////
-----------------------*/

////////////
// RENDER //
////////////
module.exports.render = (options) => {
	this.options = options;
	this.pixelData = this.options.pixelData
	this.lights = this.options.lights

	// Re-run to see if time changed. If so, update matrix.
	// Could just run the matrix change every minute, but this lets it be more accurate.
	this.runFireplace = setInterval(() => {
		this.fireplace();
	}, SPEED);
	this.fireplace();
};


/////////////////////////
// Fireplace Animation //
/////////////////////////
module.exports.fireplace = () => {

	let rowIndex = 0;
	while (rowIndex < HEIGHT * WIDTH) {
		let orangeTop = this.getRandomInt(2, 9);
		let orangeBottom = this.getRandomInt(10, 14);
		let yellow = orangeTop - 1;
		let redTop = orangeBottom + 1;
		let redBottom = HEIGHT - 1;
		let resetTop = 0;
		let resetBottom = yellow - 1;

		this.pixelData[yellow + rowIndex] = color('yellow');

		let orangeIndex = orangeTop;
		while (orangeIndex <= orangeBottom) {
			this.pixelData[orangeIndex + rowIndex] = color('orange');
			orangeIndex++;
		}

		let redIndex = redTop;
		while (redIndex <= redBottom) {
			this.pixelData[redIndex + rowIndex] = color('red');
			redIndex++;
		}

		let resetIndex = resetTop;
		while (resetIndex <= resetBottom) {
			this.pixelData[resetIndex + rowIndex] = 0;
			resetIndex++;
		}

		rowIndex = rowIndex + 16;
	}
	this.lights.render(this.pixelData);
}

module.exports.getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

////////////////////
// Exit fireplace //
////////////////////
module.exports.exit = () => {
	clearInterval(this.runFireplace);
}
