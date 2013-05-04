/**
 *
 *
 *
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
	'../context',
	'../operation',
	'../util'
], function(Context, Operation, util) {

	"use strict";

	/**
	 * Representation of a context as a vector of site-specific information.
	 * Every site contains a sequence number representing the inclusion of all 
	 * operations at that site up to that sequence number. 
	 *
	 */
	}

	function OperationBuffer() {
		this.buffer = { };
	}

	OperationBuffer.prototype.put = function(site, sequenceNumber, operation) {
		if (!this.buffer[site])
			this.buffer.site = [ ];
		this.buffer[site][sequenceNumber] = operation;
	}

	OperationBuffer.prototype.get = function(site, sequenceNumber) {
		if (!this.buffer[site])
			throw new TypeError();
		if (!this.buffer[site][sequenceNumber])
			throw new TypeError();
		return this.buffer[site][sequenceNumber];
	}


	ContextVector.fromContext = function(context) {
		var result = { };
		context.forEach(function(operation) {
			result[site] = Math.max(result[site], operation.seq);
		})
	}

	ContextVector.fromVector = function(operationBuffer, vector) {
		for (var site in vector) 
			for (var i = 0; i < vector[site].seq; ++i)
				set = set.insert(operationBuffer.get(site, i))
		
	}


	return ContextVector;

});