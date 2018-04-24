const private = require('../../private.json')
const weatherMap = require('../matrix-maps/weather.json');
const color = require('../helpers/color.js');
const _ = require('lodash');
const ajax = require('ajax-request');
const HEIGHT = 16; // Total vertical LEDs
const WIDTH = 48; // Total horizontal LEDS
const TOTAL = HEIGHT * WIDTH; // Total number of LEDs
const SPEED = 400; // How fast to render each frame
const ZIPCODE = `?zip=${private.weather.zipcode}`;
const LOCATION = ',us&';
const FAHRENHEIT = 'units=imperial';
const API_KEY = `&APPID=${private.weather.key}`;


/*---------------------------
/////////////////////////////
// Run the Weather Display //
/////////////////////////////
---------------------------*/



////////////
// RENDER //
////////////
module.exports.render = (options) => {
	this.options= options;
	this.pixelData = this.options.pixelData;
	this.lights = this.options.lights
	// this.currentWeather();
	this.forecast()
};



/////////////////////
// CURRENT WEATHER //
/////////////////////
module.exports.currentWeather = () => {
	let url = 'http://api.openweathermap.org/data/2.5/weather';
	this.request = new ajax(`${url}${ZIPCODE}${LOCATION}${FAHRENHEIT}${API_KEY}`, (err, res, body) => {
		// Cancel if error
		if (err) {
			this.exit();
		};

		let weather = JSON.parse(body);
		console.log(weather.main.temp);
		console.log(weather);
		weatherMap.sunny.forEach((num, i) => {
			this.pixelData[num[0]] = color(num[1]);
		});
		this.lights.render(this.pixelData);
	});
};



///////////////////////////
// 5 DAY (Afternoon) FORECAST //
///////////////////////////
module.exports.forecast = () => {



	//
	// API Call
	//
	let url = 'http://api.openweathermap.org/data/2.5/forecast';
	this.request = new ajax(`${url}${ZIPCODE}${LOCATION}${FAHRENHEIT}${API_KEY}`, (err, res, body) => {

		let forecastMatrix = [];

		//
		// Cancel if error
		//
		if (err) {
			this.exit();
		};

		//
		// Get the weather date
		//
		let fullForecast = JSON.parse(body);
		// Only include first three days (data for 5 shows up)
		let threeDayAfternoonForecast = fullForecast.list.filter((o) => (o.dt_txt.includes('18:00:00')));
		let days = [];
		threeDayAfternoonForecast.forEach((day, index) => {
			// Only add the first 3 days
			if (index < 3) {
				days.push({
					temperature: Math.trunc(day.main.temp),
					// https://openweathermap.org/forecast5#list (main category titles)
					conditions: day.weather[0].main
				});
			};
		});

		//
		// Set the pixels for the temperatures
		//
		let dayCount = 0;
		let digitCount = 0;
		let temperatureOffset = {
			1: 0,
			2: 6,
			3: 16,
			4: 22,
			5: 32,
			6: 38
		}
		days.forEach((data, index) => {
			dayCount++;
			let digits = data.temperature.toString().split('');

			digits.forEach((digit, digitIndex) => {
				digitCount++;
				let offset = temperatureOffset[digitCount] * HEIGHT;

				weatherMap.numbers[digit].forEach((num, i) => {
					let pixelOffset = num + offset;
					forecastMatrix.push({
						pixelData: pixelOffset,
						color: 'white'
					})
				});
			});


			//
			// Add bar to right of first two days
			//
			let barOffset = {
				1: dayCount * HEIGHT * (45/3),
				2: dayCount * HEIGHT * (45/3) + HEIGHT
			}
			if (dayCount < 3) {
				let barPixel = 0;
				while (barPixel < HEIGHT) {
					let location = barOffset[dayCount] + barPixel;
					forecastMatrix.push({
						pixelData: location,
						color: 'white'
					})
					barPixel++;
				}
			}
		})


		//
		// Add Day of week under temperatures
		//
		let date = new Date();
		let weekday = {
			0: "sunday",
			1: "monday",
			2: "tuesday",
			3: "wednesday",
			4: "thursday",
			5: "friday",
			6: "saturday",
			7: "sunday",
			8: "monday"
		}
		let dayOffset = {
			1: 0,
			2: WIDTH/3,
			3: WIDTH/3 * 2
		}

		_.forEach([1, 2, 3], (num) => {
			let day = weekday[date.getDay() + num];
			weatherMap.days[day].forEach((pixel)=> {
				let location = pixel + (dayOffset[num] * HEIGHT);
				forecastMatrix.push({
					pixelData: location,
					color: 'white'
				});
			});
		});

		//
		// All pixel data has been stored in forecastMatrix so
		// we can easily manipulate it
		//
		let completeMatrix = []
		let matrixPixel = 0;
		while (matrixPixel < WIDTH * HEIGHT) {
			let pixelIndex = forecastMatrix.findIndex(item => item.pixelData === matrixPixel);
			if (pixelIndex >= 0) {
				completeMatrix.push({
					color: forecastMatrix[pixelIndex].color
				})
			} else {
				completeMatrix.push({
					color: 'blue'
				})
			}
			matrixPixel++;
		};

		this.transitionForecast(completeMatrix);
	});
};




