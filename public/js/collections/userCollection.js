define(['underscore', 'backbone','firebase','backbonefire', 'usermodel'], function(_, Backbone, Firebase, BackbineFire, UserModel) {
	var UserCollection = Backbone.Firebase.Collection.extend({
		url: 'https://backbone-demo-a094e.firebaseio.com/users',
		model: UserModel
	});

	return UserCollection;
});