'use strict';

var Code = require('code'),
	Lab = require('lab'),
	polymorphic = require('../lib/polymorphic'),
	lab = exports.lab = Lab.script();

function Foo() {
	this.name = 'foo';
	this.time = Date.now();
}

function Bar() {
	this.name = 'bar';
	this.time = Date.now();
}

lab.experiment('Complex types', function() {

	lab.test('a Foo walks into a Bar (and other objects)', function(done) {
		var complex = polymorphic();

		complex.signature('Foo, Foo', function() {
			return 'foo foo';
		});

		complex.signature('Foo, Bar', function() {
			return 'foo bar';
		});

		complex.signature('Bar, Foo', function() {
			return 'bar foo';
		});

		complex.signature('Bar, Bar', function() {
			return 'bar bar';
		});

		complex.signature('object, Bar', function() {
			return 'object bar';
		});

		complex.signature('object, Foo', function() {
			return 'object foo';
		});

		complex.signature('object, object', function() {
			return 'object object';
		});

		Code.expect(complex({}, {})).to.equal('object object');
		Code.expect(complex(new Foo(), new Foo())).to.equal('foo foo');
		Code.expect(complex(new Bar(), new Foo())).to.equal('bar foo');
		Code.expect(complex(new Bar(), new Bar())).to.equal('bar bar');
		Code.expect(complex(new Foo(), new Bar())).to.equal('foo bar');
		Code.expect(complex({}, new Bar())).to.equal('object bar');
		Code.expect(complex({}, new Foo())).to.equal('object foo');

		//  while no explicitly typed signature exists, these still match the less strict 'object, object' signature
		Code.expect(complex(new Foo(), {})).to.equal('object object');
		Code.expect(complex(new Bar(), {})).to.equal('object object');

		Code.expect(function() {
			complex(new Foo());
		}).to.throw('polymorph: signature not found "Foo|object"');

		Code.expect(function() {
			complex(new Bar());
		}).to.throw('polymorph: signature not found "Bar|object"');

		Code.expect(function() {
			complex({});
		}).to.throw('polymorph: signature not found "Object|object"');

		done();
	});

});
