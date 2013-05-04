var 
	express = require('express'),
	app = express(), 
	server = require('http').createServer(app), 
	io = require('socket.io').listen(server);

//Export basic app content.
app.use(express.static(__dirname+'/public'));
//Export the operational transform engine.
app.use("/scripts/", express.static(__dirname+'/../../'));


io.sockets.on('connection', function(socket) {
	console.log('connection');
})

server.listen(80, "127.0.0.1");
