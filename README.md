[![npm version](https://badge.fury.io/js/polymorphic.svg)](http://badge.fury.io/js/polymorphic)
[![Build Status](https://travis-ci.org/konfirm/node-polymorphic.svg?branch=master)](https://travis-ci.org/konfirm/node-polymorphic)
[![Coverage Status](https://coveralls.io/repos/konfirm/node-polymorphic/badge.svg?branch=master)](https://coveralls.io/r/konfirm/node-polymorphic?branch=master)
[![dependencies](https://david-dm.org/konfirm/node-polymorphic.svg)](https://david-dm.org/konfirm/node-polymorphic#info=dependencies)
[![dev-dependencies](https://david-dm.org/konfirm/node-polymorphic/dev-status.svg)](https://david-dm.org/konfirm/node-polymorphic#info=devDependencies)
[![Codacy Badge](https://www.codacy.com/project/badge/f0865afea73f4b3f9f7cc4fd1c60510a)](https://www.codacy.com/app/rogier/node-polymorphic)

# node-polymorphic
Create different flows in code based on different argument signatures

## Install
```
npm install --save polymorphic
```

## Concept
One of the complaints on writing javascript is that it is not as strict as one would like, adding `'use strict'` to the code helps a lot but it does not (yet) enforce function calls with explicitly typed arguments. In comes `polymorphic`, trying to add both a level of strictness while also (trying to) improve convenience.
If you have ever found yourself checking the arguments of your functions over and over again (if not, you should check your input), you may find it relaxing to use `polymorphic` which can do this for you. Or actually, it does not validate the inputs, but it will not find a proper function signature for the call resulting in a thrown Error.

## API
The `polymorphic` function itself takes no arguments, all it does is creating the polymorphic function, e.g. `var myVar = polymorphic();`.
While `myVar` now contains a polymorphic function, it will not accept any mix of arguments as it simply has no handlers for any pattern. Calling it now would result in an Error.
Calling `myVar();` will throw: `polymorph: signature not found ""`

### `.signature(string signature1, [string ...signatureN,] function handler)` (`void`)
By calling the `.signature` method on the polymorphic function you've created (`myVar` in the example above), you can add any number of signatures you want (in excess of 1) + the handler function for those signatures.
The syntax of a single argument in a signature is:`type [name[=default]]`
It should be noted that defaults can only be one of the following types: `number`, `int`, `float`, `string`, `boolean`

#### Recognized types in a signature
All of the basic types supported by javascript are supported, next to a few more convenient ones.
- `string`
- `number` (also `float` and `int`)
- `boolean` (also `bool`)
- `array`
- `object` (note that you may choose to use the constructor name to be more explicit, by default this takes the inheritance chain into consideration, but accepts an added `!` (e.g. `'Foo!'`) to indicate only a `Foo` is accepted and not an inherited object)
- `void` (also an empty signature: `''`), denotes a signature which does not allow any arguments
- `...` (note that this variadic type will always become an array containing zero of more arguments, the variadic must be the last argument in a signature)

## Usage
```js
var polymorphic = require('polymorphic'),
	total = polymorphic();

total.signature('number, number', function(a, b) {
	return a + b;
});

total.signature('string, string', function(a, b) {
	//  call the numeric `total` handler with the strings changed into numbers
	return total(+a, +b);
});

console.log(total(1, 2));      //  3
console.log(total('4', '2'));  //  6
console.log(total(true));      //  throws Error, as there is no signature allowing a single boolean argument
```

### Default values
A lot of times more flexibility and consistency can be achieved by having default values, values - if not explicitly provided - to be a certain value.
```js
var polymorphic = require('polymorphic'),
	tax = polymorphic();

tax.signature('number, number percentage=15', function(a, b) {
	return a + (a * (b / 100));
});

//  using the default `tax`
console.log(tax(1));  //  1.15
console.log(tax(2));  //  2.3

//  specify a custom `tax`
console.log(tax(1, 10));  //  1.1
console.log(tax(2, 75));  //  3.5
```

### References
In version `1.1.0`, the concept of _references_ is introduced, this allows you to refer to other (named) variables and will take the value of the referred variable if not provided during the call.
```js
var polymorphic = require('polymorphic'),
	ref = polymorphic();

ref.signature('string a=hello, string b=@a', function(a, b) {
	return a + ', ' + b;
});

console.log(ref());                  //  'hello, hello'
console.log(ref('hi'));              //  'hi, hi'
console.log(ref('hello', 'world'));  //  'hello, world'
```

### Strong typing
As of version `1.0.0` (breaking API change), inheritance is taken into consideration
```js
var polymorphic = require('polymorphic'),
	util = require('util'),
	showDate = polymorphic();

//  define a couple of very simple object types, both dealing with - for example - a date but treated differently
function Foo() {
	this.date = new Date();
}

function Bar() {
	this.timestamp = Date.now();
}

function Baz() {
	//  actually execute everything done in the Bar constructor
	Baz.super_.apply(this, arguments);
}

util.inherits(Baz, Bar);


//  the goal is to log a date object, so we add that signature (note that Date is a native object)
showDate.signature('Date', function(date) {
	//  this logs the same as: console.log('>> ' + date)
	console.log('>> %s', date);
});

//  add different signatures for our objects
showDate.signature('Foo', function(foo) {
	//  we know a Foo has a 'date' property containing a Date object, so we can provide that to `strong`
	showDate(foo.date);
});

showDate.signature('Bar', function(bar) {
	//  we know a Bar has a 'timestamp' property containing the milliseconds since 1970-01-01 00:00:00.0
	//  we also happen to know this timestamp can be used to re-create a Date
	showDate(new Date(bar.timestamp));
});

//  and now...
showDate(new Date());  //  e.g. >> Mon Apr 27 2015 01:23:45 GMT+0200 (CEST)
showDate(new Foo());   //  e.g. >> Mon Apr 27 2015 01:23:45 GMT+0200 (CEST)
showDate(new Bar());   //  e.g. >> Mon Apr 27 2015 01:23:45 GMT+0200 (CEST)
//  (as of 1.0.0) Baz extends Bar and is therefor allowed on Bar signatures
showDate(new Baz());   //  e.g. >> Mon Apr 27 2015 01:23:45 GMT+0200 (CEST)
```

In order to allow only `Bar` instances and never an extend, you can specify the signature `'Bar!'` (read this as "must be a Bar!"). In case both `'Bar'` and `'Bar!'` would exist, the most explicit one (`'Bar!'`) will take precedence.
Adding the following to the example above:
```js
//  add a signature allowing only explicit Bar types
showDate.signature('Bar!', function(bar) {
	showDate(new Date(bar.timestamp), 'bar!');
});

showDate(new Bar());   //  e.g. >> Mon Apr 27 2015 01:23:45 GMT+0200 (CEST) (from: bar!)
showDate(new Baz());   //  e.g. >> Mon Apr 27 2015 01:23:45 GMT+0200 (CEST) (from: bar or baz)
```

### Variadic arguments (`...`)
As of version `0.2.0` the variadic type is understood by `polymorphic`, a variadic type equips you with a lot more flexibility and may be able to help you declaring less specific signatures in some cases. Basically the variadic type (as implemented by `polymorphic`) is a way of creating a signature which tells _I want this and that, + anything else_
```js
var polymorphic = require('polymorphic'),
	variadic = polymorphic();

//  create a variadic signature, requiring the first argument to be an integer and doesn't care about the rest
variadic.signature('int, ...', function(num, rest) {
	console.log('integer: %d', num);
	rest.forEach(function(m) {
		console.log(' -', m);
	});
});

variadic(1);
/*
integer: 1
*/

variadic(10);
/*
integer: 10
*/

variadic(3, 1, 2, 'any', true);
/*
integer: 3
 - 1
 - 2
 - 'any'
 - true
*/
```

## Similar packages
As there are currently over 140.000 public modules on [npm](https://npmjs.org), there sure are modules providing the same functionality. It feels like cheating not to mention a couple of the more popular ones, so here is a shortlist (in alphabetical order) to check out.
- [Fonksiyon](https://www.npmjs.com/package/fonksiyon)
- [Mutate](https://www.npmjs.com/package/mutate.js)
- [Overloadable](https://www.npmjs.com/package/overloadable)
- [Overloader](https://www.npmjs.com/package/overloader)
- [Overloading](https://www.npmjs.com/package/overloading)
- [Overload-js](https://www.npmjs.com/package/overload-js)
- [Parametric](https://www.npmjs.com/package/parametric)
- [Polymorf](https://www.npmjs.com/package/polymorf)
- [Uber](https://www.npmjs.com/package/uber.js)
- [Variadic](https://www.npmjs.com/package/variadic)
- [Variadic.js](https://www.npmjs.com/package/variadic.js)


## License
MIT © 2015-2016 [Konfirm ![Open](https://kon.fm/open.svg)](//kon.fm/site)

_NOTE; Polymorphic up to version 1.3.0 was licensed under the GPLv2_
The MIT license is compatible with GPL and offers less restrictions on the projects using this software.
