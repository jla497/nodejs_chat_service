requirejs.config({
    paths: {
        app: 'app',
        socketio: 'lib/socket.io',
        jquery: 'lib/jquery',
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        firebase: 'lib/firebase',
        backbonefire: 'lib/backbonefire',
        usermodel: 'models/userModel',
        usercollection: 'collections/userCollection',
        createuserview: 'views/createUserView',
        displayusersview: 'views/displayUsersView',
        chatView: 'views/chatView'
    },

    shim: {
        'socketio': {
           exports: 'io'
        },
    	'backbonefire': {
            deps: ['backbone','firebase'],
            exports: 'backbonefire'
    	},
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {exports: '_'}
    }

});

requirejs(["app"]);