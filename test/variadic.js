'use strict';

var Code = require('code'),
	Lab = require('lab'),
	polymorphic = require('../lib/polymorphic'),
	lab = exports.lab = Lab.script();

lab.experiment('Variadic types', function() {
	lab.test('variadic argument must be last', function(done) {
		var variadic = polymorphic();

		Code.expect(function() {
			variadic.signature('..., number b=3', function(a, b) {
				return a.join(',') + ',' + b;
			});
		}).to.throw('polymorphic: variadic argument must be at end of signature "..., number b=3"');

		done();
	});

/*
	lab.test('variadic arguments', function(done) {
		var variadic = polymorphic();

		variadic.signature('number, ...', function(n, a) {
			return 'number' + n + ',array' + a.length;
		});

		Code.expect(variadic(9)).to.equal('number9,array0');
		Code.expect(variadic(9, 8)).to.equal('number9,array1');
		Code.expect(variadic(9, 8, 7)).to.equal('number9,array2');
		Code.expect(variadic(9, 8, 7, 6)).to.equal('number9,array3');
		Code.expect(variadic(9, 8, 7, 6, 5)).to.equal('number9,array4');
		Code.expect(variadic(9, 8, 7, 6, 5, 4)).to.equal('number9,array5');
		Code.expect(variadic(9, 8, 7, 6, 5, 4, 3)).to.equal('number9,array6');
		Code.expect(variadic(9, 8, 7, 6, 5, 4, 3, 2)).to.equal('number9,array7');
		Code.expect(variadic(9, 8, 7, 6, 5, 4, 3, 2, 1)).to.equal('number9,array8');

		done();
	});
*/

	lab.test('non-variadic call take precedence', function(done) {
		var variadic = polymorphic();

		variadic.signature('...', function(a) {
			return 'variadic' + a.length;
		});

		variadic.signature('int number=2', function(n) {
			return 'int' + n;
		});

		//  actually the test title is a lie, providing nothing will have equal specificity
		//  (variadic is always 0, as are defaults)
		//  hence the 'first come, first serve' principle applies here
		Code.expect(variadic()).to.equal('variadic0');

		//  ok, now we actually test the claims ;-)
		Code.expect(variadic(0)).to.equal('int0');
		Code.expect(variadic(1)).to.equal('int1');

		Code.expect(variadic(Math.PI)).to.equal('variadic1');
		Code.expect(variadic(true)).to.equal('variadic1');
		Code.expect(variadic(0, 1)).to.equal('variadic2');

		done();
	});

	lab.experiment('Signatures containing variadic still correctly checks type', function() {
		lab.test('number, ...', function(done) {
			var variadic = polymorphic();

			variadic.signature('number, ...', function(num, rest) {
				Code.expect(typeof num).to.equal('number');

				done();
			});

			Code.expect(function() {
				variadic(true, 'a', 'b');
			}).to.throw('polymorph: signature not found "boolean|bool, string, string"');

			Code.expect(function() {
				variadic('test', 'a', 'b');
			}).to.throw('polymorph: signature not found "string, string, string"');

			Code.expect(function() {
				variadic(['test'], 'a');
			}).to.throw('polymorph: signature not found "Array|array, string"');

			Code.expect(function() {
				variadic({a: 'test'}, 'a');
			}).to.throw('polymorph: signature not found "Object|object, string"');

			variadic(2, 'a', 'b');
		});

		lab.test('boolean, ...', function(done) {
			var variadic = polymorphic();

			variadic.signature('boolean, ...', function(bool, rest) {
				Code.expect(typeof bool).to.equal('boolean');

				done();
			});

			Code.expect(function() {
				variadic(2, 'a', 'b');
			}).to.throw('polymorph: signature not found "int|number, string, string"');

			Code.expect(function() {
				variadic(Math.PI, 'a', 'b');
			}).to.throw('polymorph: signature not found "float|number, string, string"');

			Code.expect(function() {
				variadic('test', 'a', 'b');
			}).to.throw('polymorph: signature not found "string, string, string"');

			Code.expect(function() {
				variadic(['test'], 'a');
			}).to.throw('polymorph: signature not found "Array|array, string"');

			Code.expect(function() {
				variadic({a: 'test'}, 'a');
			}).to.throw('polymorph: signature not found "Object|object, string"');

			variadic(true, 'a', 'b');
		});

		lab.test('string, ...', function(done) {
			var variadic = polymorphic();

			variadic.signature('string, ...', function(str, rest) {
				Code.expect(typeof str).to.equal('string');

				done();
			});

			Code.expect(function() {
				variadic(true, 'a', 'b');
			}).to.throw('polymorph: signature not found "boolean|bool, string, string"');

			Code.expect(function() {
				variadic(2, 'a', 'b');
			}).to.throw('polymorph: signature not found "int|number, string, string"');

			Code.expect(function() {
				variadic(Math.PI, 'a', 'b');
			}).to.throw('polymorph: signature not found "float|number, string, string"');

			Code.expect(function() {
				variadic(['test'], 'a');
			}).to.throw('polymorph: signature not found "Array|array, string"');

			Code.expect(function() {
				variadic({a: 'test'}, 'a');
			}).to.throw('polymorph: signature not found "Object|object, string"');

			variadic('test', 'a', 'b');
		});
	});
});
