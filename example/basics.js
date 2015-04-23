'use strict';
var polymorphic = require('../lib/polymorphic'),  //  you'd use require('polymorphic')
	multiply = polymorphic();

//  `multiply` is now a polymorphic function, so we can add a couple of signatures
multiply.signature('number, number', function(a, b) {
	return a * b;
});

multiply(2, 3);  //  returns: 6

//  now lets call it with numbers packed in strings
multiply('2', '3');  //  throws Error: polymorph: signature not found "string, string"

//  lets fix that
multiply.signature('string, string', function(a, b) {
	//  for clarity, we don't use the - functionally similar - short notation: return +a * +b;
	return Number(a) * Number(b);
});

//  now lets call it again with the same arguments
multiply('2', '3');  //  returns: 6

//  need default values for arguments which are left out?
multiply.signature('number, number val=4', 'string, string val=5', function(a, val) {
	return multiply(a, val);
});
