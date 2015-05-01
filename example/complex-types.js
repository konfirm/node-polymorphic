'use strict';
var polymorphic = require('../lib/polymorphic'),  //  you'd use require('polymorphic')
	util = require('util'),
	blame = require('blame');

//  we want to have a function which works well with dates
//  an easy way to achieve this is to have a polymorphic function with a signature allowing only Date objects
var dater = polymorphic();
//  add the signature for Date objects
dater.signature('Date', function(date) {
	//  we know date is an instance of Date
	console.log(date, String(date));
});

dater(new Date());  //  all is well

try {
	//  now lets call it with a number
	dater(12345);
}
catch (e) {
	//  throws Error: polymorph: signature not found "int|number"
	//  we use our `blame` module to show a more narrowed down error stack
	var item = blame.stack(e).filter(module.filename).item();

	console.log(String(item));
}

//  Lets dive in a little deeper, inheritance
//  these examples are taken from our unit test (test/complex.js), which features a lot more examples

function Foo() {
	this.name = 'Foo';
	this.time = Date.now();
}

Foo.prototype.hello = function() {
	return 'a ' + this.name;
};

function Bar() {
	Bar.super_.apply(this, arguments);

	this.name = 'Bar';
	this.date = new Date();
}

util.inherits(Bar, Foo);

//  ok, so now a Bar inherits from Foo, meaning it will have everything Foo has, with some added or different stuff

var complex = polymorphic();

//  we will be allowing anything which is (inherited) from Foo
complex.signature('Foo', function(foo) {
	//  call the 'hello' method on the foo, which we know is there as it is always defined on a Foo
	return foo.hello();
});

console.log(
	complex(new Foo()),  //  a Foo
	complex(new Bar())   //  a Bar
);

//  so, what if we don't really trust the inherited instances?
//  we can ensure we have a specific instance by narrowing it down to only the defined type

complex.signature('Foo!', function(foo) {
	//  here, foo is always a Foo, never a Bar
	return foo.hello() + '!!';
});

console.log(
	complex(new Foo()),  //  a Foo!!
	complex(new Bar())   //  a Bar
);
