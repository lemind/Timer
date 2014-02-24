window.Task = Backbone.Model.extend({

    urlRoot: 'task'

});

window.Tasks = Backbone.Collection.extend({

	initialize: function() { 

		this.on('change:tags', this.changeTags, this);
		this.on('add', this.changeTags, this);

	},

	changeTags: function(model) { 

		if (model.get('tags')) {
			var tags_ids_arr = $.map(model.get('tags').split(','), function(val){
				return parseInt(val);
			});

			model.set({tags_ids_arr: tags_ids_arr});
		} else {
			model.set({tags_ids_arr: null});
		}

	},

    model: Task,
    url: 'tasks'

});