/* global source, describe, it, expect */

var polymorphic = source('polymorphic');

describe('Variadic types', function () {
	it('variadic argument must be last', function (done) {
		var variadic = polymorphic();

		expect(function () {
			variadic.signature('..., number b=3', function (a, b) {
				return a.join(',') + ',' + b;
			});
		}).to.throw('polymorphic: variadic argument must be at end of signature "..., number b=3"');

		done();
	});

	it('variadic arguments', function (done) {
		var variadic = polymorphic();

		variadic.signature('number, ...', function (n, a) {
			return 'number' + n + ',array' + a.length;
		});

		expect(variadic(9)).to.equal('number9,array0');
		expect(variadic(9, 8)).to.equal('number9,array1');
		expect(variadic(9, 8, 7)).to.equal('number9,array2');
		expect(variadic(9, 8, 7, 6)).to.equal('number9,array3');
		expect(variadic(9, 8, 7, 6, 5)).to.equal('number9,array4');
		expect(variadic(9, 8, 7, 6, 5, 4)).to.equal('number9,array5');
		expect(variadic(9, 8, 7, 6, 5, 4, 3)).to.equal('number9,array6');
		expect(variadic(9, 8, 7, 6, 5, 4, 3, 2)).to.equal('number9,array7');
		expect(variadic(9, 8, 7, 6, 5, 4, 3, 2, 1)).to.equal('number9,array8');

		done();
	});

	it('non-variadic call take precedence', function (done) {
		var variadic = polymorphic();

		variadic.signature('...', function (a) {
			return 'variadic' + a.length;
		});

		variadic.signature('int number=2', function (n) {
			return 'int' + n;
		});

		//  actually the test title is a lie, providing nothing will have equal specificity
		//  (variadic is always 0, as are defaults)
		//  hence the 'first come, first serve' principle applies here
		expect(variadic()).to.equal('variadic0');

		//  ok, now we actually test the claims ;-)
		expect(variadic(0)).to.equal('int0');
		expect(variadic(1)).to.equal('int1');

		expect(variadic(Math.PI)).to.equal('variadic1');
		expect(variadic(true)).to.equal('variadic1');
		expect(variadic(0, 1)).to.equal('variadic2');

		done();
	});

	describe('Signatures containing variadic still correctly checks type', function () {
		it('number, ...', function (done) {
			var variadic = polymorphic();

			variadic.signature('number, ...', function (num, rest) {
				expect(typeof num).to.equal('number');
				expect(rest instanceof Array).to.equal(true);

				done();
			});

			expect(function () {
				variadic(true, 'a', 'b');
			}).to.throw('polymorph: signature not found "boolean|bool, string, string"');

			expect(function () {
				variadic('test', 'a', 'b');
			}).to.throw('polymorph: signature not found "string, string, string"');

			expect(function () {
				variadic(['test'], 'a');
			}).to.throw('polymorph: signature not found "Array|array, string"');

			expect(function () {
				variadic({ a: 'test' }, 'a');
			}).to.throw('polymorph: signature not found "Object|object, string"');

			variadic(2, 'a', 'b');
		});

		it('boolean, ...', function (done) {
			var variadic = polymorphic();

			variadic.signature('boolean, ...', function (bool, rest) {
				expect(typeof bool).to.equal('boolean');
				expect(rest instanceof Array).to.equal(true);

				done();
			});

			expect(function () {
				variadic(2, 'a', 'b');
			}).to.throw('polymorph: signature not found "int|number, string, string"');

			expect(function () {
				variadic(Math.PI, 'a', 'b');
			}).to.throw('polymorph: signature not found "float|number, string, string"');

			expect(function () {
				variadic('test', 'a', 'b');
			}).to.throw('polymorph: signature not found "string, string, string"');

			expect(function () {
				variadic(['test'], 'a');
			}).to.throw('polymorph: signature not found "Array|array, string"');

			expect(function () {
				variadic({ a: 'test' }, 'a');
			}).to.throw('polymorph: signature not found "Object|object, string"');

			variadic(true, 'a', 'b');
		});

		it('string, ...', function (done) {
			var variadic = polymorphic();

			variadic.signature('string, ...', function (str, rest) {
				expect(typeof str).to.equal('string');
				expect(rest instanceof Array).to.equal(true);

				done();
			});

			expect(function () {
				variadic(true, 'a', 'b');
			}).to.throw('polymorph: signature not found "boolean|bool, string, string"');

			expect(function () {
				variadic(2, 'a', 'b');
			}).to.throw('polymorph: signature not found "int|number, string, string"');

			expect(function () {
				variadic(Math.PI, 'a', 'b');
			}).to.throw('polymorph: signature not found "float|number, string, string"');

			expect(function () {
				variadic(['test'], 'a');
			}).to.throw('polymorph: signature not found "Array|array, string"');

			expect(function () {
				variadic({ a: 'test' }, 'a');
			}).to.throw('polymorph: signature not found "Object|object, string"');

			variadic('test', 'a', 'b');
		});
	});
});
