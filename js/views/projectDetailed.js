(function () {

    "use strict";

    window.ProjectsDetailedView = Backbone.View.extend({
        el: '.projects_detailed',
        initialize:function(options){
            this.projects  = options.projects;
            this.render();
        },
        render: function () {
            var template = _.template($('#projects-detailed-template').html(), {
                        projects:   this.projects
                    });

            this.$el.html(template);
        }
    });

}());