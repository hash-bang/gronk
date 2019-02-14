var expect = require('chai').expect;
var gronk = require('..');

describe('Simple tests', ()=> {

	it('should collapse simple objects', ()=> {
		expect(gronk({foo: 'Foo!', bar: 'Bar!'})).to.equal('foo = "Foo!"\nbar = "Bar!"');
		expect(gronk({foo: {bar: 'Bar!'}})).to.equal('foo = {}\nfoo.bar = "Bar!"');
		expect(gronk({foo: {bar: {baz: 'Baz!'}}})).to.equal('foo = {}\nfoo.bar = {}\nfoo.bar.baz = "Baz!"');
		expect(gronk({foo: {bar: {baz: [1, 2, {quz: 'Quz!'}]}}}, {dotted: true})).to.equal('foo = {}\nfoo.bar = {}\nfoo.bar.baz = []\nfoo.bar.baz.0 = 1\nfoo.bar.baz.1 = 2\nfoo.bar.baz.2 = {}\nfoo.bar.baz.2.quz = "Quz!"');
	});

	it('should support non-dotted notation', ()=> {
		expect(gronk({foo: [1, {bar: 'Bar!'}, {baz: 'Baz!'}]}, {dotted: false})).to.equal('foo = []\nfoo[0] = 1\nfoo[1] = {}\nfoo[1].bar = "Bar!"\nfoo[2] = {}\nfoo[2].baz = "Baz!"');
		expect(gronk({foo: {bar: {baz: [1, 2, {quz: 'Quz!'}]}}}, {dotted: false})).to.equal('foo = {}\nfoo.bar = {}\nfoo.bar.baz = []\nfoo.bar.baz[0] = 1\nfoo.bar.baz[1] = 2\nfoo.bar.baz[2] = {}\nfoo.bar.baz[2].quz = "Quz!"');
	});
});

describe('Complex object tests', ()=> {

	it('should handle builtin types', ()=> {
		expect(gronk({foo: new Set([1, 2, 3])}, {baseTypes: false})).to.equal('foo = new Set()\nfoo.0 = 1\nfoo.1 = 2\nfoo.2 = 3');
	});

});
