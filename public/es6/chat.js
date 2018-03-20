const SessionSockets = require('session.socket.io');
const jsdom = require("jsdom");
const $ = require('jquery')(new jsdom.JSDOM().window);

module.exports = class Chat {
	initialize(server, sessionStore, myCookieParser) {
		this.io = require('socket.io')(server);
		this.sessionSockets = new SessionSockets(this.io, sessionStore, myCookieParser);
		this.watchUserConnects();
	}

	watchUserConnects() {
		this.sessionSockets.on('connection', (err, socket, session) => {
    		if(session) {
        		if(session.user)
          			this.io.emit('chat message', `${session.user} joined the chat room`);
      	}
    
    		socket.on('chat message', (msg) => {
        		if(session && msg) {
            		if(session.user && msg != '')
              			this.io.emit('chat message', `${session.user}: ${msg}`);
        		}
    		});
		});
	}
};