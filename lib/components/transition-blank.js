const HEIGHT = 16; // Total vertical LEDs
const WIDTH = 48; // Total horizontal LEDS
const TOTAL = HEIGHT * WIDTH; // Total number of LEDs


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
	this.blank();
};


/////////////////////////
// Fireplace Animation //
/////////////////////////
module.exports.blank = () => {
	let index = 0;
	while (index < TOTAL) {
		this.pixelData[index] = 0;
		index++;
	}
	this.lights.render(this.pixelData);
}