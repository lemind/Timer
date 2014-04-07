(function () {

    "use strict";

    window.SumTimeTagsView = Backbone.View.extend({
        el: '.sum-time-tags',
        initialize:function(options){
            this.sum_time_tags  = options.sum_time_tags;
            this.tags  = options.tags;
            this.render();
        },
        render: function () {
            var template = _.template($('#sum-time-tags-template').html(), {
                        sum_time_tags:      this.sum_time_tags,
                        tags:               this.tags
                    });

            this.$el.html(template);
        }
    });

}());