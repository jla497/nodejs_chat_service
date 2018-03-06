define(['jquery', 'underscore', 'backbone', 'usermodel', 'usercollection', 'createuserview'], function($, _, Backbone, UserModel, UserCollection, CreateUserView) {
	var DisplayUsersView = Backbone.View.extend({
		initialize: function(event) {
			this.demoButton = this.$('.x-demo-control-btn > span');
                        this.tableContainer = this.$('.x-table-container');
			this.tableBody = this.$('.x-user-table-body');
			this.createUserView = new CreateUserView({collection: this.collection});
			this.listenTo(this.collection, 'sync', this.render);
			this.demoStage = 0;
		},
		el: $('.x-users-container'),
		events: {
			'click .x-delete-user-btn': 	'deleteUser',
			'click .x-create-user-btn': 	'openCreateUserView',
			'click .x-demo-control-btn': 	'progressDemo'
		},


		render: function() {
			var template = _.template('<tr><td><%= username %></td>\
			<td><%= name %></td><td><%= phonenumber %></td>\
			<td><button type="button" class="x-delete-user-btn btn btn-danger pull-right" id="<%= id %>">\
			Delete</button></td></tr>');

			var userHtml = '';
			this.collection.each(function(model) {
				var json = model.toJSON();

				if(json.phonenumber == '') {
					json.phonenumber = '-';
				}

				userHtml += template(json);
			})

			this.tableBody.html(userHtml);
			return this;
        },
        deleteUser(event) {
        	var button = event.currentTarget;
			var model = this.collection.get(button.id);
        	model.destroy();
        	this.render();
        },
        openCreateUserView: function() {
        	this.createUserView.toggleVisibility();
        },
        progressDemo: function() {
        	this.demoStage++;

        	if(this.demoStage == 1) {
        		this.demoView();
        	} else if(this.demoStage == 2) {
        		this.demoCollection();
        	} else if(this.demoStage == 3) {
        		this.demoModel();
        	} else {
        		this.cleanUpDemo();
        	}
        },
        demoView: function() {
        	this.demoButton.html('VIEW').addClass('highlight-view-text');
        	this.$el.addClass('highlight-view');
        },
        demoCollection: function() {
        	this.demoButton.removeClass('highlight-view-text');
        	this.demoButton.html('COLLECTION').addClass('highlight-collection-text');
        	this.$el.removeClass('highlight-view');
        	this.tableContainer.addClass('highlight-collection');
        },
        demoModel: function() {
        	this.demoButton.removeClass('highlight-collection-text');
        	this.demoButton.html('MODEL').addClass('highlight-model-text');
        	this.tableContainer.removeClass('highlight-collection');
        	this.$('.x-user-table-body > tr').first().addClass('highlight-model');
        },
        cleanUpDemo: function() {
        	this.demoButton.addClass('hidden');
        	this.$('.x-user-table-body > tr').first().removeClass('highlight-model');
        }
	});

	return DisplayUsersView;
});