[![npm version](https://badge.fury.io/js/polymorphic.svg)](http://badge.fury.io/js/polymorphic)
[![Build Status](https://travis-ci.org/konfirm/node-polymorphic.svg?branch=master)](https://travis-ci.org/konfirm/node-polymorphic)
[![Coverage Status](https://coveralls.io/repos/konfirm/node-polymorphic/badge.svg?branch=master)](https://coveralls.io/r/konfirm/node-polymorphic?branch=master)
[![Codacy Badge](https://www.codacy.com/project/badge/f0865afea73f4b3f9f7cc4fd1c60510a)](https://www.codacy.com/app/rogier/node-polymorphic)

# node-polymorphic
Create different flows in code based on different argument signatures

## Install
```
npm install --save polymorphic
```

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
console.log(total(true));      //  throws Error
```

### Default values
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

## API
The `polymorphic` function itself takes no arguments, all it does is creating the polymorphic function, e.g. `var myVar = polymorphic();`.
While `myVar` now contains a polymorphic function, it will not accept any mix of arguments as it simply has no handlers for any pattern. Calling it now would result in an Error.
Calling `myVar();` will throw: `polymorph: signature not found ""`

### `.signature(string signature1, [string ...signatureN,] function handler)` (`void`)
By calling the `.signature` method on the polymorphic function you've created (`myVar` in the example above), you can add any number of signatures you want (in excess of 1) + the handler function for those signatures.
The syntax of a single argument in a signature is:`type [name[=default]]`
It should be noted that defaults can only be one of the following types: `number`, `int`, `float`, `string`, `boolean`

## License
GPLv2 © [Konfirm](https://konfirm.eu)
