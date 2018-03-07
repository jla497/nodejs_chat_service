var httpclient = require('https');
var morgan = require('morgan');
var _ = require('underscore');
var http = require('http')
  , path = require('path')
  , express = require('express')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , methodOverride = require('method-override')
  , expressSession = require('express-session')
  , app = express();

  var myCookieParser = cookieParser('secret');
var sessionStore = new expressSession.MemoryStore();
//log info about requests
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride());
app.use(myCookieParser);
app.use(expressSession({
    key:'connect.sid',
    secret: 'secret', 
    store: sessionStore, 
    resave: false,
    saveUninitialized: false 
}));

var server = http.Server(app)
  , io = require('socket.io')(server);

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, myCookieParser);


//fetch list of users from firebase
var users = [];
  
var req = httpclient.get('https://backbone-demo-a094e.firebaseio.com/users.json?', function(res) {
  // Buffer the body entirely for processing as a whole.
  var bodyChunks = [];
  var jsonObj = {};
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    jsonObj = JSON.parse(body);
    users = _.map(jsonObj, function(value,index) {
        return value;
    });

  })
});

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user) {
        console.log('got chat');
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
    .post(function(req, res){
        var username = req.body.username;
        var foundUser = _.filter(users, function(user) {return user.username == username; });

        if(foundUser.length > 0) {
            req.session.user = username;
            console.log('found user: '+req.session.user);
            res.redirect('/chat');
        }else {
            res.redirect('/login');
        }
    });

app.get('/logout', function(req, res) {
  res.clearCookie('connect.sid');
  res.redirect('/');
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

sessionSockets.on('connection', function(err, socket, session) {

    //new connection broadcast
    if(session) {
        if(session.user){ io.emit('chat message', session.user+' joined the chat room');    
        }
      }
    
    //public chat event
    socket.on('chat message', function(msg) {
        if(session) {
            if(session.user){
                io.emit('chat message', session.user+": "+msg);       
            }
        }
    });
});

app.use(express.static('public'));

server.listen(3000, function() {
    console.log('listening on *:3000');
});