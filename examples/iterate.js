var ws281x = require('../index.js');

var total = 20, 
    NUM_LEDS = total, 
//    pixelData = new Uint32Array(total);
    pixelData = new Uint32Array({'0': 968499,
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0,
  '6': 0,
  '7': 0,
  '8': 0,
  '9': 0,
  '10': 0,
  '11': 0,
  '12': 0,
  '13': 0,
  '14': 0,
  '15': 0,
  '16': 0,
  '17': 0,
  '18': 0,
  '19': 0 });
ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});


// ---- animation-loop
//var offset = 0;
//setInterval(function () {
//  var i=NUM_LEDS;
// while(i--) {
//      pixelData[i] = 0;
//  }
//  pixelData[offset] = 0x0EC733;
//  offset = (offset + 1) % NUM_LEDS;
//  ws281x.render(pixelData);
//  ws281x.setBrightness(1);
//  console.log(pixelData);
//}, 100);

ws281x.render(pixelData)
ws281x.setBrightness(100);
console.log('Press <ctrl>+C to exit.');
console.log(pixelData);
