'use strict';

var Code = require('code'),
	Lab = require('lab'),
	polymorphic = require('../lib/polymorphic'),
	lab = exports.lab = Lab.script();

lab.experiment('Invalid signatures', function() {
	var invalid = polymorphic();

	lab.test('variadic argument must be last', function(done) {
		Code.expect(function() {
			invalid.signature('..., number b=3', function(a, b) {
				return a.join(',') + ',' + b;
			});
		}).to.throw('polymorphic: variadic argument must be at end of signature "..., number b=3"');

		done();
	});

	lab.test('signatures follow type naming conventions', function(done) {
		Code.expect(function() {
			invalid.signature('*', function(message) {
				return message;
			});
		}).to.throw('polymorphic: invalid argument "*" in signature "*"');

		done();
	});

});
