/* global source, describe, it, expect */

var polymorphic = source('polymorphic');


describe('Multiple default arguments', function () {

	describe('First come, first serve', function () {
		//  PREPARATION
		var defaultA = polymorphic(),
			defaultB = polymorphic();

		function mapper() {
			var chars = 'abcdefgh',
				arg = Array.prototype.slice.call(arguments);

			return arg.map(function (n, i) {
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

		it('All defaults', function (done) {
			//  no arguments, matches all configured, returns the first one configured
			expect(defaultA()).to.equal('a1,b2,c3');
			expect(defaultB()).to.equal('aA,bB,cC');

			done();
		});

		it('One given', function (done) {
			//  one argument, matches all who match first type, returns the first one configured
			expect(defaultA(8)).to.equal('a8,b2,c3');
			expect(defaultB(8)).to.equal('a8,b2,c3');

			expect(defaultA('Q')).to.equal('aQ,b2,c3');
			expect(defaultB('Q')).to.equal('aQ,bB,cC');

			done();
		});

		it('Two given', function (done) {
			//  two arguments, matches all whose types match, returns the first one configured
			expect(defaultA(8, 9)).to.equal('a8,b9,c3');
			expect(defaultB(8, 9)).to.equal('a8,b9,c3');

			expect(defaultA('Q', 9)).to.equal('aQ,b9,c3');
			expect(defaultB('Q', 9)).to.equal('aQ,b9,c3');

			expect(function () {
				defaultA(8, 'Z');
			}).to.throw('polymorph: signature not found "int|number, string"');
			expect(function () {
				defaultB(8, 'Z');
			}).to.throw('polymorph: signature not found "int|number, string"');

			expect(defaultA('Q', 'Z')).to.equal('aQ,bZ,c3');
			expect(defaultB('Q', 'Z')).to.equal('aQ,bZ,cC');

			done();
		});

		it('Three given', function (done) {
			//  three arguments, matches all whose types match, returns the first one configured
			expect(defaultA(8, 9, 10)).to.equal('a8,b9,c10');
			expect(defaultB(8, 9, 10)).to.equal('a8,b9,c10');

			expect(defaultA('Q', 9, 10)).to.equal('aQ,b9,c10');
			expect(defaultB('Q', 9, 10)).to.equal('aQ,b9,c10');

			expect(defaultA('Q', 'Z', 10)).to.equal('aQ,bZ,c10');
			expect(defaultB('Q', 'Z', 10)).to.equal('aQ,bZ,c10');

			expect(defaultA('Q', 'Z', 'Y')).to.equal('aQ,bZ,cY');
			expect(defaultB('Q', 'Z', 'Y')).to.equal('aQ,bZ,cY');

			done();
		});

		it('Too many given', function (done) {
			//  three arguments, matches all whose types match, returns the first one configured
			expect(function () {
				defaultA(8, 9, 10, 11);
			}).to.throw('polymorph: signature not found "int|number, int|number, int|number, int|number"');
			expect(function () {
				defaultB(8, 9, 10, 11);
			}).to.throw('polymorph: signature not found "int|number, int|number, int|number, int|number"');

			expect(function () {
				defaultA('Q', 9, 10, 11);
			}).to.throw('polymorph: signature not found "string, int|number, int|number, int|number"');
			expect(function () {
				defaultB('Q', 9, 10, 11);
			}).to.throw('polymorph: signature not found "string, int|number, int|number, int|number"');

			expect(function () {
				defaultA('Q', 'Z', 10, 11);
			}).to.throw('polymorph: signature not found "string, string, int|number, int|number"');
			expect(function () {
				defaultB('Q', 'Z', 10, 11);
			}).to.throw('polymorph: signature not found "string, string, int|number, int|number"');

			expect(function () {
				defaultA('Q', 'Z', 'Y', 'X');
			}).to.throw('polymorph: signature not found "string, string, string, string"');
			expect(function () {
				defaultB('Q', 'Z', 'Y', 'X');
			}).to.throw('polymorph: signature not found "string, string, string, string"');

			done();
		});
	});

	describe('Choose wisely', function () {
		//  PREPARATION
		var picky = polymorphic();

		function Foo() {
			this.name = 'foo';
		}

		picky.signature(
			'int, int q=1',
			function (a, b) {
				return 'int#' + b;
			}

		);

		picky.signature(
			'float, float q=2.1',
			function (a, b) {
				return 'float#' + b;
			}

		);

		picky.signature(
			'string, number q=3',
			function (a, b) {
				return 'string#' + b;
			}

		);

		picky.signature(
			'object, number q=4',
			function (a, b) {
				return 'object#' + b;
			}

		);

		picky.signature(
			'array, number q=5',
			function (a, b) {
				return 'array#' + b;
			}

		);

		picky.signature(
			'Foo, number q=6',
			function (a, b) {
				return 'Foo#' + b;
			}

		);

		picky.signature(
			'bool, bool q=true',
			function (a, b) {
				return 'bool#' + (b ? 'true' : 'false');
			}

		);

		picky.signature(
			'bool, bool, bool q=1',
			function (a, b, c) {
				return 'boolbool#' + (c ? 'true' : 'false');
			}

		);

		//  EXECUTION
		it('proper defaults', function (done) {
			expect(picky(100)).to.equal('int#1');
			expect(picky(Math.PI)).to.equal('float#2.1');
			expect(picky('Foo')).to.equal('string#3');
			expect(picky({ name: 'foo' })).to.equal('object#4');
			expect(picky(['foo'])).to.equal('array#5');
			expect(picky(new Foo())).to.equal('Foo#6');
			expect(picky(true)).to.equal('bool#true');
			//  matches 'bool, bool=true' rather than 'bool, bool, bool q=1'
			expect(picky(true, true)).to.equal('bool#true');
			expect(picky(true, false)).to.equal('bool#false');

			expect(picky(true, false, undefined)).to.equal('boolbool#true');

			done();
		});

		it('understand when to ignore defaults', function (done) {
			expect(picky(100, 10)).to.equal('int#10');
			expect(picky(Math.PI, 11.1)).to.equal('float#11.1');
			expect(picky('Foo', 12)).to.equal('string#12');
			expect(picky({ name: 'foo' }, 13)).to.equal('object#13');
			expect(picky(['foo'], 14)).to.equal('array#14');
			expect(picky(new Foo(), 15)).to.equal('Foo#15');

			expect(picky(true, false)).to.equal('bool#false');
			expect(picky(true, true)).to.equal('bool#true');
			expect(picky(true, true, false)).to.equal('boolbool#false');
			expect(picky(true, true, true)).to.equal('boolbool#true');

			done();
		});
	});

	it('Resolve references', function (done) {
		var defaults = polymorphic();

		function echo() {
			return Array.prototype.slice.call(arguments).join(',');
		}

		defaults.signature('string a, string b=@a', echo);
		defaults.signature('number a=3, number b=7, number c=@b, number d=0', echo);

		expect(defaults()).to.equal('3,7,7,0');
		expect(defaults('q')).to.equal('q,q');
		expect(defaults('q', 'x')).to.equal('q,x');
		expect(defaults(1)).to.equal('1,7,7,0');
		expect(defaults(2, 3)).to.equal('2,3,3,0');
		expect(defaults(3, 7, 9)).to.equal('3,7,9,0');
		expect(defaults(2, 4, 8, 10)).to.equal('2,4,8,10');

		done();
	});
});
