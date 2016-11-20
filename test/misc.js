'use strict';

var Code = require('code'),
	Lab = require('lab'),
	polymorphic = require('../lib/polymorphic'),
	lab = exports.lab = Lab.script();

function Foo() {
	this.time = Date.now();
}

lab.experiment('Unknown signatures', function() {

	lab.test('no signatures prepared', function(done) {
		var misc = polymorphic(),
			tmp;

		Code.expect(function() {
			misc(1);
		}).to.throw('polymorph: signature not found "int|number"');

		Code.expect(function() {
			misc('a');
		}).to.throw('polymorph: signature not found "string"');

		Code.expect(function() {
			misc(true);
		}).to.throw('polymorph: signature not found "boolean|bool"');

		Code.expect(function() {
			misc([1, 3, 5]);
		}).to.throw('polymorph: signature not found "Array|array"');

		Code.expect(function() {
			misc({a:1, b:2, c:4});
		}).to.throw('polymorph: signature not found "Object|object"');

		tmp = new Foo();
		Code.expect(function() {
			misc(tmp);
		}).to.throw('polymorph: signature not found "Foo|object"');

		done();
	});

	lab.test('too many arguments', function(done) {
		var misc = polymorphic();

		misc.signature('string', function(s) {
			return s;
		});

		Code.expect(misc('a')).to.equal('a');
		Code.expect(function() {
			misc('a', 'b');
		}).to.throw('polymorph: signature not found "string, string"');

		misc.signature('string, string', function(s1, s2) {
			return s1 + s2;
		});

		Code.expect(function() {
			misc('a', 'b');
		}).to.not.throw();
		Code.expect(misc('a', 'b')).to.equal('ab');

		done();
	});

	lab.test('null is not treated as an object', function(done) {
		var misc = polymorphic();

		misc.signature('number num=1, object', function(num, obj) {
			return 'number object';
		});

		Code.expect(misc(1, {})).to.equal('number object');
		Code.expect(function() {
			misc(1, null);
		}).to.throw('polymorph: signature not found "int|number, null"');

		misc.signature('number num=1, null', function(num, obj) {
			return 'number null';
		});

		Code.expect(misc(1, null)).to.equal('number null');

		done();
	});

	lab.test('deal with defaults for undefined values', function(done) {
		var misc = polymorphic();

		Code.expect(function() {
			misc(undefined);
		}).to.throw('polymorph: signature not found "undefined|[a-z]+"');

		misc.signature('undefined x=foo', function(x) {
			return x;
		});

		Code.expect(misc(undefined)).equal('foo');

		done();
	});

	lab.test('erratic signature assignment', function(done) {
		var misc = polymorphic();

		Code.expect(function() {
			misc.signature('string');
		}).to.throw('polymorphic.signature: expected final argument to be a callback');

		Code.expect(function() {
			misc.signature('number num=3');
		}).to.throw('polymorphic.signature: expected final argument to be a callback');

		Code.expect(function() {
			misc.signature();
		}).to.throw('polymorphic.signature: expected one or more signatures');

		Code.expect(function() {
			misc.signature(function() {});
		}).to.throw('polymorphic.signature: expected one or more signatures');

		done();
	});

	lab.test('preserve `this`-contexts', function(done) {
		var misc = polymorphic();

		misc.signature('bool', function(bool) {
			return this;
		});

		Code.expect(misc(true)).to.equal(undefined);
		Code.expect(misc.call('test 1', true)).to.equal('test 1');
		Code.expect(misc.apply('test 2', [true])).to.equal('test 2');

		done();
	});
});
