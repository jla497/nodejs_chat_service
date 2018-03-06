define(['jquery', 'underscore', 'backbone', 'socketio'], function($, _, Backbone, io) {
	var ChatView = Backbone.View.extend({
		
		initialize: function() {
			var view = this;
			
			this.socket = io("http://159.203.239.19:3000");

			this.socket.on('chat message', function(msg) {
            	$('#messages').append($('<li>').text(msg));
        	});

			this.render();
		},

        events: {
			'click .chat-btn': 	'sendChat'
		},

		sendChat: function() {
			console.log('btn clicked');
			this.socket.emit('chat message', $('#m').val());
            $('#m').val('');
		},

		render: function() {

                   this.$el.html('<ul id="messages"></ul><form action=""><input id="m" autocomplete="off" /><button type="button" class="chat-btn">Send</button></form>');
                   return this;
                }
        });

	return ChatView;
});