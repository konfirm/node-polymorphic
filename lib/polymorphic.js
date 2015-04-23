'use strict';

function polymorphic() {
	var registry = [];

	function delegate(arg) {
		var types = new RegExp('^' + arg.map(function(variable) {
				return '(?:' + type(variable) + ')';
			}).join(',')),
			candidate = registry.filter(function(config) {
				return arg.length <= config.arguments.length && types.test(config.arguments.map(function(arg) {
					return arg.type;
				}).join(','));
			}).map(function(config) {
				//  0 = autofilled (so no match), 1 = basic type match, 2 = explicit type match OR no default value
				config.specificity = config.arguments.map(function(argument, index) {
					var value = 'value' in argument;

					//  if a value is specified
					if (index < arg.length) {
						//  bonus points if the exact type matches (explicit by type)
						//  OR there is no default value (explicitly provided)
						return +(argument.type === type(arg[index], true) || !value) + 1;
					}

					return 0;
				}).join('');

				return config;
			}).sort(function(a, b) {
				var typing = function(argument, index) {
						return +(argument.type === type(arg[index], true));
					};

				if (a.specificity !== b.specificity) {
					return b.specificity - a.specificity;
				}

				return b.arguments.map(typing).join('') - a.arguments.map(typing).join('');
			}).filter(function(config) {
				var min = config.arguments.map(function(c) {
						return +(!('value'  in c));
					}).join('').match(/^1+/);

				min = min ? min[0].length : 0;

				return arg.length >= min;
			}).map(function(config) {
				var min;

				config.arguments.forEach(function() {

				});

				return {
					name: config.arguments.map(function(list) {
						return type(list);
					}).join(','),
					call: config.call,
					param: config.arguments.map(function(list, index) {
						return index < arg.length && typeof arg[index] !== 'boolean' && arg[index] ? arg[index] : list.value;
					})
				};
			});

		if (candidate.length) {
			return candidate[0].call.apply(null, candidate[0].param);
		}

		throw new Error('polymorph: signature not found "' + arg.map(function(variable) {
			return type(variable);
		}).join(', ') + '"');
	}

	function numberType(type, variable, explicit) {
		return (parseInt(variable, 10) === parseFloat(variable) ? 'int' : 'float') + (explicit ? '' : '|' + type);
	}

	function booleanType(type, variable, explicit) {
		return type + (explicit ? '' : '|bool');
	}

	function objectType(type, variable, explicit) {
		if (variable instanceof Array) {
			type = 'array';
		}

		return variable ? variable.constructor.name + (explicit ? '' : '|' + type) : 'null';
	}

	function undefinedType(type, variable, explicit) {
		return type + (explicit ? '' : '|[a-z]+');
	}

	function type(variable, explicit) {
		var result = typeof variable;

		switch (result) {
			case 'number':
				result = numberType(result, variable, explicit);
				break;

			case 'boolean':
				result = booleanType(result, variable, explicit);
				break;

			case 'object':
				result = objectType(result, variable, explicit);
				break;

			case 'undefined':
				result = undefinedType(result, variable, explicit);
				break;
		}

		return result;
	}

	function parse(signature) {
		var pattern = /([a-zA-Z]+)(?:[:\s]+([a-zA-Z])(?:=(.*))?)?/;

		return signature.split(/\s*,\s*/).map(function(argument) {
			var match = argument.match(pattern),
				result = {
					type:  match[1],
					name:  match[2]
				};

			if (typeof match[3] !== 'undefined') {
				result.value = match[3];
			}

			return result;
		});
	}

	function result() {
		return delegate(Array.prototype.slice.call(arguments));
	}

	result.signature = function() {
		var arg = Array.prototype.slice.call(arguments),
			call = arg.length && typeof arg[arg.length - 1] === 'function' ? arg.pop() : null;

		if (!arg.length) {
			throw new Error('polymorphic.signature: expected one or more signatures');
		}
		else if (!call) {
			throw new Error('polymorphic.signature: expected final argument to be a callback');
		}

		arg.forEach(function(signature) {
			registry.push({
				signature: signature,
				arguments: parse(signature),
				call: call
			});
		});
	};

	return result;
}

module.exports = polymorphic;
