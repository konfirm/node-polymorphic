'use strict';
var polymorphic = require('../lib/polymorphic'),  //  you'd use require('polymorphic')
	blame = require('blame'),
	multiply = polymorphic();

//  `multiply` is now a polymorphic function, so we can add a couple of signatures
multiply.signature('number, number', function(a, b) {
	return a * b;
});

console.log(multiply(2, 3));  //  6

try {
	//  now lets call it with numbers packed in strings
	multiply('2', '3');
}
catch (e) {
	//  throws Error: polymorph: signature not found "string, string"
	//  we use our `blame` module to show a more narrowed down error stack
	var item = blame.stack(e).filter(module.filename).item();

	console.log(String(item));
}

//  lets fix that error by adding the 'string, string' signature
multiply.signature('string, string', function(a, b) {
	//  for clarity, we don't use the - functionally equivalent - short notation: return +a * +b;
	return Number(a) * Number(b);
});

//  now lets call it again with the same arguments
console.log(multiply('3', '4'));  //  12

//  need default values for arguments which may be left out?
multiply.signature('number, number myDefault=4', 'string, string myDefault=5', function(a, val) {
	return multiply(a, val);
});

//  call it with a number as first argument, and expect multiply to be invoked with the default value 4
console.log(multiply(2));  //  8

//  call it with a string as first argument, and expect multiply to be invoked with the default value 5
console.log(multiply('3'));  //  15
