(function () {

    "use strict";

    var current_project,
        current_color,
        edit_active = 0;

    function projectUpdate (id, arg, cb) {
        var project = projects.get(id);

        project.set(arg).save(null, {
            success: function (model, response) {
                typeof cb == "function" && cb.call();
                projectsEditView.render();
            },
            error: function (model, response) {
                console.log("error: project update");
            }
        });
    }

    function editReset () {
        edit_active = 0;
    }

    window.ProjectsEditView = Backbone.View.extend({
        el: '.projects-edit-list',
        events: {
            "click .project-save":                  "updateProject",
            "click .select-color":                  "selectColor",
            "click .project-item .project-name":    "projectEdit",
            "click .edit-cancel":                   "editProjectCancel"
        },
        initialize:function(options){
            this.projects = options.projects;
            projects.sort_by_name();
            this.render();
        },
        projectEdit: function (ev) {
            var el_project = $(ev.target),
                select_colors_list = '',
                input;

            if (!edit_active) {
                current_project = el_project.attr("project-id");
                current_color = projects.get(current_project).get('color');
                el_project.parent().append('<div class="edit-project-block"></div>');
                el_project.parent().find('.edit-project-block').append('<div class="input-edit-project editing"><input></div>');

                colors.projects.forEach(function(color, id) {
                    var active = '';
                    active = current_color == id ? 'active' : '';
                    select_colors_list += '<div color-id= "' + id + '" class="select-color sc-bg ' + color + ' ' + active + '"></div>';
                });

                //select color
                el_project.parent().find('.edit-project-block').append('<div class="select-colors-list">' + select_colors_list + '</div>');
                //add button ok
                el_project.parent().find('.edit-project-block').append('<button class="btn project-save btn-default">Ok</button>');
                el_project.parent().find('.edit-project-block').append('<button class="btn edit-cancel btn-default">Cancel</button>');

                //set cursor
                input = $('.input-edit-project.editing input');
                input[0].selectionStart = input[0].selectionEnd = input.val().length;

                $(".input-edit-project.editing").click(function(ev) { ev.stopPropagation(); });

                $(".input-edit-project.editing").keypress(function(ev) { 
                    ev.stopPropagation(); 
                    ev.which == 13 && projectUpdate(current_project, {'name': $(".input-edit-project.editing input").val(), 'color': current_color}, editReset);
                });

                $(".input-edit-project.editing input").val(el_project.text());
                edit_active = 1;
            }
        },
        selectColor: function (ev) {
            var el_color = $(ev.target);

            current_color = el_color.attr("color-id");
            el_color.parent().find('.select-color').removeClass('active');
            el_color.addClass('active');
        },
        updateProject: function () {
            var new_project_name;
            new_project_name = $(".input-edit-project.editing input").val();
            $(".edit-project-block").remove();
            projectUpdate(current_project, {'name': new_project_name, 'color': current_color});
            editReset();
        },
        editProjectCancel: function () {
            $(".edit-project-block").remove();
            editReset();
        },
        render: function () {
            var template = _.template($('#projects-edit').html(), {
                        projects:   this.projects,
                        colors:     colors
                    });

            this.$el.html(template);
        }
    });

}());