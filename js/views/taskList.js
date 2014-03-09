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
            var colors = {
                    tags: [
                        'lightblue',
                        'lightcoral',
                        'lightgreen',
                        'lightsteelblue',
                        'lightpink',
                        'lightsalmon',
                        'lightseagreen',
                        'lightslategray',
                        'lightgray',
                    ],
                    projects: [
                        'project1',
                        'project2',
                        'project3',
                        'project4',
                        'project5',
                        'project6',
                        'project7',
                        'project8',
                        'project9',
                    ]
                },
                template = _.template($('#task-list-template').html(), {
                        tasks:      this.tasks.models, 
                        projects:   this.projects,
                        tags:       this.tags,
                        colors:     colors
                    });

            this.$el.html(template);
        }
    });

}());