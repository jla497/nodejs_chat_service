const $ = require('jquery');
const Chat = require("./chat.js")

module.exports = class ChatController {
	constructor(app, req, users) {
		this.app = app;
		this.req = req;
		this.users = users;
		this.handleLoginPage();
		this.handleSignupPage();
		this.runChat();
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
				res.render(pug, {title});
			else if(requireLogin)
				res.redirect('/login');
			else
				res.render(pug, {title});
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

		        if(foundUser.length > 0) {
		            req.session.user = username;
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
		            req.session.user = username;
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

	runChat()
	{
		const chatRoom = new Chat();
	}
}