window.Tag = Backbone.Model.extend({

	urlRoot: 'tag'

});

window.Tags = Backbone.Collection.extend({

	model: Tag,
	url: 'tags'

});