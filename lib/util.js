
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

	var util = { };

	/**
	 * There is the pre-condition that the set of operations 
	 * contained in the context are continuous on a per site
	 * basis. That is to say if an operation O from a site S
	 * exists in the context, all operations having a sequence 
	 * number smaller than O and the same site S must also
	 * exist in the context.
	 */
	util.toContextVector = function(context) {

	}

	
	util.fromContextVector = function(vector) {

	}

	
	util.inherits = function(ctor, superCtor) {
		ctor.super_ = superCtor;
		ctor.prototype = Object.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	}

	util.verifyType = function(type) {
		if (typeof type !== "object")
			throw new TypeError('Type must be an object!');
		var operations = Object.getOwnPropertyNames(type);
		operations.forEach(function(name) {
			var operation = operations[name];

			//FIXME: do this
		})
	}

	return util;

});