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
		var types = {
				number: 1,
				string: 'A'
			},
			options = [];

		//  PREPARATION
		var multiple = polymorphic();

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

});
