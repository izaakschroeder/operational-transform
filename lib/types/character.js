if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

	"use strict";

	function Null() {
		Object.freeze(this);
	}

	Null.prototype.toString = function() {
		return "<null>";
	}

	Null.prototype.invert = function() {
		return this;
	}

	Null.prototype.includeNull = function(O) {
		return this;
	}

	Null.prototype.includeDelete = function(O) {
		return this;
	}

	Null.prototype.includeInsert = function(O) {
		return this;
	}

	Null.prototype.equals = function(O) {
		return O instanceof Null;
	}


	function Insert(offset, data) {
		if (typeof offset !== "number")
			throw new TypeError();
		if (typeof data !== "string")
			throw new TypeError();
		this.offset = offset;
		this.data = data;
		Object.freeze(this);
	}

	Insert.prototype.toString = function() {
		return "<insert '"+this.data+"' @"+this.offset+">";
	}

	Insert.prototype.invert = function() {
		return new Delete(this.offset, this.data);
	}

	Insert.prototype.includeNull = function(O) {
		return this;
	}

	Insert.prototype.includeDelete = function(O) {
		if (this.offset <= O.offset)
			return this;
		return new Insert(this.offset-1, this.data);
	}

	Insert.prototype.includeInsert = function(O) {
		if (this.offset < O.offset)
			return this;
		return new Insert(this.offset+1, this.data);
	}

	Insert.prototype.equals = function(O) {
		if (O instanceof Insert === false)
			return false;
		return this.offset === O.offset && this.data === O.data;
	}

	function Delete(offset, data) {
		if (typeof offset !== "number")
			throw new TypeError();
		if (typeof data !== "string")
			throw new TypeError();
		this.offset = offset;
		this.data = data;
		Object.freeze(this);
	}

	Delete.prototype.toString = function() {
		return "<delete @"+this.offset+" ('"+this.data+"')>";
	}

	Delete.prototype.invert = function() {
		return new Insert(this.offset, this.data);
	}

	Delete.prototype.includeNull = function(O) {
		return this;
	}

	Delete.prototype.includeDelete = function(O) {
		if (this.offset < O.offset)
			return this;
		if (this.offset === O.offset)
			return new Null();
		return new Delete(this.offset-1, this.data);
	}

	Delete.prototype.includeInsert = function(O) {
		if (this.offset < O.offset)
			return this;
		return new Delete(this.offset+1, this.data);
	}

	Delete.prototype.equals = function(O) {
		if (O instanceof Delete === false)
			return false;
		return this.offset === O.offset;
	}


	return {
		"null": Null,
		"insert": Insert,
		"delete": Delete
	}

});