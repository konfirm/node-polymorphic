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

	lab.experiment('three', function() {
		//  PREPARATION
		var types = {
				number: 1,
				string: 'A'
			},
			options = [],
			multiple = polymorphic();

		Object.keys(types).forEach(function(first) {
			Object.keys(types).forEach(function(second) {
				Object.keys(types).forEach(function(third) {
					var config = {
							name: [first, second + ' b=' + (types[second] + 1), third + ' c=' + (types[third] + 1)].join(','),
							args: [types[first], types[second], types[third]],
							defaults: [types[first], types[second] + 1, types[third] + 1]
						};

					multiple.signature(config.name, slapper(config.args));
					options.push(config);
				});
			});
		});

		//  EXECUTION

		options.forEach(function(config) {
			for (var i = 1; i < config.args.length; ++i) {
				lab.test(config.name, function(done) {
					var expect = config.defaults;
					config.args.slice(0, i).forEach(function(value, index) {
						expect[index] = config.args[index];
					});

					Code.expect(multiple.apply(null, config.args.slice(0, i))).to.deep.equal(expect);

					done();
				});
			}
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
			function(a, b) {
				return 'boolbool#' + (b ? 'true' : 'false');
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
			Code.expect(picky(true, true)).to.equal('boolbool#true');

			done();
		});

		lab.test('ignore defaults', function(done) {
			Code.expect(picky(100, 10)).to.equal('int#10');
			Code.expect(picky(Math.PI, 11)).to.equal('float#11');
			Code.expect(picky('Foo', 12)).to.equal('string#12');
			Code.expect(picky({name:'foo'}, 13)).to.equal('object#13');
			Code.expect(picky(['foo'], 14)).to.equal('array#14');
			Code.expect(picky(new Foo(), 15)).to.equal('Foo#15');
			Code.expect(picky(true, 16)).to.equal('bool#16');

			done();
		});
	});

});
