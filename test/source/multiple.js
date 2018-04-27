/* global source, describe, it, expect */

var polymorphic = source('polymorphic');

function slapper(arg) {
	return function () {
		return arg;
	};
}

describe('Multiple arguments', function () {

	describe('two', function () {
		var types = {
			number: 1,
			string: 'A',
			boolean: true,
			Array: [1, 3, 5],
			object: { a: 1, b: 3, c: 5 }
		},
			options = [];

		//  PREPARATION
		var multiple = polymorphic();

		Object.keys(types).forEach(function (first) {
			Object.keys(types).forEach(function (second) {
				var config = {
					name: first + ', ' + second,
					args: [types[first], types[second]]
				};

				multiple.signature(config.name, slapper(config.args));
				options.push(config);
			});
		});

		//  EXECUTION

		options.forEach(function (config) {
			it(config.name, function (done) {
				expect(multiple.apply(null, config.args)).to.equal(config.args);

				done();
			});
		});
	});

	describe('three', function () {
		var types = {
			number: 1,
			string: 'A',
			boolean: true,
			Array: [1, 3, 5],
			object: { a: 1, b: 3, c: 5 }
		},
			options = [];

		//  PREPARATION
		var multiple = polymorphic();

		Object.keys(types).forEach(function (first) {
			Object.keys(types).forEach(function (second) {
				Object.keys(types).forEach(function (third) {
					var config = {
						name: [first, second, third].join(','),
						args: [types[first], types[second], types[third]]
					};

					multiple.signature(config.name, slapper(config.args));
					options.push(config);
				});
			});
		});

		//  EXECUTION

		options.forEach(function (config) {
			it(config.name, function (done) {
				expect(multiple.apply(null, config.args)).to.equal(config.args);

				done();
			});
		});
	});

	describe('four', function () {
		var types = {
			number: 1,
			string: 'A',
			boolean: true,
			Array: [1, 3, 5],
			object: { a: 1, b: 3, c: 5 }
		},
			options = [];

		//  PREPARATION
		var multiple = polymorphic();

		Object.keys(types).forEach(function (first) {
			Object.keys(types).forEach(function (second) {
				Object.keys(types).forEach(function (third) {
					Object.keys(types).forEach(function (fourth) {
						var config = {
							name: [first, second, third, fourth].join(','),
							args: [types[first], types[second], types[third], types[fourth]]
						};

						multiple.signature(config.name, slapper(config.args));
						options.push(config);
					});
				});
			});
		});

		//  EXECUTION

		options.forEach(function (config) {
			it(config.name, function (done) {
				expect(multiple.apply(null, config.args)).to.equal(config.args);

				done();
			});
		});
	});

});
