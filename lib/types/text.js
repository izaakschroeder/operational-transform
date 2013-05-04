
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

	"use strict";

	function check(O) {
		if (Array.isArray(O) === false)
			return false;
		return O.every(function(entry) {
			typeof entry.data === "string" && typeof entry.offset === "number";
		});
	}

	function ii(Oa, Ob) {
		if (Oa.offset < Ob.offset)
			return false;
		return [ { data: Oa.data, offset: Oa.offset + Ob.data.length } ];
	}

	function id(Oa, Ob) {
		if (Oa.offset <= Ob.offset)
			return false;
		else if (Oa.offset > Ob.offset + Ob.data.length)
			return [ { data: Oa.data, offset: Oa.offset - Ob.data.length } ]
		else
			return [ { data: Oa.data, offset: Ob.offset } ]
	}

	function di() {
		//The insert happened after all the deleted characters
		//so the deletion is unaffected
		if (Ob.offset >= Oa.offset + Oa.data.length)
			return false;
		//The insert covers the beginning of the delete, so the
		//delete just needs to be shifted down to compensate
		else if (Ob.offset <= Oa.offset)
			return [ { data: Oa.data, offset: Oa.offset + Ob.data.length } ]
		//The insert happened in the middle; worst case because
		//it means we actually need to split up the delete
		else
			return [
				{ data: Oa.data.substring(0, Ob.offset - Oa.offset), offset: Oa.offset },
				{ data: Oa.data.substring(Ob.offset - Oa.offset), offset: Ob.offset + Ob.data.length }
			]
	}

	function dd(Oa, Ob) {
		//The other delete happens after everything ours includes,
		//so no changes are necessary
		if (Ob.offset >= Oa.offset + Oa.data.length)
			return false;
		//The other delete starts and ends before our delete, so the
		//we just need to be shifted up to compensate.
		else if (Ob.offset + Ob.data.length <= Oa.offset)
			return [ { data: Oa.data, offset: Oa.offset - Ob.data.length } ]
		//The other delete starts before ours and ends after ours, so
		//our operation does essentially nothing
		else if (Ob.offset <= Oa.offset && Oa.offset + Oa.data.length <= Ob.offset + Ob.data.length)
			return [ { data: "", offset: Oa.offset } ]
		//The other delete starts before ours, and our operation ends 
		//after the other delete, meaning our operation still applies
		//to the last couple of characters
		else if (Ob.offset <= Oa.offset && Oa.offset + Oa.data.length > Ob.offset + Ob.data.length)
			return [ { data: Oa.data.substring((Oa.offset + Oa.length) - (Ob.offset + Ob.length) ), offset: Ob.offset } ]
		//The other delete starts after ours, and ends after ours, so
		//our operation still applies to the first couple of characters
		else if (Ob.offset > Oa.offset && Ob.offset + Ob.data.length >= Oa.offset + Oa.data.length)
			return [ { data: Oa.data.substring(0, Ob.offset - Oa.offset), offset: Oa.offset } ]
		//The other operation starts after ours and ends before ours, so
		//we need to take a chunk out of the middle
		else
			return [ { data: Oa.data.substring(0, Ob.offset - Oa.offset) + Oa.data.substring(Ob.offset - Oa.offset + Ob.length) , offset: Oa.offset } ]
	}

	function settle(T, A, B) {
		// The inclusion transform includes Ob in Oa,
		// to create Oa', and thus if Ob is again included
		// in Oa', the result should not change. This will
		// be the concept of "settling".
		//
		// Oa' = T(Oa, Ob)
		// Oa' = Oa'' = T(Oa', Ob)

		var unsettled = true;
		
		while (unsettled) {
			var OaPrime = [ ];
			unsettled = false;
			for (var i = 0; i < A.length; ++i) {
				var Oa = A[i];
				for (var j = 0; j < B.length; ++j) {
					var Ob = B[j];
					var result = T(Oa, Ob);
					if (result) {
						Array.prototype.push.apply(OaPrime, result);
						unsettled = true;
						break;
					}
				}
			}
			A = OaPrime;
		}

		return A;
	}

	function Insert() {

	}

	function Delete() {
		
	}

	return {
		
		/**
		 * scatter-strings; 
		 *
		 * See: "Reversible inclusion and exclusion transformation for string-wise
		 * operations in cooperative editing systems".
		 * 
		 * options is an array of offset/data pairs that
		 * represent data to be inserted or removed at the specific offset. 
		 * the ordering of the data is undefined and therefore the operations 
		 * must NOT overlap. 
		 *
		 * The options for both kinds of operations are exactly the same. Data
		 * is necessary when deleting to later recover the data deleted if the
		 * user wishes to perform an undo.
		 *
		 * The following is a sequence of operations to produce "hello world":
		 * 
		 * insert: [ { offset: 0, data: "hi" }, { offset: 2, data: " world" } ]
		 * delete: [ { offset: 0, data: "hi" } ]
		 * insert: [ { offset: 0, data: "hello" } ]
		 * 
		 * There are only two types of operations: insert and delete. Any other
		 * operation on this kind of document (e.g. replace/update) can be created
		 * as a composition of these two primary operations.
		 *
		 *
		 */

		"insert": {
			
			check: check,

			invert: function(O) {
				return { type: "delete", options: O };
			},
			
			include: {
				insert: function(Oa, Ob) {
					return settle(ii, Oa, Ob);
				},
				delete: function(Oa, Ob) {
					return settle(id, Oa, Ob);
				}
			}
		},
		"delete": {
			
			check: check,

			invert: function(O) {
				return { type: "insert", options: O };
			},

			include: {
				insert: function(Oa, Ob) {
					return settle(di, Oa, Ob);

				},
				delete: function(Oa, Ob) {
					return settle(dd, Oa, Ob);
				}
			}
		}
	};
});
