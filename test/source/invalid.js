/* global source, describe, it, expect */

var polymorphic = source('polymorphic');

describe('Invalid signatures', function () {
	var invalid = polymorphic();

	it('variadic argument must be last', function (done) {
		expect(function () {
			invalid.signature('..., number b=3', function (a, b) {
				return a.join(',') + ',' + b;
			});
		}).to.throw('polymorphic: variadic argument must be at end of signature "..., number b=3"');

		done();
	});

	it('signatures follow type naming conventions', function (done) {
		expect(function () {
			invalid.signature('*', function (message) {
				return message;
			});
		}).to.throw('polymorphic: invalid argument "*" in signature "*"');

		done();
	});

});
