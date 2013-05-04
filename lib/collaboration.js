/**
 *
 *
 *
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
	'./context',
	'./operation',
	'com.izaakschroeder.interval-tree-clock',
	'com.izaakschroeder.events',
	'./util'
], function(Context, Operation, clock, events, util) {

	"use strict";

	var EventEmitter = events.EventEmitter;

	/**
	 *
	 *
	 *
	 */
	function Collaboration(type, state, id) {
		EventEmitter.call(this);

		//Type checks
		if (state instanceof Context === false)
			throw new TypeError('Must pass valid initial state!');
		util.verifyType(type);


		//Operations allowed on this collaboration
		this.type = type;

		//Current document state
		this.state = state;

		//The owner of this (typically referred to as the site)
		this.id = id;

		//Seed the clock.
		this.clock = clock;

	}
	util.inherits(Collaboration, EventEmitter);


	Collaboration.prototype.canProcess = function(operation) {
		//if we are missing operation (from someone else) that's part of operation.context
		if (!operation.context.isSubsetOf(this.state))
			//We can't handle the operation
			return false;
		//We're good to go
		return true;
	}

	Collaboration.compareOperation = function(a, b) {

		//if (a.document !== b.document)
		//	return false;
		
		if (a === b)
			return 0;
		
		if (!b.extra.timestamp.precedes(a.extra.timestamp))
			return -1;
		if (!a.extra.timestamp.precedes(b.extra.timestamp))
			return 1;
		
		if (a.owner > b.owner)
			return 1;
		if (a.owner < b.owner)
			return -1;
		
		//FIXME LOL
		return -1;

	}
	
	Collaboration.prototype.compareOwner = function() {

	}

	Collaboration.prototype.compareId = function() {

	}


	Collaboration.prototype.createExtra = function(id) {
		var parts = this.clock.send();
		this.clock = parts[1];
		return {
			owner: this.id,
			timestamp: parts[0]
		}
	}

	/**
	 *
	 *
	 *
	 */
	Collaboration.prototype.do = function(type, transportData) {
		return this.execute(Operation.do(this.state, type, this.createExtra()));
	}

	/**
	 *
	 *
	 *
	 */
	Collaboration.prototype.undo = function(operation, transportData) {
		if (operation instanceof Operation === false)
			throw new TypeError("You must undo an operation.");
		
		return this.execute(operation.undo(this.createExtra()));
	}

	
	

	/**
	 *
	 *
	 * @visibility public
	 */
	Collaboration.prototype.execute = function(operation) {
		if (!this.canProcess(operation))
			throw new TypeError("Cannot process "+operation+".");
		this.clock = this.clock.receive(operation.extra.timestamp);
		//console.log("Preparing "+operation+".");
		operation = operation.prepare(this);
		//console.log("Executing "+operation+".");
		//console.log("Old state: "+this.state);
		this.state = this.state.insert(operation.origin);
		//console.log("New state: "+this.state+" ("+operation.origin+" should be added)");
		this.emit(operation.type.constructor.name.toLowerCase(), operation.type);
		this.emit("operation", operation.origin);
		return operation.origin;
	}

	/**
	 *
	 *
	 * @visibility private
	 */
	Collaboration.prototype.receiveOperation = function(operation) {
		return this.execute(operation);
	}

	/**
	 *
	 *
	 * @visibility private
	 */
	Collaboration.prototype.registerCollaborator = function(collaborator) {
		this.collaborators = this.collaborators.insert(collaborator)
	}

	/**
	 *
	 *
	 * @visibility private
	 */
	Collaboration.prototype.unregisterCollaborator = function(collaborator) {
		this.collaborators = this.collaborators.delete(collaborator)
	}

	return Collaboration;

});