const lights = require('../index.js');
const alternating = require('../lib/index-mapping/alternating-matrix.js');
const color = require('../lib/components/color.js');
const numbers = require('../lib/themes/numbers.json');
const _ = require('lodash');
const	HEIGHT = 16; // Total vertical LEDs
const	WIDTH = 48; // Total horizontal LEDS
const TOTAL = HEIGHT * WIDTH; // Total number of LEDs
const SPEED = 5000; // How fast to render each frame
const BRIGHTNESS = 40; // 1 - 255

const pixelData = new Uint32Array(TOTAL);

lights.init(TOTAL, {
	// Default. Override with lights.setBrightness()
	brightness: BRIGHTNESS
});

// Maps the matrix to go TOP to bottom and left to right
//
// EXAMPLE:
//
// 1|5|9 |13
// 2|6|10|14
// 3|7|11|15
// 4|8|12|16
lights.setIndexMapping(alternating(HEIGHT, WIDTH));

//////////////////
// DISPLAY TIME //
//////////////////

let currentMinute = null;
let ledColor = 'blue';

function displayTime() {
	let date = new Date();
	let dateArray = [...date.toTimeString().substr(0,5)];
	let hours = date.getHours();
	let isAfternoon = hours >= 12;

	// If minute hasn't changed, no need to update matrix
	if (currentMinute === dateArray[4]) {
		return;
	}

	// Otherwise, update the current minute for the next check
	currentMinute = dateArray[4];

	let i=TOTAL;
	while (i--) {
		pixelData[i] = 0;
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
				pixelData[num + offset] = color(ledColor);
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
		pixelData[num + periodOffset*HEIGHT] = color(ledColor);
	})

	lights.render(pixelData);
};


displayTime();
// Re-run to see if time changed. If so, update matrix.
// Could just run the matrix change every minute, but this lets it be more accurate.
setInterval(() => {
	displayTime();
}, SPEED);




/*
*
* EXIT Node process
*
*/

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', () => {
	lights.reset();
	process.nextTick(() => { process.exit(0); });
});

require('node-clean-exit')();


console.log('Press <ctrl>+C to exit.');
