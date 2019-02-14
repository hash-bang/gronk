var _ = require('lodash');

/**
* Accept a complex data object and return a dotted notation path + values
* @param {*} data The data to process
* @param {Object} [options] Additional options
* @param {string} [options.want='string'] How to return the output, values are 'array', 'object' and 'string'
* @param {string} [options.stubObject="{}"] How to render objects, set to falsy to omit
* @param {string} [options.stubArray="[]"] How to render arrays, set to falsy to omit
* @param {function} [options.format] Formatting function to use when processing each 'line', only used when want is 'array' or 'string'
* @param {function} [options.formatPath] Formatting function to use to encode the path portion of each item
* @param {function} [options.formatData] Formatting function to use to encode the data portion of each item
* @param {function} [options.formatString] Used when want is 'string' to format a processed string, by default this just adds '\n' to the end
*/
module.exports = function(data, options) {
	var settings = {
		...module.exports.defaults,
		...options,
	};

	var out =
		settings.want == 'string' ? ''
		: settings.want == 'object' ? {}
		: []

	var iterator = (data, path, literal = false) => {
		if (_.isArray(data)) {
			if (path.length && settings.stubArray) iterator(settings.stubArray, path, true);
			data.forEach((item, index) => iterator(item, path.concat(index)));
		} else if (_.isObject(data)) {
			if (path.length && settings.stubObject) iterator(settings.stubObject, path, true);
			_.forEach(data, (item, index) => iterator(item, path.concat(index)));
		} else if (settings.want == 'string') {
			out += settings.formatString(settings.format(data, path, settings, literal), settings);
		} else if (settings.want == 'object') {
			out[settings.formatPath(path, settings)] = settings.formatData(data, settings, literal);
		} else {
			out.push(settings.format(data, path, settings, literal));
		}
	};

	iterator(data, []);

	if (settings.want == 'string') out = settings.formatStringFinal(out, settings);

	return out;
};

module.exports.defaults = {
	want: 'string',
	stubArray: '[]',
	stubObject: '{}',
	dotted: true,
	format: (data, pathBits, settings, literal) => settings.formatPath(pathBits, settings) + ' = ' + settings.formatData(data, settings, literal),
	formatPath: (pathBits, settings) =>
		settings.dotted ? pathBits.join('.')
		: pathBits.map((bit, idx, items) =>
			(idx > 0 && !_.isNumber(bit) ? '.' : '')
			+ (_.isNumber(bit) ? `[${bit}]` : bit)
		).join(''),
	formatData: (data, settings, literal) => literal ? data : _.isString(data) ? '"' + data + '"' : data,
	formatString: (line, settings) => line + '\n',
	formatStringFinal: (data, settings) => data.trimEnd('\n'),
};
