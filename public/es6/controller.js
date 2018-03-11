module.exports = class ChatController {
	constructor(app, req, users) {
		this.app = app;
		this.req = req;
		this.users = users;
		this.handleLoginPage();
	}

	registerUrlWatcher(url, {pug, title, redirect, logout}) {
		this.app.get(url, (req, res) => {
			if(logout) {
				res.clearCookie('connect.sid');
	    		res.redirect('/login');
			} 
			else if(redirect)
	            res.redirect(redirect);
	        else if(req.session.user)
				res.render(pug, {title});
			else
				res.redirect('/login');
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

	sessionChecker(req, res, next) {
		if(req.session.user)
        	res.redirect('/chat');
        else
        	next();
	}
}