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

	    	period.begin = moment(selectedDate, 'DD.MM.YYYY').isoWeekday(1);
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

				$(this).val(period.begin.format('DD.MM.YYYY') + ' - ' + period.end.format('DD.MM.YYYY'));
				filterByDate(period.begin.format('YYYY-MM-DD'), period.end.format('YYYY-MM-DD'));
				pathInfoUpdate();
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

					$('#week').val(period.begin.format('DD.MM.YYYY') + ' - ' + period.end.format('DD.MM.YYYY'));

					tasks.fetch({
						success: function (model, response) {
							console.log("tasks fetch success");

							filterByDate(period.begin.format('YYYY-MM-DD'), period.end.format('YYYY-MM-DD'));
						},
						error: function (model, response) {
						    console.log("tasks fetch error");
						}
					});
	            }
			});

		var filters = new Filters();

		function filterByDate (begin, end) {
			var	tasks_filtered = tasks.getTasksByDates(begin, end);

			formWeekTable(tasks_filtered);
		}	

		function formWeekTable (tasks_filtered) {
			var week_table = {},
				sum_by_day = {1: {time: 0}, 2: {time: 0}, 3: {time: 0}, 4: {time: 0}, 5: {time: 0}, 6: {time: 0}, 7: {time: 0}},
				sum_week = 0;

			function forming (day, project_id, task) {
				week_table[project_id].week[day].time += parseInt(task.get('time'));
				sum_by_day[day].time += parseInt(task.get('time'));

				sum_by_day[day].periods_by_proj = sum_by_day[day].periods_by_proj || {};
				sum_by_day[day].periods_by_proj[project_id] = sum_by_day[day].periods_by_proj[project_id] || []
				sum_by_day[day].periods_by_proj[project_id] = sum_by_day[day].periods_by_proj[project_id].concat($.parseJSON(task.get('periods')));

				week_table[project_id].week[day].detailed = week_table[project_id].week[day].detailed || {};
				week_table[project_id].week[day].detailed[task.get('desc')] = week_table[project_id].week[day].detailed[task.get('desc')] || {time: 0};
				week_table[project_id].week[day].detailed[task.get('desc')].time += parseInt(task.get('time'));

				week_table[project_id].week[day].periods = week_table[project_id].week[day].periods || [];
				week_table[project_id].week[day].periods = week_table[project_id].week[day].periods.concat($.parseJSON(task.get('periods')));
			}

			tasks_filtered.forEach(function(task) {
				var project_id = task.get('project_id'),
					day = moment(task.get('date'), 'YYYY-MM-DD').format('d');

				week_table[project_id] = week_table[project_id] || {'week': {1: {time: 0}, 2: {time: 0}, 3: {time: 0}, 4: {time: 0}, 5: {time: 0}, 6: {time: 0}, 7: {time: 0}}, 'sum': {time: 0}};
				week_table[project_id].sum_by_tasks = week_table[project_id].sum_by_tasks || {};
				if (!week_table[project_id].sum_by_tasks[task.get('desc')]) week_table[project_id].sum_by_tasks[task.get('desc')] = {time: 0};

				if (day == 0) {
					forming(7, project_id, task);
				} else {
					forming(day, project_id, task);
				}
				//sums
				week_table[project_id].sum_by_tasks[task.get('desc')].time += parseInt(task.get('time'));
				week_table[project_id].sum.time += parseInt(task.get('time'));
				sum_week += parseInt(task.get('time'));
			});

			weekTableView = new WeekTableView({
					week: 		week_table,
					projects: 	projects,
					sum_by_day: sum_by_day,
					sum_week: 	sum_week
				});
		}	

	}
});	