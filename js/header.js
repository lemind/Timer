$(function(){

	if ($(".header").length) {

		var Header = Backbone.View.extend({
			el: '.header', 
			events: {
				"click .show-help": "showHelp"
			},
			showHelp: function () {
				console.log('555555');
				console.log(intro);
				intro.start();
			}
		});

		var header = new Header();

	}

});


