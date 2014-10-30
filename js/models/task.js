window.Task = Backbone.Model.extend({

    urlRoot: 'task'

});

window.Tasks = Backbone.Collection.extend({

	initialize: function(options) { 

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

	getTasksByDates: function(date_start, date_end) {
		var gf = this.models.filter(function(model) {

			return (
				moment(model.get('date'), 'YYYY-MM-DD') >= moment(date_start, 'YYYY-MM-DD') &&
				moment(model.get('date'), 'YYYY-MM-DD') <= moment(date_end, 'YYYY-MM-DD')
			)
		});

		return gf;
	},

	getTasksByParams: function(descs, date_start, date_end) {
		var gf = this.models.filter(function(model) {

			return (
				descs.indexOf(model.get('desc')) != -1 &&
				moment(model.get('date'), 'YYYY-MM-DD') >= moment(date_start, 'YYYY-MM-DD') &&
				moment(model.get('date'), 'YYYY-MM-DD') <= moment(date_end, 'YYYY-MM-DD')
			)
		});

		return gf;
	},

	fetch: function(options) {
		options || (options = {});
		this.data = (options.data || {});
		options.data = {};

		return Backbone.Collection.prototype.fetch.call(this, options);
	},

    model: Task,
	url: function () {
		if (this.data.begin && this.data.end) {
			return 'tasks/' + this.data.begin + '/' + this.data.end;
		} else {
			return 'tasks';
		}
	}

});