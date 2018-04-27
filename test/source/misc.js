/* global source, describe, it, expect */

var polymorphic = source('polymorphic');

function Foo() {
	this.time = Date.now();
}

describe('Unknown signatures', function () {

	it('no signatures prepared', function (done) {
		var misc = polymorphic(),
			tmp;

		expect(function () {
			misc(1);
		}).to.throw('polymorph: signature not found "int|number"');

		expect(function () {
			misc('a');
		}).to.throw('polymorph: signature not found "string"');

		expect(function () {
			misc(true);
		}).to.throw('polymorph: signature not found "boolean|bool"');

		expect(function () {
			misc([1, 3, 5]);
		}).to.throw('polymorph: signature not found "Array|array"');

		expect(function () {
			misc({ a: 1, b: 2, c: 4 });
		}).to.throw('polymorph: signature not found "Object|object"');

		tmp = new Foo();
		expect(function () {
			misc(tmp);
		}).to.throw('polymorph: signature not found "Foo|object"');

		done();
	});

	it('too many arguments', function (done) {
		var misc = polymorphic();

		misc.signature('string', function (s) {
			return s;
		});

		expect(misc('a')).to.equal('a');
		expect(function () {
			misc('a', 'b');
		}).to.throw('polymorph: signature not found "string, string"');

		misc.signature('string, string', function (s1, s2) {
			return s1 + s2;
		});

		expect(function () {
			misc('a', 'b');
		}).to.not.throw();
		expect(misc('a', 'b')).to.equal('ab');

		done();
	});

	it('null is not treated as an object', function (done) {
		var misc = polymorphic();

		misc.signature('number num=1, object', function () {
			return 'number object';
		});

		expect(misc(1, {})).to.equal('number object');
		expect(function () {
			misc(1, null);
		}).to.throw('polymorph: signature not found "int|number, null"');

		misc.signature('number num=1, null', function () {
			return 'number null';
		});

		expect(misc(1, null)).to.equal('number null');

		done();
	});

	it('deal with defaults for undefined values', function (done) {
		var misc = polymorphic();

		expect(function () {
			misc(undefined);
		}).to.throw('polymorph: signature not found "undefined|[a-z]+"');

		misc.signature('undefined x=foo', function (x) {
			return x;
		});

		expect(misc(undefined)).equal('foo');

		done();
	});

	it('erratic signature assignment', function (done) {
		var misc = polymorphic();

		expect(function () {
			misc.signature('string');
		}).to.throw('polymorphic.signature: expected final argument to be a callback');

		expect(function () {
			misc.signature('number num=3');
		}).to.throw('polymorphic.signature: expected final argument to be a callback');

		expect(function () {
			misc.signature();
		}).to.throw('polymorphic.signature: expected one or more signatures');

		expect(function () {
			misc.signature(function () { });
		}).to.throw('polymorphic.signature: expected one or more signatures');

		done();
	});
});
