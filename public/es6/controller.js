const $ = require('jquery');

module.exports = class ChatController {
	constructor(app, req, users) {
		this.app = app;
		this.req = req;
		this.users = users;
		this.onlineUsers = [];
		this.handleLoginPage();
		this.handleSignupPage();
	}

	registerUrlWatcher(url, {pug, title, redirect, logout, requireLogin = true}) {
		this.app.get(url, (req, res) => {
			if(logout) {
				res.clearCookie('connect.sid');
	    		res.redirect('/login');
			} 
			else if(redirect)
	            res.redirect(redirect);
	        else if(req.session.user)
				res.render(pug, {title, user: req.session.user, users: this.onlineUsers});
			else if(requireLogin)
				res.redirect('/login');
			else
				res.render(pug, {title, users: this.onlineUsers});
		});
	}

	handleLoginPage() {
		this.app.route('/login')
			.get(this.sessionChecker, (req, res) => {
				res.render('login', {title: 'Login'});
			})
			.post((req, res) => {
				let username = req.body.username;
        		let foundUser = this.users.filter((user) => {return user.username == username;});

		        if(foundUser.length > 0 && !this.userAlreadyConnected(username)) {
		            req.session.user = username;
		            this.onlineUsers.push(username);
		            console.log('found user: ' + req.session.user);
		            res.redirect('/chat');
		        }
		        else
		            res.redirect('/login');
			});
	}

	handleSignupPage() {
		this.app.route('/signup')
			.post((req, res) => {
				let username = req.body.username;
        		let foundUser = this.users.filter((user) => {return user.username == username;});

		        if(foundUser.length <= 0
		        	&& req.password == req.confirm
		        	&& req.name != '') {
		        	// TODO: Send request to firebase to create the new user
		            console.log('created user: ' + req.session.user);
		            this.onlineUsers.push(username);
		            res.redirect('/chat');
		        }
			});
	}

	sessionChecker(req, res, next) {
		if(req.session.user)
        	res.redirect('/chat');
        else
        	next();
	}

	setUserOffline(user) {
		var index = this.onlineUsers.indexOf(user);

		if(index >= 0)
			this.onlineUsers.splice(index, 1);
	}

	userAlreadyConnected(user) {
		return this.onlineUsers.indexOf(user) >= 0;
	}
}