var exec = require('child_process').exec;
var expect = require('chai').expect;

describe('CLI tests', ()=> {

	var cwd = `${__dirname}/..`;

	it('should process simple stdin > stdout', done => {
		exec(`echo '{"foo": "Foo!"}' | app.js`, {cwd}, (err, res) => {
			expect(err).to.be.not.ok;
			expect(res).to.be.equal('foo = "Foo!"');
			done();
		});
	});

	it('should process simple files', done => {
		exec(`app.js ${__dirname}/data/simple.json`, {cwd}, (err, res) => {
			expect(err).to.be.not.ok;
			expect(res).to.be.equal('foo = "Foo!"');
			done();
		});
	});

	it('should process a complex file', done => {
		exec(`app.js ${__dirname}/data/complex.json`, {cwd}, (err, res) => {
			expect(err).to.be.not.ok;
			expect(res).to.be.equal('foo = "Foo!"\nbar = []\nbar.0 = 1\nbar.1 = 2\nbar.2 = {}\nbar.2.baz = []\nbar.2.baz.0 = 1\nbar.2.baz.1 = 2\nbar.2.baz.2 = 3\nquz = []\nquz.0 = []\nquz.0.0 = 10\nquz.0.1 = 20\nquz.0.2 = 30\nquz.1 = 40\nflarp = {}\nflarp.boink = "Boink!"');
			done();
		});
	});

});
