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
let chatController;
  
const req = httpclient.get('https://backbone-demo-a094e.firebaseio.com/users.json?', (res) => {
  let bodyChunks = [];
  let jsonObj = {};

  res.on('data', (chunk) => {
    bodyChunks.push(chunk);
  }).on('end', () => {
    let body = Buffer.concat(bodyChunks);
    jsonObj = JSON.parse(body);

    users = _.map(jsonObj, (value,index) => {
        return value;
    });

    chatController = new ChatController(app, req, users);
    chatController.registerUrlWatcher('/', {redirect: '/login'});
    chatController.registerUrlWatcher('/login', {pug: 'login', title: 'Login'});
    chatController.registerUrlWatcher('/logout', {logout: true});
    chatController.registerUrlWatcher('/signup', {pug: 'signup', title: 'Signup', requireLogin: false});
    chatController.registerUrlWatcher('/chat', {pug: 'chat', title: 'Chat'});
    chatController.registerUrlWatcher('/pug-vs-html', {pug: 'pug-vs-html', title: 'Pug vs. HTML'});
    chatController.registerUrlWatcher('/es6-vs-js', {pug: 'es6-vs-js', title: 'ES6 vs. JS'});
    chatController.registerUrlWatcher('/scss-vs-css', {pug: 'scss-vs-css', title: 'SCSS vs. CSS'});
    chatController.registerUrlWatcher('/users', {pug: 'users', title: 'Users'});
  })
});

sessionSockets.on('connection', (err, socket, session) => {
    if(session) {
        if(session.user)
        {
          io.emit('chat message', `${session.user} joined the chat room`);
          io.emit('user connect', session.user);
        }
      }

    socket.on('chat message', (msg) => {
        if(session) {
            if(session.user)
                io.emit('chat message', `${session.user}: ${msg}`);
        }
    });

    socket.on('user disconnect', (user) => {
      chatController.setUserOffline(user);
      io.emit('user disconnect', user);
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Listening on *:3000');
});
