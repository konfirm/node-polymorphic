'use strict';

var Code = require('code'),
	Lab = require('lab'),
	polymorphic = require('../lib/polymorphic'),
	lab = exports.lab = Lab.script();

function slapper(arg) {
	return function() {
		return arg;
	};
}

lab.experiment('Multiple default arguments', function() {

	lab.experiment('First come, first serve', function() {
		//  PREPARATION
		var defaultA = polymorphic(),
			defaultB = polymorphic();

		function mapper() {
			var chars = 'abcdefgh',
				arg = Array.prototype.slice.call(arguments);

			return arg.map(function(n, i) {
				return chars[i] + n;
			}).join(',');
		}

		//  Add the same signatures to both defaultA and defaultB but in a different order
		defaultA.signature('number a=1, number b=2, number c=3', mapper);
		defaultA.signature('string a=A, number b=2, number c=3', mapper);
		defaultA.signature('string a=A, string b=B, number c=3', mapper);
		defaultA.signature('string a=A, string b=B, string c=C', mapper);

		defaultB.signature('string a=A, string b=B, string c=C', mapper);
		defaultB.signature('string a=A, string b=B, number c=3', mapper);
		defaultB.signature('string a=A, number b=2, number c=3', mapper);
		defaultB.signature('number a=1, number b=2, number c=3', mapper);

		//  EXECUTION

		lab.test('All defaults', function(done) {
			//  no arguments, matches all configured, returns the first one configured
			Code.expect(defaultA()).to.equal('a1,b2,c3');
			Code.expect(defaultB()).to.equal('aA,bB,cC');

			done();
		});

		lab.test('One given', function(done) {
			//  one argument, matches all who match first type, returns the first one configured
			Code.expect(defaultA(8)).to.equal('a8,b2,c3');
			Code.expect(defaultB(8)).to.equal('a8,b2,c3');

			Code.expect(defaultA('Q')).to.equal('aQ,b2,c3');
			Code.expect(defaultB('Q')).to.equal('aQ,bB,cC');

			done();
		});

		lab.test('Two given', function(done) {
			//  two arguments, matches all whose types match, returns the first one configured
			Code.expect(defaultA(8, 9)).to.equal('a8,b9,c3');
			Code.expect(defaultB(8, 9)).to.equal('a8,b9,c3');

			Code.expect(defaultA('Q', 9)).to.equal('aQ,b9,c3');
			Code.expect(defaultB('Q', 9)).to.equal('aQ,b9,c3');

			Code.expect(function() {
				defaultA(8, 'Z');
			}).to.throw('polymorph: signature not found "int|number, string"');
			Code.expect(function() {
				defaultB(8, 'Z');
			}).to.throw('polymorph: signature not found "int|number, string"');

			Code.expect(defaultA('Q', 'Z')).to.equal('aQ,bZ,c3');
			Code.expect(defaultB('Q', 'Z')).to.equal('aQ,bZ,cC');

			done();
		});

		lab.test('Three given', function(done) {
			//  three arguments, matches all whose types match, returns the first one configured
			Code.expect(defaultA(8, 9, 10)).to.equal('a8,b9,c10');
			Code.expect(defaultB(8, 9, 10)).to.equal('a8,b9,c10');

			Code.expect(defaultA('Q', 9, 10)).to.equal('aQ,b9,c10');
			Code.expect(defaultB('Q', 9, 10)).to.equal('aQ,b9,c10');

			Code.expect(defaultA('Q', 'Z', 10)).to.equal('aQ,bZ,c10');
			Code.expect(defaultB('Q', 'Z', 10)).to.equal('aQ,bZ,c10');

			Code.expect(defaultA('Q', 'Z', 'Y')).to.equal('aQ,bZ,cY');
			Code.expect(defaultB('Q', 'Z', 'Y')).to.equal('aQ,bZ,cY');

			done();
		});

		lab.test('Too many given', function(done) {
			//  three arguments, matches all whose types match, returns the first one configured
			Code.expect(function() {
				defaultA(8, 9, 10, 11);
			}).to.throw('polymorph: signature not found "int|number, int|number, int|number, int|number"');
			Code.expect(function() {
				defaultB(8, 9, 10, 11);
			}).to.throw('polymorph: signature not found "int|number, int|number, int|number, int|number"');

			Code.expect(function() {
				defaultA('Q', 9, 10, 11);
			}).to.throw('polymorph: signature not found "string, int|number, int|number, int|number"');
			Code.expect(function() {
				defaultB('Q', 9, 10, 11);
			}).to.throw('polymorph: signature not found "string, int|number, int|number, int|number"');

			Code.expect(function() {
				defaultA('Q', 'Z', 10, 11);
			}).to.throw('polymorph: signature not found "string, string, int|number, int|number"');
			Code.expect(function() {
				defaultB('Q', 'Z', 10, 11);
			}).to.throw('polymorph: signature not found "string, string, int|number, int|number"');

			Code.expect(function() {
				defaultA('Q', 'Z', 'Y', 'X');
			}).to.throw('polymorph: signature not found "string, string, string, string"');
			Code.expect(function() {
				defaultB('Q', 'Z', 'Y', 'X');
			}).to.throw('polymorph: signature not found "string, string, string, string"');

			done();
		});
	});

	lab.experiment('Choose wisely', function(done) {
		//  PREPARATION
		var picky = polymorphic();

		function Foo() {
			this.name = 'foo';
		}

		picky.signature(
			'int, int q=1',
			function(a, b) {
				return 'int#' + b;
			}

		);

		picky.signature(
			'float, float q=2.1',
			function(a, b) {
				return 'float#' + b;
			}

		);

		picky.signature(
			'string, number q=3',
			function(a, b) {
				return 'string#' + b;
			}

		);

		picky.signature(
			'object, number q=4',
			function(a, b) {
				return 'object#' + b;
			}

		);

		picky.signature(
			'array, number q=5',
			function(a, b) {
				return 'array#' + b;
			}

		);

		picky.signature(
			'Foo, number q=6',
			function(a, b) {
				return 'Foo#' + b;
			}

		);

		picky.signature(
			'bool, bool q=true',
			function(a, b) {
				return 'bool#' + (b ? 'true' : 'false');
			}

		);

		picky.signature(
			'bool, bool, bool q=1',
			function(a, b, c) {
				return 'boolbool#' + (c ? 'true' : 'false');
			}

		);

		//  EXECUTION
		lab.test('proper defaults', function(done) {
			Code.expect(picky(100)).to.equal('int#1');
			Code.expect(picky(Math.PI)).to.equal('float#2.1');
			Code.expect(picky('Foo')).to.equal('string#3');
			Code.expect(picky({name:'foo'})).to.equal('object#4');
			Code.expect(picky(['foo'])).to.equal('array#5');
			Code.expect(picky(new Foo())).to.equal('Foo#6');
			Code.expect(picky(true)).to.equal('bool#true');
			//  matches 'bool, bool=true' rather than 'bool, bool, bool q=1'
			Code.expect(picky(true, true)).to.equal('bool#true');
			Code.expect(picky(true, false)).to.equal('bool#false');

			Code.expect(picky(true, false, undefined)).to.equal('boolbool#true');

			done();
		});

		lab.test('understand when to ignore defaults', function(done) {
			Code.expect(picky(100, 10)).to.equal('int#10');
			Code.expect(picky(Math.PI, 11.1)).to.equal('float#11.1');
			Code.expect(picky('Foo', 12)).to.equal('string#12');
			Code.expect(picky({name:'foo'}, 13)).to.equal('object#13');
			Code.expect(picky(['foo'], 14)).to.equal('array#14');
			Code.expect(picky(new Foo(), 15)).to.equal('Foo#15');

			Code.expect(picky(true, false)).to.equal('bool#false');
			Code.expect(picky(true, true)).to.equal('bool#true');
			Code.expect(picky(true, true, false)).to.equal('boolbool#false');
			Code.expect(picky(true, true, true)).to.equal('boolbool#true');

			done();
		});
	});
});
