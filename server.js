var httpclient = require('https');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var io = require('socket.io')(http);

//fetch list of users from firebase
var users = [];
  
var req = httpclient.get('https://backbone-demo-a094e.firebaseio.com/users.json?', function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));

  // Buffer the body entirely for processing as a whole.
  var bodyChunks = [];
  var jsonObj = {};
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    jsonObj = JSON.parse(body);
    
    for (var key in jsonObj) {
        if (users.hasOwnProperty(jsonObj)) {
            users.push_back(users[key]);
        }
    }
  })
});


//log info about requests
app.use(morgan('dev'));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/chat');
    } else {
        next();
    }    
};

app.all('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    })
    .post((req, res) => {
        var username = req.body.username;
        
        var foundUser = users.filter(function(user) {return user.username == username; });

        if(foundUser != null) {
            req.session.user = username;
            res.redirect('/chat');
        }else {
            res.redirect('/login');
        }
    });

app.get('/chat', function(req, res) {
    if(req.session.user) {
        res.sendFile(__dirname + '/public/chat.html');
    }else {
        res.redirect('/login');
    }

});

app.get('/users', function(req, res) {
    res.sendFile(__dirname + '/public/usersApp.html');
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

http.listen(3000, function() {
    console.log('listening on *:3000');
});