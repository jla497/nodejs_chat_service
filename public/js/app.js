define(['underscore', 'backbone', 'jquery', 'usercollection', 'displayusersview'], function(_, Backbone, $, UserCollection, DisplayUsersView,) {
    $(document).ready(function() {
        var userCollection = new UserCollection();
        var displayUsersView = new DisplayUsersView({collection: userCollection});
    });
});