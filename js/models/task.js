window.Task = Backbone.Model.extend({

    urlRoot: 'task'

});

window.Tasks = Backbone.Collection.extend({

    model: Task,
    url: 'tasks'

});