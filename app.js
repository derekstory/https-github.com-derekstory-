const lights = require('./index.js');
const alternating = require('./lib/index-mapping/alternating-matrix.js');
const clock = require('./lib/components/clock.js');
const weather = require('./lib/components/weather.js');
const fireplace = require('./lib/components/fireplace.js');
const _ = require('lodash');
const BRIGHTNESS = 40; // 1 - 255
const HEIGHT = 16; // Total vertical LEDs
const WIDTH = 48; // Total horizontal LEDS
const TOTAL = HEIGHT * WIDTH; // Total number of LEDs
const pixelData = new Uint32Array(TOTAL);
const TIME_PER_COMPONENT = 10000;

lights.init(TOTAL, {
	// Default. Override with lights.setBrightness()
	brightness: BRIGHTNESS,
	dmanum: 10 // Already changed defaults to 10, but just in case. Ya know?
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


//
// Delaying the render lights seems to prevent the Rasp-Pi from getting a surge and freezing
//

let components = {
	0: clock,
	1: weather,
	2: fireplace
}

let current = 0;
componentLoop();

function componentLoop() {
	let total = Object.keys(components).length;
	let prev = current > 0 ? current - 1 : total - 1;
	let next = current === total - 1 ? 0 : current + 1;
	components[prev].exit()
	components[current].render({ lights: lights, pixelData: pixelData });
	setTimeout(() => {
		componentLoop()
	}, TIME_PER_COMPONENT);
	current = next;
};




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
