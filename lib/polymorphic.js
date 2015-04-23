'use strict';

/**
 *  Create polymorphic functions
 *  @package    polymorphic
 *  @copyright  Konfirm ⓒ 2015
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    GPLv2
 */
function polymorphic() {
	var registry = [];

	/**
	 *  Determine the proper delegate handler for given arguments
	 *  @name    delegate
	 *  @access  internal
	 *  @param   array  arguments
	 *  @return  mixed  handler result
	 *  @throws  polymorph: signature not found "<resolved pattern>"
	 */
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

	/**
	 *  Determine the type and create a string ready for use in regular expressions
	 *  @name    type
	 *  @access  internal
	 *  @param   mixed   variable
	 *  @param   bool    explicit
	 *  @return  string  type
	 */
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

	/**
	 *  Create a string matching various number types depending on given variable
	 *  @name    numberType
	 *  @access  internal
	 *  @param   string  type
	 *  @param   number  variable
	 *  @param   bool    explicit typing
	 *  @return  string  types
	 */
	function numberType(type, variable, explicit) {
		return (parseInt(variable, 10) === parseFloat(variable) ? 'int' : 'float') + (explicit ? '' : '|' + type);
	}

	/**
	 *  Create a string matching 'boolean' type and - if not explicit - its shorthand version 'bool'
	 *  @name    booleanType
	 *  @access  internal
	 *  @param   string  type
	 *  @param   bool    variable
	 *  @param   bool    explicit typing
	 *  @return  string  types
	 */
	function booleanType(type, variable, explicit) {
		return type + (explicit ? '' : '|bool');
	}

	/**
	 *  Create a string matching various object types (object constructor name if explicit)
	 *  @name    objectType
	 *  @access  internal
	 *  @param   string  type
	 *  @param   object  variable
	 *  @param   bool    explicit typing
	 *  @return  string  types
	 */
	function objectType(type, variable, explicit) {
		if (variable instanceof Array) {
			type = 'array';
		}

		return variable ? variable.constructor.name + (explicit ? '' : '|' + type) : 'null';
	}

	/**
	 *  Create a string matching undefined (and any if not explicit)
	 *  @name    undefinedType
	 *  @access  internal
	 *  @param   string     type
	 *  @param   undefined  variable
	 *  @param   bool       explicit typing
	 *  @return  string  types
	 */
	function undefinedType(type, variable, explicit) {
		return type + (explicit ? '' : '|[a-z]+');
	}

	/**
	 *  Parse given signature string and create an array containing all argument options for the signature
	 *  @name    parse
	 *  @access  internal
	 *  @param   string  signature
	 *  @return  array   options
	 */
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

	/**
	 *  The main result function, this is the function actually being returned by `polymorphic`
	 *  @name    result
	 *  @access  internal
	 *  @param   * [one or more arguments]
	 *  @return  mixed  handler result
	 */
	function result() {
		return delegate(Array.prototype.slice.call(arguments));
	}

	/**
	 *  Add one or more signatures and a handler for those signatures
	 *  @name    signature
	 *  @access  public
	 *  @param   string signature1
	 *  @param   string signatureN [optional - any number of signature can be provided for a handler]
	 *  @param   function handler
	 *  @return  void
	 *  @throws  polymorphic.signature: expected one or more signatures
	 *           polymorphic.signature: expected final argument to be a callback
	 */
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
