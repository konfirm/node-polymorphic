/* global source, describe, it, expect */
'use strict';

var util = require('util'),
	polymorphic = source('polymorphic');

function Foo() {
	this.name = 'Foo';
	this.time = Date.now();
}

Foo.prototype.hello = function () {
	return 'a ' + this.name;
};

function Bar() {
	Bar.super_.apply(this, arguments);

	this.name = 'Bar';
	this.date = new Date();
}

util.inherits(Bar, Foo);

describe('Complex types', function () {
	it('a Foo walks into a Bar (and other objects)', function (done) {
		var complex = polymorphic();

		complex.signature('Foo, Foo', function () {
			return 'foo foo';
		});

		complex.signature('Foo, Bar', function () {
			return 'foo bar';
		});

		complex.signature('Bar, Foo', function () {
			return 'bar foo';
		});

		complex.signature('Bar, Bar', function () {
			return 'bar bar';
		});

		complex.signature('object, Bar', function () {
			return 'object bar';
		});

		complex.signature('object, Foo', function () {
			return 'object foo';
		});

		complex.signature('object, object', function () {
			return 'object object';
		});

		expect(complex({}, {})).to.equal('object object');
		expect(complex(new Foo(), new Foo())).to.equal('foo foo');
		expect(complex(new Bar(), new Foo())).to.equal('bar foo');
		expect(complex(new Bar(), new Bar())).to.equal('bar bar');
		expect(complex(new Foo(), new Bar())).to.equal('foo bar');
		expect(complex({}, new Bar())).to.equal('object bar');
		expect(complex({}, new Foo())).to.equal('object foo');

		//  while no explicitly typed signature exists, these still match the less strict 'object, object' signature
		expect(complex(new Foo(), {})).to.equal('object object');
		expect(complex(new Bar(), {})).to.equal('object object');

		expect(function () {
			complex(new Foo());
		}).to.throw('polymorph: signature not found "Foo|object"');

		expect(function () {
			complex(new Bar());
		}).to.throw('polymorph: signature not found "Bar|object"');

		expect(function () {
			complex({});
		}).to.throw('polymorph: signature not found "Object|object"');

		done();
	});

	describe('Inheritance', function () {
		it('Bar extends Foo, matches Foo', function (done) {
			var complex = polymorphic();

			complex.signature('Foo', function (foo) {
				return 'Foo-lish: ' + foo.hello();
			});

			expect(complex(new Foo())).to.equal('Foo-lish: a Foo');
			expect(complex(new Bar())).to.equal('Foo-lish: a Bar');

			done();
		});

		it('Bar extends Foo, does not match Foo!', function (done) {
			var complex = polymorphic();

			complex.signature('Foo!', function (foo) {
				return 'Foo-lish: ' + foo.hello();
			});

			expect(complex(new Foo())).to.equal('Foo-lish: a Foo');
			expect(function () {
				complex(new Bar());
			}).to.throw('polymorph: signature not found "Bar|object"');

			done();
		});

		it('Bar extends Foo, does match Foo but prefers Bar', function (done) {
			var complexA = polymorphic(),
				complexB = polymorphic();

			function foolish(foo) {
				return 'Foo-lish: ' + foo.hello();
			}

			function barish(bar) {
				return 'Bar-ish: ' + bar.hello();
			}

			complexA.signature('Foo', foolish);
			complexA.signature('Bar', barish);
			complexB.signature('Bar', barish);
			complexB.signature('Foo', foolish);

			//  regardless of signature order, should be the same
			expect(complexA(new Foo())).to.equal('Foo-lish: a Foo');
			expect(complexA(new Bar())).to.equal('Bar-ish: a Bar');

			expect(complexB(new Foo())).to.equal('Foo-lish: a Foo');
			expect(complexB(new Bar())).to.equal('Bar-ish: a Bar');

			done();
		});

		it('Foo likes Foo, but prefers Foo!', function (done) {
			var complex = polymorphic();

			complex.signature('Foo', function (foo) {
				return 'Foo-lish: ' + foo.hello();
			});

			complex.signature('Foo!', function (foo) {
				return 'Foo: ' + foo.hello();
			});

			//  regardless of signature order, should be the same
			expect(complex(new Foo())).to.equal('Foo: a Foo');
			expect(complex(new Bar())).to.equal('Foo-lish: a Bar');

			done();
		});

		it('Array does not match "object"', function (done) {
			var complex = polymorphic();

			complex.signature('object', function (noArray) {
				return !(noArray instanceof Array);
			});

			expect(complex({})).to.equal(true);
			expect(function () {
				complex([]);
			}).to.throw('polymorph: signature not found "Array|array"');

			done();
		});

		it('Array does match "Object"', function (done) {
			var complex = polymorphic();

			complex.signature('Object', function (noArray) {
				return !(noArray instanceof Array);
			});

			expect(complex({})).to.equal(true);
			expect(complex([])).to.equal(false);

			done();
		});
	});

});
