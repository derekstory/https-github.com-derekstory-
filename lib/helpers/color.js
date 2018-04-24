var _ = require('lodash')
var COLORS = require('./colors.json')

/**
 * Returns the hex code for the color passed in prepended
 * with the required LED converter requirement.
 *
 * exampe: color('red');
 */

module.exports = (color) => {
	var hexCode = !_.isUndefined(COLORS[color]) ? COLORS[color] : COLORS['transparent']
	return '0x' + hexCode
};