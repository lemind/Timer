(function () {

    "use strict";

    var current_tag,
        current_color,
        edit_active = 0;

    function tagUpdate (id, arg, cb) {
        var tag = tags.get(id);

        tag.set(arg).save(null, {
            success: function (model, response) {
                typeof cb == "function" && cb.call();
                tagsEditView.render();
            },
            error: function (model, response) {
                console.log("error: tag update");
            }
        });
    }

    function editReset () {
        edit_active = 0;
    }

    window.TagsEditView = Backbone.View.extend({
        el: '.tags-edit-list',
        events: {
            "click .tag-save":              "updateTag",
            "click .select-color":          "selectColor",
            "click .tag-item .tag-name":    "tagEdit",
            "click .edit-cancel":       "editTagCancel"
        },
        initialize:function(options){
            this.tags = options.tags;
            tags.sort_by_name();
            this.render();
        },
        tagEdit: function (ev) {
            var el_tag = $(ev.target),
                select_colors_list = '',
                input;

            if (!edit_active) {
                current_tag = el_tag.attr("tag-id");
                current_color = tags.get(current_tag).get('color');
                el_tag.parent().append('<div class="edit-tag-block"></div>');
                el_tag.parent().find('.edit-tag-block').append('<div class="input-edit-tag editing"><input></div>');

                colors.tags.forEach(function(color, id) {
                    var active = '';
                    active = current_color == id ? 'active' : '';
                    select_colors_list += '<div color-id= "' + id + '" class="select-color sc-bg ' + color + ' ' + active + '"></div>';
                });

                //select color
                el_tag.parent().find('.edit-tag-block').append('<div class="select-colors-list">' + select_colors_list + '</div>');
                //add button ok
                el_tag.parent().find('.edit-tag-block').append('<button class="btn tag-save btn-default">Ok</button>');
                el_tag.parent().find('.edit-tag-block').append('<button class="btn edit-cancel btn-default">Cancel</button>');

                //set cursor
                input = $('.input-edit-tag.editing input');
                input[0].selectionStart = input[0].selectionEnd = input.val().length;

                $(".input-edit-tag.editing").click(function(ev) { ev.stopPropagation(); });

                $(".input-edit-tag.editing").keypress(function(ev) { 
                    ev.stopPropagation(); 
                    ev.which == 13 && tagUpdate(current_tag, {'name': $(".input-edit-tag.editing input").val(), 'color': current_color}, editReset);
                });

                $(".input-edit-tag.editing input").val(el_tag.text());
                edit_active = 1;
            }
        },
        selectColor: function (ev) {
            var el_color = $(ev.target);

            current_color = el_color.attr("color-id");
            el_color.parent().find('.select-color').removeClass('active');
            el_color.addClass('active');
        },
        updateTag: function () {
            var new_tag_name;
            new_tag_name = $(".input-edit-tag.editing input").val();
            $(".edit-tag-block").remove();
            tagUpdate(current_tag, {'name': new_tag_name, 'color': current_color});
            editReset();
        },
        editTagCancel: function () {
            $(".edit-tag-block").remove();
            editReset();
        },
        render: function () {
            var template = _.template($('#tags-edit').html(), {
                        tags:           this.tags,
                        colors:         colors
                    });

            this.$el.html(template);
        }
    });

}());