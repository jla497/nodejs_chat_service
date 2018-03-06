define(['jquery', 'underscore', 'backbone', 'usercollection'], function($, _, Backbone, UserCollection) {
	var CreateUserView = Backbone.View.extend({
		initialize: function(event) {
			this.usernameField = this.$('input[name="username"]');
			this.nameField = this.$('input[name="name"]');
			this.phonenumberField = this.$('input[name="phonenumber"]');
			this.usernameFeedback = this.$('.x-username-feedback');
			this.nameFeedback = this.$('.x-name-feedback');
			this.phonenumberFeedback = this.$('.x-phonenumber-feedback');
		},
		el: $('.x-create-user-container'),
		events: {
			'click .x-sumit-user-btn': 'createUser',
			'click button[type="reset"]': 'toggleVisibility'
		},
		createUser: function(event) {
			var inputUserName = this.usernameField.val();
			var inputName = this.nameField.val();
			var inputPhonenumber = this.phonenumberField.val();

			if(this.isValidForm({userName: inputUserName, name: inputName, phoneNumber: inputPhonenumber})) {
				var user = this.collection.create({
					username: inputUserName,
					name: inputName,
					phonenumber: inputPhonenumber
				});

				this.collection.trigger('sync');
				this.toggleVisibility();
			}
		},
		isValidForm: function(input) {
			var reg = new RegExp('^[0-9]+$');
			var valid = true;
			var userNameTaken = this.collection.where({username: input.userName}).length > 0;

			if(input.userName == "") {
				this.usernameField.addClass('invalid-input');
				this.usernameFeedback.removeClass('hidden');
				this.usernameFeedback.html("Username required");
				valid = false;
			} else if(userNameTaken) {
				this.usernameField.addClass('invalid-input');
				this.usernameFeedback.removeClass('hidden');
				this.usernameFeedback.html("Username already taken");
				valid = false;
			} else {
				this.usernameField.removeClass('invalid-input');
				this.usernameFeedback.addClass('hidden');
			}

			if(input.name == "") {
				this.nameField.addClass('invalid-input');
				this.nameFeedback.removeClass('hidden');
				valid = false;
			} else {
				this.nameField.removeClass('invalid-input');
				this.nameFeedback.addClass('hidden');
			}

			if (!reg.test(input.phoneNumber) && input.phoneNumber != "") {
				this.phonenumberField.addClass('invalid-input');
				this.phonenumberFeedback.removeClass('hidden');
				valid = false;
			} else {
				this.phonenumberField.removeClass('invalid-input');
				this.phonenumberFeedback.addClass('hidden');
			}

			return valid;
		},
		toggleVisibility: function() {
			this.$el.toggleClass('hidden');
			this.clearForm();
		},
		clearForm: function() {
			this.usernameField.val("");
			this.nameField.val("");
			this.phonenumberField.val("");
			this.usernameField.removeClass('invalid-input');
			this.nameField.removeClass('invalid-input');
			this.phonenumberField.removeClass('invalid-input');
			this.usernameFeedback.addClass('hidden');
			this.nameFeedback.addClass('hidden');
			this.phonenumberFeedback.addClass('hidden');
		}
	});

	return CreateUserView;
});