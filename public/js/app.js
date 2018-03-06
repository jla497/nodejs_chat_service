define(['underscore', 'backbone', 'jquery', 'usercollection', 'displayusersview', 'chatView'], function(_, Backbone, $, UserCollection, DisplayUsersView, ChatView) {
   var userCollection = new UserCollection();

   var ContainerView = Backbone.View.extend({
     myChildView: null,
     
     render: function() {
      
        this.$el.empty();
        this.$el.append(this.myChildView.$el); 
        return this;
    }
});

   var Workspace = Backbone.Router.extend({

  routes: {
    "users":       "users",   
    "clientchat":   "chat"
  },

   initialize: function () {
        var displayUsersView = new DisplayUsersView({collection: userCollection});
        this.container = new ContainerView({el : $('.x-users-container')});
    },

  users: function() {
    var displayUsersView = new DisplayUsersView({collection: userCollection});
  },

  chat: function(query, page) {
    var chatView = new ChatView();
    this.container.myChildView = chatView;
    this.container.render();

  }

});

    $(document).ready(function() {
        new Workspace();
        Backbone.history.start();
    });
});