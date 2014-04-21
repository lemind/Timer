$(function(){

	if ($(".weekly-report").length) {

	    var tasks = new Tasks();

	    function initWeekHover () {
			setTimeout(function() {
			    $('.week .ui-datepicker-calendar tr').on('mousemove', function () {
			        $(this).find('td a').addClass('ui-state-hover');
			    });
			    $('.week .ui-datepicker-calendar tr').on('mouseleave', function () {
			        $(this).find('td a').removeClass('ui-state-hover');
			    });	
			}, 100);
	    }

	    function getPeriod (selectedDate) {
	    	var period = {};

	    	period.start = moment(selectedDate, 'DD.MM.YYYY').isoWeekday(1);
	    	period.end = moment(selectedDate, 'DD.MM.YYYY').isoWeekday(7);

	    	return period;
	    }

	    $( "#week" ).attr("placeholder", "select week").datepicker({
			defaultDate: "+1w",
			changeMonth: true,
			changeYear: true,
			dateFormat: 'dd.mm.yy',
			firstDay: 1,
			numberOfMonths: 1,
			onSelect: function( selectedDate ) {
				var period = getPeriod(selectedDate);

				$(this).val(period.start.format('DD.MM.YYYY') + ' - ' + period.end.format('DD.MM.YYYY'));
				filterByDate(period.start.format('YYYY-MM-DD'), period.end.format('YYYY-MM-DD'));
			},
			beforeShow: function() {
				$('#ui-datepicker-div').addClass('week');
				initWeekHover();
			},
			onChangeMonthYear: function() {
				initWeekHover();
			}
	    });

		var Filters = Backbone.View.extend({
	            el: '.filters',
	            initialize: function() {
					var period = getPeriod(moment());

					$('#week').val(period.start.format('DD.MM.YYYY') + ' - ' + period.end.format('DD.MM.YYYY'));

					tasks.fetch({
						success: function (model, response) {
							console.log("tasks fetch success");

							filterByDate(period.start.format('YYYY-MM-DD'), period.end.format('YYYY-MM-DD'));
						},
						error: function (model, response) {
						    console.log("tasks fetch error");
						}
					});
	            }
			});

		var filters = new Filters();

		function filterByDate (start, end) {
			var	tasks_filtered = tasks.getTasksByDates(start, end);

			FormWeekTable(tasks_filtered);
		}	

		function FormWeekTable (tasks_filtered) {
			var week_table = {},
				sum_by_day = {1: {time: 0}, 2: {time: 0}, 3: {time: 0}, 4: {time: 0}, 5: {time: 0}, 6: {time: 0}, 7: {time: 0}},
				sum_week = 0;

			tasks_filtered.forEach(function(task) {
				var project_id = task.get('project_id'),
					day = moment(task.get('date'), 'YYYY-MM-DD').format('d');

				week_table[project_id] = week_table[project_id] || {'week': {1: {time: 0}, 2: {time: 0}, 3: {time: 0}, 4: {time: 0}, 5: {time: 0}, 6: {time: 0}, 7: {time: 0}}, 'sum': {time: 0}};

				if (day == 0) {
					week_table[project_id].week[7].time += parseInt(task.get('time'));
					sum_by_day[7].time += parseInt(task.get('time'));
				} else {
					week_table[project_id].week[day].time += parseInt(task.get('time'));
					sum_by_day[day].time += parseInt(task.get('time'));
				}
				week_table[project_id].sum.time += parseInt(task.get('time'));
				sum_week += parseInt(task.get('time'));
			});

			console.log(week_table);

			weekTableView = new WeekTableView({
					week: 		week_table,
					projects: 	projects,
					sum_by_day: sum_by_day,
					sum_week: 	sum_week
				});
		}	

	}
});	