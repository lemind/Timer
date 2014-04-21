(function () {

    "use strict";

    window.WeekTableView = Backbone.View.extend({
        el: '.week-table',
        initialize:function(options){
            this.week       = options.week;
            this.projects   = options.projects;
            this.sum_by_day = options.sum_by_day;
            this.sum_week   = options.sum_week;
            this.render();
        },
        render: function () {
            var template = _.template($('#week-table-template').html(), {
                        week:       this.week,
                        projects:   this.projects,
                        sum_by_day: this.sum_by_day,
                        sum_week:   this.sum_week
                    });

            this.$el.html(template);
        }
    });

}());