///////////////////////////////////////
// Slide in forecast days one by one //
///////////////////////////////////////
module.exports.transitionForecast = (matrix) => {
	this.dayOneTransition = setInterval(() => {
		let dayMatrixes =  {
			dayOne: matrix.slice(0, HEIGHT*(WIDTH/3)),
			dayTwo: matrix.slice(HEIGHT*(WIDTH/3), HEIGHT*(WIDTH/3)*2),
			dayThree: matrix.slice(HEIGHT*(WIDTH/3)*2, HEIGHT*WIDTH)
		}
		this.dayOne(dayMatrixes)
	}, 10);
	this.dayOffset = HEIGHT*WIDTH;
	this.dayTwoOffset = HEIGHT*WIDTH;
	this.dayThreeOffset = HEIGHT*WIDTH;
	this.currentDay = 1;
};


//
// Day One Transition
//
module.exports.dayOne = (matrixes) => {
	let dayOne = matrixes.dayOne;
	let dayTwo = matrixes.dayTwo;
	let dayThree = matrixes.dayThree;
	let newDay = false;

	if (this.currentDay === 1) {


		// Day One
		dayOne.forEach((pixel, index) => {

			if (index <= dayOne.length) {
				this.pixelData[index + this.dayOffset + HEIGHT] = 0; // Remove the trailing lights that shouldn't be lit
				this.pixelData[index + this.dayOffset] = color(pixel.color);
			}

			if (this.dayOffset === 0) {
				this.currentDay = 2;
				newDay = true;
			};

		});
	}



	// DAY TWO
	if (this.currentDay === 2) {

		dayOne.forEach((pixel, index) => {
			this.pixelData[index] = color(pixel.color)
		})

		dayTwo.forEach((pixel, index) => {

			if (index <= dayTwo.length) {
				this.pixelData[index + this.dayOffset + HEIGHT] = 0; // Remove the trailing lights that shouldn't be lit
				this.pixelData[index + this.dayOffset] = color(pixel.color);
			}

			if (this.dayOffset === HEIGHT*(WIDTH/3)) {
				this.currentDay = 3;
				newDay = true;
			};

		});
	}


	// Day 3
	if (this.currentDay === 3) {

		dayOne.forEach((pixel, index) => {
			this.pixelData[index] = color(pixel.color)
		});

		dayTwo.forEach((pixel, index) => {
			this.pixelData[index + (HEIGHT*(WIDTH/3))] = color(pixel.color)
		});

		dayThree.forEach((pixel, index) => {

			if (index <= dayThree.length) {
				this.pixelData[index + this.dayOffset + HEIGHT] = 0; // Remove the trailing lights that shouldn't be lit
				this.pixelData[index + this.dayOffset] = color(pixel.color);
			}

			if (this.dayOffset === HEIGHT*((WIDTH/3)*2) - HEIGHT) {
				this.currentDay = 4;
				newDay = true;
				return;
			};

		});
	}

	if (this.currentDay === 4) {
		clearInterval(this.dayOneTransition);
		return;
	}

	if (!newDay) {
		this.dayOffset = this.dayOffset - HEIGHT;
	} else {
		this.dayOffset = HEIGHT*WIDTH;
	}

	this.renderLights();

};



///////////////////////
// Render the lights //
//////////////////////
module.exports.renderLights = () => {
	this.lights.render(this.pixelData);
	delete this.request;
};



//////////////////
// Exit Weather //
//////////////////
module.exports.exit = () => {
	delete this.request;
};
