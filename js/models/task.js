window.Task = Backbone.Model.extend({

    urlRoot: 'task'

});

window.Tasks = Backbone.Collection.extend({

	initialize: function() { 

		this.on('change:tags', this.createTagsIdsArr, this);
		this.on('add', this.createTagsIdsArr, this);
		this.on('reset', this.createTagsIdsArrs, this);

	},

	createTagsIdsArr: function(model) { 
		var tags_ids_arr = [];

		if (model.get('tags')) {
			tags_ids_arr = $.map(model.get('tags').split(','), function(val){
				return parseInt(val);
			});

			model.set({tags_ids_arr: tags_ids_arr});
		} else {
			model.set({tags_ids_arr: null});
		}

	},

	createTagsIdsArrs: function(model) { 

		var self = this;

		model.forEach(function(model_task) {
			self.createTagsIdsArr(model_task);
		});

	},

    model: Task,
    url: 'tasks'

});