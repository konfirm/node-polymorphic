/* global source, describe, it, expect */

var polymorphic = source('polymorphic');

describe('Simple', function () {

	describe('no arguments', function () {
		it('empty signature', function (done) {
			var none = polymorphic();

			none.signature('', function () {
				return arguments.length;
			});

			expect(none()).to.equal(0);

			done();
		});

		it('"void" signature', function (done) {
			var none = polymorphic();

			none.signature('void', function () {
				return arguments.length;
			});

			expect(none()).to.equal(0);

			done();
		});

		it('"void" signature as one of the signatures', function (done) {
			var none = polymorphic();

			none.signature('void', 'string a', function () {
				return arguments.length;
			});

			expect(none()).to.equal(0);
			expect(none('b')).to.equal(1);

			done();
		});

		it('"void name" signatures should fail', function (done) {
			var none = polymorphic();

			none.signature('void name', function () {
				return arguments.length;
			});

			expect(function () {
				none();
			}).to.throw('polymorph: signature not found ""');

			done();
		});
	});

	describe('single argument, no defaults', function () {
		//  PREPARATION
		var single = polymorphic();

		//  add number handler
		single.signature('number', function () {
			return 'number';
		});

		//  add string handler
		single.signature('string', function () {
			return 'string';
		});

		//  add boolean handler
		single.signature('boolean', function () {
			return 'boolean';
		});

		//  add array handler
		single.signature('Array', function () {
			return 'array';
		});

		//  add object handler
		single.signature('object', function () {
			return 'object';
		});

		//  EXECUTION

		it('Number handler', function (done) {
			expect(single(1)).to.equal('number');
			expect(single(1.1)).to.equal('number');

			done();
		});

		it('String handler', function (done) {
			expect(single('a')).to.equal('string');

			done();
		});

		it('Boolean handler', function (done) {
			expect(single(true)).to.equal('boolean');
			expect(single(false)).to.equal('boolean');

			done();
		});

		it('Array handler', function (done) {
			expect(single([1, 3, 5])).to.equal('array');

			done();
		});

		it('Object handler', function (done) {
			expect(single({ a: 1, b: 3, c: 5 })).to.equal('object');

			done();
		});
	});


	describe('single argument, using defaults and priority', function () {
		//  PREPARATION
		var single = polymorphic();

		//  add a default handler, which defaults to a number
		single.signature('number n=3', function (n) {
			return 'default ' + n;
		});

		//  add number handlers
		single.signature('number', function (n) {
			return 'number ' + n;
		});

		//  add string handlers
		single.signature('string', function () {
			return 'string';
		});

		//  add boolean handlers
		single.signature('boolean', function () {
			return 'boolean';
		});

		//  add array handlers
		single.signature('Array', function () {
			return 'array';
		});

		//  add object handlers
		single.signature('object', function () {
			return 'object';
		});

		//  EXECUTION

		it('Default handler', function (done) {
			expect(single()).to.equal('default 3');

			done();
		});

		it('Number handlers', function (done) {
			expect(single(1)).to.equal('number 1');
			expect(single(1.1)).to.equal('number 1.1');

			done();
		});

		it('String handler', function (done) {
			expect(single('a')).to.equal('string');

			done();
		});

		it('Boolean handler', function (done) {
			expect(single(true)).to.equal('boolean');
			expect(single(false)).to.equal('boolean');

			done();
		});

		it('Array handler', function (done) {
			expect(single([1, 3, 5])).to.equal('array');

			done();
		});

		it('Object handler', function (done) {
			expect(single({ a: 1, b: 3, c: 5 })).to.equal('object');

			done();
		});
	});

});
