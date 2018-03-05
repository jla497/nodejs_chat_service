var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/chat', function(req, res) {
    res.sendFile(__dirname + '/public/chat.html');
});

app.get('/backbone', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/users',function(req, res) {
	// send list of users
	res.send([
				{ 'name':'user1',
				  'id': 'id1'
				},
				
				{ 'name':'user1',
				  'id': 'id1'
				}
			]);	
});

io.on('connection', function(socket) {

    //new connection broadcast
    io.emit('chat message', 'new user joined the chat room');

    //public chat event
    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});


http.listen(3000, function() {
    console.log('listening on *:3000');
});