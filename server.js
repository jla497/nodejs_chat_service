var httpclient = require('https');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var options = {
    host: 'http://backbone-demo-a094e.firebaseio.com',
    path: '/users.json?print=pretty'
};

var req = httpclient.get('https://backbone-demo-a094e.firebaseio.com/users.json?', function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));

  // Buffer the body entirely for processing as a whole.
  var bodyChunks = [];
  var users = [];
  var jsonObj = {};
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    console.log('BODY: ' + body);
    jsonObj = JSON.parse(body);
    
    for (var key in jsonObj) {
        if (users.hasOwnProperty(jsonObj)) {
            users.push_back(users[key]);
        }
    }
  })
});

req.on('error', function(e) {
  console.log('ERROR: ' + e.message);
});

app.get('/chat', isLoggedIn, function(req, res) {
    res.sendFile(__dirname + '/public/chat.html');
});

app.get('/backbone', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/users', function(req, res) {
    res.sendFile(__dirname + '/public/usersApp.html');
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

app.use(express.static('public'));

io.on('connection', function(socket) {

    //new connection broadcast
    io.emit('chat message', 'new user joined the chat room');

    //public chat event
    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

function isLoggedIn(req, res, next) {
 if(req.hasUserName()) {
 	return next();
 }
 res.redirect('/users');
}

http.listen(3000, function() {
    console.log('listening on *:3000');
});