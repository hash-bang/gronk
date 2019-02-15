#!/usr/bin/env node

var _ = require('lodash');
var fs = require('fs');
var gronk = require('.');
var program = require('commander');

program
	.version(require('./package.json').version)
	.usage('[file]')
	.option('-t, --complex-types', 'Enable complex type processing rather than built-ins')
	.option('-v, --verbose', 'Be verbose')
	.option('--no-circular', 'Disable circular object checking, speed increase but dangerous')
	.option('--no-color', 'Disable colors')
	.option('--no-dotted', 'Disable dotted notation and use JS notation instead')
	.option('--no-stub', 'Disable stubbing (imples --no-stub-objects + --no-stub-arrays)')
	.option('--no-stub-objects', 'Disable object stubbing')
	.option('--no-stub-arrays', 'Disable array stubbing')
	.parse(process.argv);

Promise.resolve()
	// Option processing {{{
	.then(()=> {
		if (!program.stub) program.stubObjects = program.subArrays = false;
	})
	// }}}
	// Comupte options {{{
	.then(()=> ({
		want: 'string',
		dotted: program.dotted,
		stubObject: program.stubObjects ? '{}' : false,
		stubArray: program.stubArrays ? '[]' : false,
		detectRecursion: program.circular,
		baseTypes: !program.complexTypes,
	}))
	// }}}
	// Output options if (--verbose) {{{
	.then(options => {
		if (program.verbose) process.stderr.write(`Running with ${JSON.stringify(options)}\n`);
		return {options};
	})
	// }}}
	// Slurp input {{{
	.then(session => new Promise((resolve, reject) => {
		if (program.args.length) {
			fs.readFile(program.args[0], 'utf-8', (err, res) => {
				if (err) return reject(err);
				resolve({...session, data: res});
			})
		} else if (!process.stdin.isTTY) { // Slurp from STDIN
			var buf = '';
			process.stdin.on('data', data => buf += data.toString());
			process.stdin.on('close', ()=> resolve({...session, data: buf}));
		} else {
			throw 'No input file or STDIN input';
		}
	}))
	// }}}
	// Parse text into JSON {{{
	.then(session => {
		session.data = JSON.parse(session.data);
		return session;
	})
	// }}}
	// Run Gronk {{{
	.then(session => {
		process.stdout.write(gronk(session.data, session.options));
	})
	// }}}
	// End {{{
	.catch(e => {
		console.log(e.toString());
		process.exit(1);
	})
	// }}}
