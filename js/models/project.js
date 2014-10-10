window.Project = Backbone.Model.extend({

    urlRoot: 'project'

});

window.Projects = Backbone.Collection.extend({

    comparator: function(a, b) {
        a = a.get(this.sort_key);
        b = b.get(this.sort_key);
        return a > b ?  1
             : a < b ? -1
             :          0;
    },

    sort_by_name: function() {
        this.sort_key = 'name';
        this.sort();
    },

    model: Project,
    url: 'projects'

});