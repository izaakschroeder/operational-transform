
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./collaboration'], function(Collaboration) {

	"use strict";

	function Engine(transport) {
		this.types = { };
		this.transport = transport;
	}

	

	return Engine;
});
