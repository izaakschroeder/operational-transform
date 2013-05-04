


define(['./operation', './util'], function(Operation, util) {

	function Transport() {

	}

	/**
	 * In order to transmit operations we have to do some
	 * compression work. An operation includes its context
	 * which could be very large, so in order to reduce the
	 * amount of data needed to be sent, the context is
	 * turned into a context-vector. A context-vector just
	 * holds a collaborator id and a operation sequence
	 * number and represents all operations from the given
	 * collaborator up to and excluding the given operation
	 * sequence number. 
	 * 
	 * Operations generated locally are garanteed to be in
	 * the document state; however remote operations could
	 * potentially be dropped.
	 *
	 * 
	 * A sends operation A0 to B. C(A0) = { }; CV(A0) = { A: 0, B: 0 } It is delivered.
	 * B sends operation B0 to A. C(B0) = { A0 }; CV(B0) = { A: 1, B: 0 } It is dropped.
	 * B sends operation B1 to A. C(B1) = { A0, B0 }; CV(B1) = { A: 1, B: 1 } It is delivered.
	 *
	 * So A will not have operation B1 which is necessary to 
	 * perform operation B2. A will have to buffer operations
	 * while re-requesting operation B1 from B (or theoretically
	 * any other node).
	 *
	 * If the operation is an undo operation, it suffices to
	 * simply send information about what operation the undo
	 * was based upon. The context can then be re-created since
	 * C(~O) = C(O) U {O}.
	 *
	 * Only original operations are ever sent.
	 */

	

	Transport.prototype.send = function() {

	}

	

	return Transport;
});