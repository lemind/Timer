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
	    	var current_day = moment(selectedDate, 'DD.MM.YYYY').format('d'),
	    		period = {};

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

			FormTasksByProject(tasks_filtered);
		}	

		function FormTasksByProject (tasks_filtered) {


			tasks_filtered.forEach(function(task) {
				console.log(task);
			});

		}	

	}
});	