(function () {

    "use strict";

    window.TaskListView = Backbone.View.extend({
        el: '.tasks',
        initialize:function(options){
            this.tasks  = options.tasks;
            this.projects  = options.projects;
            this.tags  = options.tags;
            this.colors  = options.colors;
            this.render();

            _.bindAll(this, "render");
            this.tasks.bind('change', this.render);
        },
        render: function () {
            var template = _.template($('#task-list-template').html(), {
                        tasks:      this.tasks.models, 
                        projects:   this.projects,
                        tags:       this.tags,
                        colors:     colors
                    });

            this.$el.html(template);
        }
    });

}());