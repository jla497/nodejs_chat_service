const $ = require('jquery');
const firebase = require('firebase');

module.exports = class ChatController {
	constructor(app, req, users) {
		this.app = app;
		this.req = req;
		this.users = users;
		this.onlineUsers = [];
		this.handleLoginPage();
		this.handleSignupPage();

		this.firebaseDB = firebase.initializeApp({
			apiKey: 'AIzaSyAcZgdaSLG99pwR2ij0dFzyy0-DRHWFsl8',
			authDomain: 'backbone-demo-a094e.firebaseio.com',
			databaseURL: 'https://backbone-demo-a094e.firebaseio.com',
			storageBucket: 'backbone-demo-a094e.appspot.com'
		});
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
		        	foundUser = foundUser[0];
		        	if(foundUser.password && req.body.password != foundUser.password)
		        		res.render('login', {title: 'Login', passwordIncorrect: true});
		        	else
		        	{
			            req.session.user = username;
			            this.onlineUsers.push(username);
			            console.log('found user: ' + req.session.user);
			            res.redirect('/chat');
			        }
		        }
		        else
		            res.render('login', {title: 'Login', passwordIncorrect: true});
			});
	}

	handleSignupPage() {
		this.app.route('/signup')
			.post((req, res) => {
				let username = req.body.username;
        		let foundUser = this.users.filter((user) => {return user.username == username;});

        		if(foundUser.length > 0)
        			res.render('signup', {title: 'Signup', userExists: true});
        		else if(req.body.password != req.body.confirm)
        			res.render('signup', {title: 'Signup', passwordNotConfirmed: true});
        		else {
        			this.firebaseDB.database().ref().child('users').push().set({
        				name: req.body.name,
        				phonenumber: req.body.phonenumber,
        				username: req.body.username,
        				password: req.body.password
        			},
        			(error) => {
        				if(error)
        					res.render('signup', {title: 'Signup', userExists: true});
        				else
        				{
        					this.users.push({
        						name: req.body.name,
		        				phonenumber: req.body.phonenumber,
		        				username: req.body.username,
		        				password: req.body.password
        					})
							this.onlineUsers.push(username);
							req.session.user = username;
		            		res.redirect('/chat');
        				}
        			});
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