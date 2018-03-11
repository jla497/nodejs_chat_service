const httpclient = require('https');
const morgan = require('morgan');
const helmet = require('helmet');
const _ = require('underscore');
const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressSession = require('express-session');
const ChatController = require('./public/es6/controller.js');
const app = express();

const myCookieParser = cookieParser('secret');
const sessionStore = new expressSession.MemoryStore();

/* Application Setup */
app.set('views', path.join(__dirname, 'public/pug'));
app.set('view engine', 'pug');  // Handle pug rendering
app.use(morgan('dev'));         //log info about requests
app.use(helmet());              //set HTTP headers to protect against web vulnerabilities
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

const server = http.Server(app);
const io = require('socket.io')(server);

const SessionSockets = require('session.socket.io');
const sessionSockets = new SessionSockets(io, sessionStore, myCookieParser);

//fetch list of users from firebase
let users = [];
  
const req = httpclient.get('https://backbone-demo-a094e.firebaseio.com/users.json?', function(res) {
  // Buffer the body entirely for processing as a whole.
  let bodyChunks = [];
  let jsonObj = {};
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    jsonObj = JSON.parse(body);
    users = _.map(jsonObj, function(value,index) {
        return value;
    });

    const chatController = new ChatController(app, req, users);
    chatController.registerUrlWatcher('/login', {pug: 'login', title: 'Login'});
    chatController.registerUrlWatcher('/logout', {logout: true});
    chatController.registerUrlWatcher('/chat', {pug: 'chat', title: 'Chat'});
    chatController.registerUrlWatcher('/users', {pug: 'users', title: 'Users'});
  })
});

// middleware function to check for logged-in users
sessionSockets.on('connection', function(err, socket, session) {
    //new connection broadcast
    if(session) {
        if(session.user)
          io.emit('chat message', `${session.user} joined the chat room`);
      }
    
    //public chat event
    socket.on('chat message', function(msg) {
        if(session) {
            if(session.user)
              io.emit('chat message', `${session.user}: ${msg}`);
        }
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Listening on *:3000');
});
