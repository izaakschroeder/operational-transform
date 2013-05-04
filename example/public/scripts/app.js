
require.config({
	xhtml: true,
	enforceDefine: true,
	packages: [
		{ name: 'com.izaakschroeder.operational-transform', main: 'index'},
		{ name: 'com.izaakschroeder.collections', main: 'index' },
		{ name: 'com.izaakschroeder.interval-tree-clock', main: 'itc' },
		{ name: 'com.izaakschroeder.events', main: 'index' }
	]
});

define(['com.izaakschroeder.operational-transform'], function(Engine) {
	
	//change caret to be invisible (necessary?)
	//move it along until delta x offset becomes negative or delta y is bigger than the
	//line height? or beginning is reached
	//if beginning has been reached we're done
	//when delta x becomes negative we've wrapped and are therefore on a different line
	//scan line to find x closest to our original caret x
	
	function CommandLine() {
		
	}

	function Toolbar() {

	}

	function PathDisplay() {

	}

	function Caret(parent, position) {
		this.node = parent.ownerDocument.createElement('span');
		this._position = position || 0;
		this.node.classList.add('caret');
		parent.appendChild(this.node);
	}

	Object.defineProperty(Caret.prototype, 'elementAtCaret', {
		get: function() {
			return this.node.nextSibling;
		}
	})

	Caret.prototype.moveLeft = function() {
		if (this.node.previousSibling === null)
			return false;
		this.node.parentNode.insertBefore(this.node, this.node.previousSibling);
		--this._position;
		return true;
	}

	Caret.prototype.moveRight = function() {
		if (this.node.nextSibling === null)
			return;
		this.node.parentNode.insertBefore(this.node, this.node.nextSibling.nextSibling);
		++this._position;
		return true;
	}

	Caret.distance = function(a, b) {
		var 
			x1 = (a.offsetLeft + a.clientWidth)/2, 
			x2 = (b.offsetLeft + b.clientWidth)/2, 
			y1 = (a.offsetTop + a.clientHeight)/2, 
			y2 = (b.offsetTop + b.clientHeight)/2, 
			w = Math.abs(x1-x2), 
			h = Math.abs(y1-y2),
			q = (Math.atan(h/w))/(Math.PI*2),
			d = 1.5/Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
		//console.log() //* 
		//b.style.opacity = q;
		if (q > 0.20) {
			//b.style.color = 'red';
			return d;
		}
		else {
			//b.style.color = 'black';
			return 0;
		}
	}

	Caret.prototype.moveUp = function() {
		var e = this.node, offset = 0, target, units = 0;
		while(e = e.previousSibling) {
			var newOffset;
			++units;
			newOffset = Caret.distance(this.elementAtCaret, e);
			if (newOffset > offset) {
				offset = newOffset;
				target = e;
			}
		}

		if (target) {
			this.node.parentNode.insertBefore(this.node, target);
			this._position -= units;
		}
	}

	Caret.prototype.moveDown = function() {
		var e = this.node, offset = 0, target, units = 0;
		while(e = e.nextSibling) {
			var newOffset;
			++units;
			newOffset = Caret.distance(this.elementAtCaret, e);
			if (newOffset > offset) {
				console.log(e);
				offset = newOffset;
				target = e;
			}
		}

		if (target) {
			this.node.parentNode.insertBefore(this.node, target);
			this._position += units;
		}
	}

	Object.defineProperty(Caret.prototype, 'position', {
		get: function() {
			return this._position;
		},
		set: function(pos) {
			this._position = pos;
		}
	})

	function Editor(node) {
		
		this.buffer = "";
		this.node = node;
		this.localHistory = [ ];
		this.localUndone = [ ];
		this.node.classList.add('editor');
		this.caret = new Caret(this.node);
		this.setupEvents();
		console.log('MADE EDITOR')
	}

	Editor.prototype.setupEvents = function() {
		var editor = this;
		this.node.addEventListener('keydown', function(evt) {
			
			//if (!evt.controlKey) {
			//	evt.preventDefault();
			//	evt.stopPropagation();
			//}

			switch(evt.keyCode) {
			case 8: //Backspace
				editor.delete();
				break;
			case 46: //Delete
				editor.delete();
				break;
			case 37: //Left
				editor.caret.moveLeft()
				break;
			case 38: //Up
				editor.caret.moveUp();
				evt.preventDefault();
				break;
			case 39: //Right
				editor.caret.moveRight();
				break;
			case 40: //Down
				editor.caret.moveDown();
				evt.preventDefault();
				break;
			//Newline
			case 10:
			case 13:
				//Hard break
				if (evt.shiftKey) {
					editor.insert(editor.node.ownerDocument.createElement('br'));
				}
				//New paragraph
				else {
					editor.insert(editor.node.ownerDocument.createElement('p'));
				}
			default:
				if (evt.keyCode > 19 && evt.keyCode < 64) {
					editor.insert(String.fromCharCode(evt.keyCode));
				}
				else if (evt.keyCode > 64 && evt.keyCode < 90) { //ASCII 
					var ascii;
					if (evt.shiftKey)
						ascii = evt.keyCode;
					else
						ascii = evt.keyCode + 32;
					editor.insert(String.fromCharCode(ascii)); //FIXME
				}

			}

		});

		this.node.addEventListener('paste', function(evt) {
			var text = evt.clipboardData.getData('text/plain');
			for (var i = 0; i < text.length; ++i)
				editor.insert(text.charAt(i));
			
		})

		this.node.addEventListener('copy', function(evt) {

		})

		this.node.addEventListener('cut', function(evt) {

		})

		this.node.addEventListener('mousedown', function(evt) {

		})
	}

	Editor.prototype.undo = function() {
		this.localUndone.push(this.localHistory.pop().undo());
	}

	Editor.prototype.redo = function() {
		this.localHistory.push(this.localUndone.pop().undo());
	}

	Editor.prototype.insert = function(node) {
		if (node instanceof Node) {
			this.node.insertBefore(node, this.caret.node);
		}
		else if (typeof node === 'string') {
			var doc = this.node.ownerDocument, span = doc.createElement('span');
			span.appendChild(doc.createTextNode(node));
			this.insert(span);
		}

		
		//var op = this.collab.do('insert', this.caret, letter);
		//this.localHistory.push(op);
		//return op;
	}

	Editor.prototype.delete = function(pos) {
		//var op = this.collab.do('delete', typeof pos !== "undefined" ? pos : this.caret);
		//this.localHistory.push(op);
		//return op;
	}

	Editor.prototype.moveCaret = function(pos) {
		this.caret.position = pos;
	}

	Editor.createEditor = function(node) {
		return new Editor(node);
	}

	function start() {
		console.log('READY')
		var editor = Editor.createEditor(document.getElementById('document')), state = "";
	}

	if (document.readyState !== 'interactive')
		document.addEventListener('DOMContentLoaded', start);
	else
		start();		

	/*
	can also use readyState === 'complete' / addEventListener('load', ...)
	*/
})