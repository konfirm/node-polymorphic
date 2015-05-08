'use strict';

var Code = require('code'),
	Lab = require('lab'),
	polymorphic = require('../lib/polymorphic'),
	lab = exports.lab = Lab.script();

lab.experiment('Simple', function() {

	lab.experiment('no arguments', function() {
		lab.test('empty signature', function(done) {
			var none = polymorphic();

			none.signature('', function() {
				return arguments.length;
			});

			Code.expect(none()).to.equal(0);

			done();
		});

		lab.test('"void" signature', function(done) {
			var none = polymorphic();

			none.signature('void', function() {
				return arguments.length;
			});

			Code.expect(none()).to.equal(0);

			done();
		});

		lab.test('"void" signature as one of the signatures', function(done) {
			var none = polymorphic();

			none.signature('void', 'string a', function() {
				return arguments.length;
			});

			Code.expect(none()).to.equal(0);
			Code.expect(none('b')).to.equal(1);

			done();
		});

		lab.test('"void name" signatures should fail', function(done) {
			var none = polymorphic();

			none.signature('void name', function() {
				return arguments.length;
			});

			Code.expect(function() {
				none();
			}).to.throw('polymorph: signature not found ""');

			done();
		});
	});

	lab.experiment('single argument, no defaults', function() {
		//  PREPARATION
		var single = polymorphic();

		//  add number handler
		single.signature('number', function() {
			return 'number';
		});

		//  add string handler
		single.signature('string', function() {
			return 'string';
		});

		//  add boolean handler
		single.signature('boolean', function() {
			return 'boolean';
		});

		//  add array handler
		single.signature('Array', function() {
			return 'array';
		});

		//  add object handler
		single.signature('object', function() {
			return 'object';
		});

		//  EXECUTION

		lab.test('Number handler', function(done) {
			Code.expect(single(1)).to.equal('number');
			Code.expect(single(1.1)).to.equal('number');

			done();
		});

		lab.test('String handler', function(done) {
			Code.expect(single('a')).to.equal('string');

			done();
		});

		lab.test('Boolean handler', function(done) {
			Code.expect(single(true)).to.equal('boolean');
			Code.expect(single(false)).to.equal('boolean');

			done();
		});

		lab.test('Array handler', function(done) {
			Code.expect(single([1, 3, 5])).to.equal('array');

			done();
		});

		lab.test('Object handler', function(done) {
			Code.expect(single({a:1, b:3, c:5})).to.equal('object');

			done();
		});
	});


	lab.experiment('single argument, using defaults and priority', function() {
		//  PREPARATION
		var single = polymorphic();

		//  add a default handler, which defaults to a number
		single.signature('number n=3', function(n) {
			return 'default ' + n;
		});

		//  add number handlers
		single.signature('number', function(n) {
			return 'number ' + n;
		});

		//  add string handlers
		single.signature('string', function() {
			return 'string';
		});

		//  add boolean handlers
		single.signature('boolean', function() {
			return 'boolean';
		});

		//  add array handlers
		single.signature('Array', function() {
			return 'array';
		});

		//  add object handlers
		single.signature('object', function() {
			return 'object';
		});

		//  EXECUTION

		lab.test('Default handler', function(done) {
			Code.expect(single()).to.equal('default 3');

			done();
		});

		lab.test('Number handlers', function(done) {
			Code.expect(single(1)).to.equal('number 1');
			Code.expect(single(1.1)).to.equal('number 1.1');

			done();
		});

		lab.test('String handler', function(done) {
			Code.expect(single('a')).to.equal('string');

			done();
		});

		lab.test('Boolean handler', function(done) {
			Code.expect(single(true)).to.equal('boolean');
			Code.expect(single(false)).to.equal('boolean');

			done();
		});

		lab.test('Array handler', function(done) {
			Code.expect(single([1, 3, 5])).to.equal('array');

			done();
		});

		lab.test('Object handler', function(done) {
			Code.expect(single({a:1, b:3, c:5})).to.equal('object');

			done();
		});
	});

});
