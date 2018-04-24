const numbers = require('../matrix-maps/numbers.json');
const color = require('../helpers/color.js');
const _ = require('lodash');
const HEIGHT = 16; // Total vertical LEDs
const WIDTH = 48; // Total horizontal LEDS
const TOTAL = HEIGHT * WIDTH; // Total number of LEDs
const SPEED = 400; // How fast to render each frame
const LED_COLOR = 'purple';

/*-----------------
///////////////////
// Run the clock //
///////////////////
-----------------*/

////////////
// RENDER //
////////////
module.exports.render = (options) => {
	this.options = options;
	this.pixelData = this.options.pixelData
	this.lights = this.options.lights
	this.currentMinute = null;

	this.displayTime();
	// Re-run to see if time changed. If so, update matrix.
	// Could just run the matrix change every minute, but this lets it be more accurate.
	this.continueClock = setInterval(() => {
		this.displayTime();
	}, SPEED);
};


//////////////////
// DISPLAY TIME //
//////////////////
module.exports.displayTime = () => {
	let date = new Date();
	let dateArray = [...date.toTimeString().substr(0,5)];
	let hours = date.getHours();
	let isAfternoon = hours >= 12;

	// If minute hasn't changed, no need to update matrix
	if (this.currentMinute === dateArray[4]) {
		return;
	}

	// Otherwise, update the current minute for the next check
	this.currentMinute = dateArray[4];

	let i=TOTAL;
	while (i--) {
		this.pixelData[i] = 0;
	}

	let hoursDifference = hours - 12;
	if (isAfternoon && hours !== 12) {
		dateArray[0] = hours < 22 ? 0 : 1;
		dateArray[1] = hours < 22 ? hoursDifference : hoursDifference.toString().split('')[1];
	} else if (hours === 0) { // Deal with midnight. There's probably a better way to handle this but... it's midnight and I'm too tired to care.
		dateArray[0] = 1;
		dateArray[1] = 2;
	}

	// If hours only have 1 digit, bump the time over to the left to even out white-space
	let isSingleDigitHour = !['00', 0, 10, 11, 12, 22, 23].includes(hours);
	let singleDigitOffset = -3;
	let startingOffset = isSingleDigitHour ? HEIGHT * singleDigitOffset : HEIGHT;
	// Bump each value over the correct amount of space so they don't override each other
	let offset = startingOffset;

	// Update the matrix
	dateArray.forEach((value) => {
		// Don't show zeros for first hour value
		value = _.isNumber(value) || value === ":" ? value : parseInt(value);
		if (offset !== startingOffset || offset === startingOffset && value !== 0) {
			// Sets each indidvidual LED to the correct matrix location/color
			numbers[value].forEach((num) => {
				this.pixelData[num + offset] = color(LED_COLOR);
			});
		};
		// Colons don't take up as much space
		offsetUpdateValue = value === ":" ? 4 * HEIGHT : 8 * HEIGHT;
		offset = offset + offsetUpdateValue;
	});

	// AM or PM
	let period = isAfternoon ? 'pm' : 'am';
	let periodOffsetValue = 37;
	let periodOffset = isSingleDigitHour ? singleDigitOffset + periodOffsetValue : periodOffsetValue;

	numbers[period].forEach((num) => {
		this.pixelData[num + periodOffset*HEIGHT] = color(LED_COLOR);
	})

	this.lights.render(this.pixelData);
}

////////////////
// Exit Clock //
////////////////
module.exports.exit = () => {
	clearInterval(this.continueClock);
}
