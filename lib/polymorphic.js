'use strict';

/**
 *  Create polymorphic functions
 *  @package    polymorphic
 *  @copyright  Konfirm ⓒ 2015-2019
 *  @author     Rogier Spieker (rogier+npm@konfirm.eu)
 *  @license    MIT
 */
function polymorphic() {
	var registry = [];

	/**
	 *  Determine if somewhere in the prototype chains the variable extends an Object with given name
	 *  @name    isExtendOf
	 *  @access  internal
	 *  @param   string  name
	 *  @param   object  variable
	 *  @return  bool    extends
	 */
	function isExtendOf(name, variable) {
		var offset = typeof variable === 'object' && variable ? Object.getPrototypeOf(variable) : null,
			pattern = offset ? new RegExp('^' + name + '$') : null;

		//  It is not quite feasible to compare the inheritance using `instanceof` (all constructors would have to
		//  be registered somehow then) we simply compare the constructor function names.
		//  As a side effect, this enables polymorphic to compare against the exact type (unless a developer has
		//  altered the constructor name, which is not protected from overwriting)
		while (offset && offset.constructor) {
			if (pattern.test(offset.constructor.name)) {
				return true;
			}

			offset = Object.getPrototypeOf(offset);
		}

		return false;
	}

	/**
	 *  Map the param property of given candidate to contain only the values and resolve any references to other arguments
	 *  @name    parameterize
	 *  @access  internal
	 *  @param   Object candidate
	 *  @return  Object candidate (with resolved params)
	 */
	function parameterize(candidate) {
		candidate.param = candidate.param.map(function(param) {
			var value;

			if ('value' in param) {
				value = param.value;
			}
			else if ('reference' in param) {
				value = candidate.param.reduce(function(p, c) {
					return c !== param && !p && param.reference === c.name && 'value' in c ? c.value : p;
				}, null);
			}

			return value;
		});

		return candidate;
	}

	/**
	 *  Filter given list so only matching signatures are kept
	 *  @name    matchSignature
	 *  @access  internal
	 *  @param   array  candidates
	 *  @param   array  arguments
	 *  @return  array  filtered candidates
	 */
	function matchSignature(list, arg) {
		var types = arg.map(function(variable) {
				return new RegExp('^(' + type(variable) + ')');
			});

		return list.filter(function(config) {
			var variadic = false,
				result;

			//  result is true if no more arguments are provided than the signature allows OR the last
			//  argument in the signature is variadic
			result = arg.length <= config.arguments.length || (config.arguments[config.arguments.length - 1] && config.arguments[config.arguments.length - 1].type === '...');

			//  test each given argument agains the configured signatures
			if (result) {
				arg.forEach(function(value, index) {
					var expect = config.arguments[index] ? config.arguments[index].type : null;

					//  look at ourself and ahead - if there is a following item, and it is variadic, it may be
					//  left out entirely (zero or more)
					if (isTypeAtIndex('...', config.arguments, index)) {
						variadic = true;
					}

					//  the result remains valid as long as the values match the given signature
					//  (type matches or it is variadic)
					result = result && (variadic || types[index].test(expect) || (expect[expect.length - 1] !== '!' && isExtendOf(expect, value)));
				});
			}

			return result;
		});
	}

	/**
	 *  Map the registered values to a new object containing the specifics we use to determine the best
	 *  @name    prepare
	 *  @access  internal
	 *  @param   array  candidates
	 *  @param   array  arguments
	 *  @return  array  mapped candidates
	 */
	function prepare(list, arg) {
		return list.map(function(config) {
			var item = {
					//  the function to call
					call: config.call,

					//  all configured arguments
					arguments: config.arguments,

					//  the calculated specificity
					specificity: config.arguments.map(function(argument, index) {
						var value = 'value' in argument,
							specificity = 0;

						//  if a argument not a variadic one and the value is specified
						if (argument.type !== '...' && index < arg.length) {
							++specificity;

							//  bonus points if the exact type matches (explicit by type)
							//  OR there is no default value (explicitly provided)
							if (Number(argument.type === type(arg[index], true) || isExtendOf(argument.type, arg[index]) || !value)) {
								++specificity;
							}

							//  extra bonus points if the type is explicity the same (in case of inheritance)
							if (new RegExp('^' + type(arg[index], true) + '!$').test(argument.type)){ 
								++specificity;
							}
						}

						return specificity;
					}).join(''),

					//  the parameters with which the `call` may be executed
					param: config.arguments.map(function(argument, index) {
						var result = {};

						result.name = argument.name;

						//  if a variadic type is encountered, the remainder of the given arguments becomes the value
						if (argument.type === '...') {
							result.value = arg.slice(index);
						}
						else if (index < arg.length && typeof arg[index] !== 'undefined' && arg[index] !== null) {
							result.value = arg[index];
						}
						else if ('value' in argument) {
							result.value = argument.value;
						}
						else if ('reference' in argument) {
							result.reference = argument.reference;
						}

						return result;
					})
				};

			return item;
		});
	}

	/**
	 *  Prioritize the items in the list
	 *  @name    prepare
	 *  @access  internal
	 *  @param   array  candidates
	 *  @param   array  arguments
	 *  @return  array  prioritized candidates
	 *  @note    the list should contain pre-mapped items (as it works on specificity mostly)
	 */
	function prioritize(list, arg) {
		return list.sort(function(a, b) {
			var typing = function(item, index) {
					return +(item.type === type(arg[index], true));
				};

			//  if the calculated specificity is not equal it has precedence
			if (a.specificity !== b.specificity) {
				//  the shortest specificity OR ELSE the highest specificity wins
				return a.specificity.length - b.specificity.length || b.specificity - a.specificity;
			}

			//  if the specificity is equal, we want to prioritize on the more explicit types
			return b.arguments.map(typing).join('') - a.arguments.map(typing).join('');
		});
	}

	/**
	 *  Compare the type of the argument at a specific position within a collection
	 *  @name    isTypeAtIndex
	 *  @access  internal
	 *  @param   string type
	 *  @param   array  arguments
	 *  @param   int    index
	 *  @return  boolean type at index
	 */
	function isTypeAtIndex(type, list, index) {
		return list.length > index && 'type' in list[index] ? list[index].type === type : false;
	}

	/**
	 *  Determine the proper delegate handler for given arguments
	 *  @name    delegate
	 *  @access  internal
	 *  @param   array  arguments
	 *  @return  mixed  handler result
	 */
	function delegate(arg) {
		//  create a list of possible candidates based on the given arguments
		var candidate = matchSignature(registry, arg);

		//  prepare the configured signatures/arguments based on the arguments actually recieved
		candidate = prepare(candidate, arg);

		//  prioritize the candidates
		candidate = prioritize(candidate, arg);

		//  and finally, filter any candidate which does not fully comply with the signature based on the - now - parameters
		candidate = candidate.filter(function(item) {
			var variadic = false,
				min = item.arguments.map(function(argument, index) {
					variadic = isTypeAtIndex('...', item.arguments, index) || isTypeAtIndex('...', item.arguments, index + 1);

					return +(!(variadic || 'value'  in argument || 'reference' in argument));
				}).join('').match(/^1+/);

			return arg.length >= (min ? min[0].length : 0);
		});

		return candidate.length ? parameterize(candidate[0]) : false;
	}

	/**
	 *  Cast variable to given type
	 *  @name    cast
	 *  @access  internal
	 *  @param   string type
	 *  @param   string value
	 *  @return  mixed  value
	 */
	function cast(type, variable) {
		var result = variable;

		switch (type) {
			case 'number':
				result = +result;
				break;

			case 'int':
				result = parseInt(result, 10);
				break;

			case 'float':
				result = parseFloat(result);
				break;

			case 'bool':
			case 'boolean':
				result = ['true', '1', 1].indexOf(result) >= 0;
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
		//  if the integer value is identical to the float value, it is an integer
		return (parseInt(variable, 10) === parseFloat(variable) ? 'int' : 'float') + (explicit ? '' : '|' + type);
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
		//  array get some special treatment by indicating it is not an object but instead an array
		//  this also goes for inherited types
		if (variable instanceof Array) {
			type = 'array';
		}

		return variable ? variable.constructor.name + (explicit ? '' : '|' + type) : 'null';
	}

	/**
	 *  Create a string matching 'boolean' type and - if not explicit - its shorthand version 'bool'
	 *  @name    booleanType
	 *  @access  internal
	 *  @param   string  type
	 *  @param   bool    explicit typing
	 *  @return  string  types
	 */
	function booleanType(type, explicit) {
		return type + (explicit ? '' : '|bool');
	}

	/**
	 *  Create a string matching undefined (and any string having one or more alphatical characters if not explicit)
	 *  @name    undefinedType
	 *  @access  internal
	 *  @param   string     type
	 *  @param   bool       explicit typing
	 *  @return  string  types
	 */
	function undefinedType(type, explicit) {
		return type + (explicit ? '' : '|[a-z]+');
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

			case 'object':
				result = objectType(result, variable, explicit);
				break;

			case 'boolean':
				result = booleanType(result, explicit);
				break;

			case 'undefined':
				result = undefinedType(result, explicit);
				break;
		}

		return result;
	}

	/**
	 *  Process the expression match result and prepare the argument object
	 *  @name    prepareArgument
	 *  @access  internal
	 *  @param   RegExpMatch match
	 *  @param   string defaultname
	 *  @result  Object argument
	 */
	function prepareArgument(match, name) {
		var result = {
				type:  match ? match[1] : false,
				name:  match ? match[2] : name
			};

		if (match) {
			if (match[4] === '@') {
				result.reference = match[5];
			}
			else if (match[3] === '=') {
				result.value = cast(result.type, match[5]);
			}
		}

		return result;
	}

	/**
	 *  Parse given signature string and create an array containing all argument options for the signature
	 *  @name    parse
	 *  @access  internal
	 *  @param   string  signature
	 *  @return  array   options
	 */
	function parse(signature) {
		var pattern = /^(?:void|([a-zA-Z]+!?|\.{3})(?:[:\s]+([a-zA-Z]+)(?:(=)(@)?(.*))?)?)?$/;

		return signature.split(/\s*,\s*/).map(function(argument, index, all) {
			var result = prepareArgument(argument.match(pattern), 'var' + (index + 1));

			if (result.type === false) {
				throw new Error('polymorphic: invalid argument "' + argument + '" in signature "' + signature + '"');
			}
			else if (result.type === '...' && index < all.length - 1) {
				throw new Error('polymorphic: variadic argument must be at end of signature "' + signature + '"');
			}

			return result;
		}).filter(function(argument) {
			//  a type is undefined if it was declared as 'void' or '' (an empty string)
			return argument.type !== undefined;
		});
	}

	/**
	 *  The main result function, this is the function actually being returned by `polymorphic`
	 *  @name    result
	 *  @access  internal
	 *  @param   * [one or more arguments]
	 *  @return  mixed  handler result
	 *  @throws  polymorph: signature not found "<resolved pattern>"
	 */
	function polymorph() {
		var arg = Array.prototype.slice.call(arguments),
			candidate = delegate(arg);

		if (!candidate) {
			throw new Error('polymorph: signature not found "' + arg.map(function(variable) {
				return type(variable);
			}).join(', ') + '"');
		}

		return candidate.call.apply(this, candidate.param);
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
	polymorph.signature = function() {
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

	return polymorph;
}

module.exports = polymorphic;
