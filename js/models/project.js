window.Project = Backbone.Model.extend({

    urlRoot: 'project'

});

window.Projects = Backbone.Collection.extend({

    model: Project,
    url: 'projects'

});