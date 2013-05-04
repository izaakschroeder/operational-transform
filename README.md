Introduction
============

A purely functional implementation of context-based operational transforms. Can be used for optimistic concurrency control in distributed systems. Works in the browser and in nodejs.

Installation:
```
npm install com.izaakschroeder.operational-transform
```


Components
==========

Transport
---------
Responsible for sending messages between collaborators
and implementing the network topology.

Built-in Transports
 * Local: Star-topology for testing.
 * Socket.IO: Star-topology for web-based OT.

Type
----
Responsible for specifying the kinds of operations able
to be performed as well as the necessary inclusion and
inversion transformations.

Built-in Types
 * Character: Character-wise insert/delete.
 * Text: String-wise insert/delete.


Context
-------
Responsible for representing the state of a collaboration.

Built-in Contexts
 * Set
 * Vector

Operation
---------
Determines how operations are transformed against others
according to their concurrency/context relations.


Collaboration
-------------
Brings everything together.