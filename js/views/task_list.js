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
                    'mediumaquamarine',
                    'mediumorchid',
                    'mediumpurple',
                    'mediumseagreen',
                    'mediumslateblue',
                    'mediumspringgreen',
                    'mediumturquoise',
                    'mediumvioletred',
                    'violet',
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