/**
 *
 *
 *
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
	'com.izaakschroeder.collections'
], function(Collections) {

	"use strict";

	/**
	 *
	 *
	 *
	 */
	function ContextSet(set) {
		if (set instanceof Collections.Set === false)
			throw new TypeError();
		this.set = set;
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.create = function(compare) {
		return new ContextSet(Tree.empty(compare));
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.empty = function() {
		return new ContextSet(this.set.empty());
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.toString = function() {
		return this.set.toString();
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.contains = function(o) {
		return this.set.contains(o);
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.insert = function(o) {
		return new ContextSet(this.set.insert(o));
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.difference = function(o) {
		return new ContextSet(this.set.difference(o.set));
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.forEach = function(f) {
		this.set.forEach(f);
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.map = function(f) {
		return new ContextSet(this.set.map(f));
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.filter = function(f) {
		return new ContextSet(this.set.filter(f));
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.reduce = function(f, i) {
		return this.set.reduce(f, i);
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.some = function(f) {
		return this.set.some(f);
	}

	/**
	 *
	 *
	 *
	 */
	ContextSet.prototype.isSubsetOf = function(other) {
		return this.set.isSubsetOf(other.set);
	}

	return ContextSet;

});