(function () {

    "use strict";

    window.TaskListView = Backbone.View.extend({
        el: '.tasks',
         
        initialize:function(options){
            this.tasks  = options.tasks;
            this.projects  = options.projects;
            this.render();
        },
        render: function () {
            var template = _.template($('#task-list-template').html(), {tasks: this.tasks.models, projects: this.projects});
            this.$el.html(template);
        }
    });

}());