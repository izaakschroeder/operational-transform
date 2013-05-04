
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./context', './util'], function(Context, util) {

	"use strict";

	/**
	 *
	 *
	 *
	 */
	function IncludeOperation(source, target, extra) {
		if (source instanceof Operation === false)
			throw new TypeError("Source must be an operation.");
		if (target instanceof Operation === false)
			throw new TypeError("Target must be an operation.");

		this.source = source;
		this.target = target;

		Operation.call(this,
			source.origin, 
			source.context.insert(target.origin),
			source.type['include'+target.type.constructor.name](target.type),
			extra
		);
	}
	util.inherits(IncludeOperation, Operation);

	/**
	 *
	 *
	 *
	 */
	IncludeOperation.prototype.toString = function() {
		return "IT("+this.source+", "+this.target+")";
	}

	/**
	 *
	 *
	 *
	 */
	function NormalOperation(context, type, extra) {
		Operation.call(this,
			null,
			context,
			type,
			extra
		);
	}
	util.inherits(NormalOperation, Operation);

	/**
	 *
	 *
	 *
	 */
	function UndoOperation(target, extra) {
		if (target instanceof Operation === false)
			throw new TypeError("Target must be an operation.");
		
		this.target = target;

		Operation.call(this,
			//Origin is itself
			null, 
			//Undo(O) is interpreted as an inverse ~O with C(~O) = C(O) U {O}
			//NOTE: Use target.origin here because although the user front-end
			//only undoes original operations, we can use this in the IP3
			//safety algorithm which requires ~O = makeInverse(O); C(~O) = C(O) U {org(O)}.
			target.context.insert(target.origin), 
			//Inverse type of O
			target.type.invert(),
			//Extra data
			extra
		);
	}
	util.inherits(UndoOperation, Operation);

	/**
	 *
	 *
	 *
	 */
	UndoOperation.prototype.toString = function() {
		return "Undo("+this.target+")";
	}

	/**
	 * If an undo operation undoes the same operation
	 * as another undo operation, they are considered
	 * equivalent. (TODO: Implications of this?)
	 */
	UndoOperation.prototype.equals = function(other) {
		return this.target.equals(other.target);
	}

	/**
	 *
	 *
	 *
	 */
	function DoUndoPair(source, target) {
		Operation.call(this,
			source.origin,
			source.context,
			source.type, //TECHNICALLY should be the identity type?
			source.extra
		);
	}
	util.inherits(DoUndoPair, Operation);

	DoUndoPair.prototype.toString = function() {
		return "DoUndoPair("+this.source+","+this.target+")";
	}

	/**
	 *
	 *
	 *
	 */
	function Operation(origin, context, type, extra) {
		
		//TODO: Improve the typechecks here
		if (origin !== null && origin instanceof Operation === false)
			throw new TypeError("Must have an original operation or be null.");
		if (context instanceof Context === false)
			throw new TypeError("Must have a valid context.");
		
		//The original operation from which this operation belongs (org(this))
		this.origin = origin || this;
		
		//The context of the operation C(O) from which it was created
		this.context = context;

		//The.type data of operation being performed (e.g. insert/delete "a" at pos 5)
		this.type = type;
		

		this.extra = extra;

		Object.freeze(this);
	}

	/**
	 *
	 *
	 *
	 */
	Operation.do = function(state, type, extra) {
		return new NormalOperation(
			//For an original normal operation O, C(O) = DS, where DS is the 
			//document state from which O was generated
			state,
			//Type of operation
			type,
			//Extra data
			extra
		);
	}

	/**
	 *
	 *
	 *
	 */
	Object.defineProperty(Operation.prototype, "isOriginal", {
		get: function() {
			return this.origin === this;
		}
	})

	/**
	 *
	 *
	 *
	 */
	Operation.prototype.toString = function() {
		var out = '';
		out += this.type;
		out += (this.isOriginal ? '' : '*') ;
		return out;
	}
	
	/**
	 *
	 *
	 *
	 */
	Operation.prototype.equals = function(operation) {
		return this.type.equals(operation.type) && false; //FIXME: what else here
	}

	/**
	 *
	 *
	 *
	 */
	Operation.prototype.undo = function(extra) {
		return new UndoOperation(this, extra);
	}

	/**
	 *
	 *
	 *
	 */
	Operation.prototype.include = function(other) {
		//The Do/Undo pair is equivalent to the identity
		//operation, and thus we should just return ourselves
		//with our context updated to include the original
		//operations contained in the do/undo pair.
		if (other instanceof DoUndoPair)
			return new Operation(
				this.origin, 
				this.context.insert(other.do.origin).insert(other.undo.origin), 
				this.type, 
				this.extra
			);
		//Any other standard operation falls victim to using
		//the standard type-specific inclusion transformation.
		else
			return new IncludeOperation(this, other);
		
	}

	/**
	 *
	 *
	 *
	 */
	Operation.ip2Safe = function(operation, difference) {
		//Ensure IP2-safety: for any Ox in CD, if inverse Ox exists
		//adjacent in CD, mark Ox as a do-undo pair and remove inverse 
		//Ox from CD.
		var safe = difference.reduce(function(prev, cur) {
			if (cur instanceof UndoOperation && cur.target === prev.operation) 
				return { difference: prev.insert(new DoUndoPair(prev.operation, cur)), operation: null };
			else if (prev.operation !== null)
				return { difference: prev.difference.insert(prev.operation), operation: cur };
			else
				return { difference: prev.difference, operation: cur };
		}, { difference: operation.context.empty(), operation: null });

		if (safe.operation)
			safe.difference = safe.difference.insert(safe.operation);

		return {
			operation: operation,
			difference: safe.difference
		};
	}
	
	/**
	 *
	 *
	 *
	 */
	Operation.ip3Safe = function(operation, difference) {
		//We only care about undo operations
		if (operation instanceof UndoOperation === false) 
			return {
				operation: operation,
				difference: difference
			};
		
		// O = makeInverse(~O); C(O) = C(~O) - {O}
		//This should be the same as operation.target; theoretically
		//O could be constructed purely from ~O. Perhaps knowing this
		//will be useful at some point.
		var original = operation.target;

		// NCD = { Ox | Ox exists CD and Ox || ~O }
		var negatedDifference = difference.filter(function(other) {
			return Operation.isContextIndependent(other, original);
		});
		
		return { 
			// transform(O, NCD)
			// ~O = makeInverse(O); C(~O) = C(O) U {org(O)}
			operation: original.transform(negatedDifference).undo(operation.extra), 
			// CD = CD - NCD
			difference: difference.difference(negatedDifference) 
		};
	}


	/**
	 * Perform some safety checks. Specifically it ensures
	 * IP2-safety and IP3-safety.
	 *
	 */
	Operation.guard = function(operation, difference) {
		var guards = [ Operation.ip2Safe, Operation.ip3Safe ];
		return guards.reduce(function(prev, cur) {
			return cur(prev.operation, prev.difference);
		}, { operation: operation, difference: difference })
	}

	/**
	 * Creates a transformed operation that is suitable for applying
	 * to a context.?
	 */
	Operation.prototype.transform = function(difference) {
		if (difference.length === 0)
			return this;
		
		var parts = Operation.guard(this, difference);

		return parts.difference.reduce(function(prev, cur) {
			return prev.include(cur.transform(prev.context.difference(cur.context)));
		}, parts.operation); 
	}

	
	/**
	 * Given an original operation Oa and an operation Ob of 
	 * any type, Ob is context-dependent on Oa if and only if
	 * Oa exists in C(Ob) or there exists an original operation
	 * Ox such that Ox depends on Oa and Ob depends on Ox.
	 */
	Operation.prototype.isContextDependentOn = function(other) {
		
		if (other instanceof Operation === false)
			throw new TypeError();

		if (!other.isOriginal)
			throw new TypeError();

		if (this.context.contains(other))
			return true;

		return this.context.some(function(operation) {
			if (!operation.isOriginal)
				return false;
			return operation.dependsOn(other) && this.dependsOn(operation); 
		})
	}

	/**
	 *
	 *
	 *
	 */
	Operation.isContextIndependent = function(a, b) {
		return !b.isContextDependentOn(a) && !a.isContextDependentOn(b);
	}

	/**
	 *
	 *
	 *
	 */
	Operation.prototype.prepare = function(collaboration) {
		return this.transform(collaboration.state.difference(this.context));

	}

	return Operation
});

