var _ = require('lodash');
var readable = require('@momsfriendlydevco/readable');

/**
* Accept a complex data object and return a dotted notation path + values
* @param {*} data The data to process
* @param {Object} [options] Additional options
* @param {string} [options.want='string'] How to return the output, values are 'array', 'object' and 'string'
* @param {boolean} [options.dotted=true] Use dotted notation rather than JS notation
* @param {string} [options.stubObject="{}"] How to render objects, set to falsy to omit
* @param {string} [options.stubArray="[]"] How to render arrays, set to falsy to omit
* @param {boolean} [options.detectRecursion=true] If recursion is detected, stop processing. Disable this only if you are absolutely sure the input is not circular
* @param {boolean} [options.baseTypes=true] Use only the base JavaScript types 'Object', 'Array', string and number, if disabled the type system lookup gets used instead
* @param {boolean} [options.typeDetail=false] Use full type values, rather than abbreivating them as a digest (If enabled buffers are output as full Base64 rather than just their length)
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

	var seen = new Set();

	var iterator = settings.baseTypes
		? (data, path, literal = false) => {
			if (settings.detectRecursion && _.isObject(data)) {
				if (seen.has(data)) {
					return;
				} else {
					seen.add(data);
				}
			}

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
		}
		: (data, path) => {
			if (settings.detectRecursion && _.isObject(data)) {
				if (seen.has(data)) {
					return;
				} else {
					seen.add(data);
				}
			}

			var nodeType = settings.types.find(typeCheck => typeCheck.detect(data));
			if (!nodeType) return; // Nothing found - skip
			var nodeValue = _.isString(nodeType.value) ? nodeType.value : nodeType.value(data, path, settings);

			// Append this item value
			if (path.length == 0) { // First item
				// Do nothing
			} else if (settings.want == 'string') {
				out += settings.formatString(settings.format(nodeValue, path, settings, true), settings);
			} else if (settings.want == 'object') {
				out[settings.formatPath(path, settings)] = settings.formatData(nodeValue, settings, true);
			} else {
				out.push(settings.format(nodeValue, path, settings, true));
			}

			// Iterate?
			if (nodeType.iterator) {
				nodeType.iterator(data, (item, index) => iterator(item, path.concat(index)));
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
	detectRecursion: true,
	baseTypes: true,
	types: [
		{id: 'array', detect: v => _.isArray(v), value: v => '[]', iterator: (v, cb) => v.forEach(cb)},
		{id: 'date', detect: v => v instanceof Date, value: v => `new Date("${v.toString()}")`},
		{id: 'buffer', detect: v => v instanceof Buffer, value: (v, p, settings) => settings.typeDetail ? `new Buffer("${v.toString('base64')}")` : `new Buffer([${readable.fileSize(v.length)}])`},
		{id: 'function', detect: v => typeof v == 'function', value: '[Function]'},
		{id: 'infinity', detect: v => v === Infinity, value: 'Infinity'},
		{id: '-infinity', detect: v => v === -Infinity, value: '-Infinity'},
		{id: 'nan', detect: v => Number.isNaN(v), value: 'NaN'},
		{id: 'number', detect: v => typeof v === 'number', value: v => v},
		{id: 'regExp', detect: v => v instanceof RegExp, value: v => `new RegExp(${v.source}, ${v.flags})`},
		{id: 'set', detect: v => v instanceof Set, value: 'new Set()', iterator: (v, cb) => Array.from(v).forEach(cb)},
		{id: 'string', detect: v => typeof v === 'string', value: v => `"${v}"`},
		{id: 'undefined', detect: v => v === undefined, value: 'undefined'},

		// Late search items
		{id: 'object', detect: v => _.isObject(v), value: v => '{}', iterator: (v, cb) => _.forEach(v, cb)},
	],
};
