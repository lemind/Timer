$(function(){

	if ($(".task-report").length) {

	    var tasks = new Tasks(),
			search_task = $(".search-task"),
			filter_task_list_tag = $(".filter-task-list"),
			filter_task_list = [];
			filter_task_list_colors = [];

		tasks.comparator = 'date'; //sort by date

		function resetSearchSelect2 () {
			search_task.select2('data', '');
		}

		function tasksFilter () {
			tasks.fetch({
				data: {begin: 	moment($('#from').datepicker('getDate')).format("YYYY-MM-DD"), 
					   end: 	moment($('#to').datepicker('getDate')).format("YYYY-MM-DD")},
				remove: false,
				success: function (model, response) {
					console.log("tasks fetch success");
					filterByDate($('#from').datepicker('getDate'), $('#to').datepicker('getDate'));
				},
				error: function (model, response) {
				    console.log("tasks fetch error");
				}
			});
		}

		//period
	    $( "#from" ).attr("placeholder", "period start").datepicker({
			defaultDate: "+1w",
			changeMonth: true,
			changeYear: true,
			dateFormat: 'dd.mm.yy',
			firstDay: 1,
			numberOfMonths: 3,
			onClose: function( selectedDate ) {
				$( "#to" ).datepicker( "option", "minDate", selectedDate );
			}
	    });
	    $( "#to" ).attr("placeholder", "period end").datepicker({
			defaultDate: "+1w",
			changeMonth: true,
			changeYear: true,
			dateFormat: 'dd.mm.yy',
			firstDay: 1,
			numberOfMonths: 3,
			onClose: function( selectedDate ) {
				$( "#from" ).datepicker( "option", "maxDate", selectedDate );
			}
	    });

		var Filters = Backbone.View.extend({
	            el: '.filters',
	            events: {
	                "click .filter":  		"filter", 
	                "click .task-remove": 	"taskRemove", 
	            },
	            initialize: function() {

					var today = new Date(), 
						week_ago = new Date();

						week_ago.setDate(today.getDate()-6);						

					$('#from').datepicker('setDate', week_ago);
					$('#to').datepicker('setDate', today);

					search_task.select2({
						minimumInputLength: 2,
						multiple: false,
						ajax: {
							url: 'descstasks',
							dataType: 'json',
							type: "POST",
							quietMillis: 50,
							data: function ( term ) { 
								return JSON.stringify({term: term, tags: false}); 
							},
							results: function (data) {
								return { 
									results : $.map(data, function (item) { 
										if (filter_task_list.indexOf( item.desc ) == -1)
											return { 
												text: item.desc, 
												id:item.id,
												task: item 
											} 
									})
								}
						    }
						}
					}).on("select2-selecting", function(e) {
						search_task.parent().find('.select2-container').removeClass('error');
						var color = colors.tags[Math.floor(Math.random() * 9)];
						filter_task_list.push(e.object.text);

						filter_task_list_colors.push(color);
						filter_task_list_tag.append('<span class="task-name sc-bg ' + color + '">' + e.object.text + '<span class="task-remove"></span></span>')

						setTimeout(function() {
							resetSearchSelect2();
							tasksFilter();
						}, 1000);
					});

	            },      
	            filter: function () {
	            	tasksFilter();
				},
	            taskRemove: function (ev) {
	            	var remove_task_name = $(ev.target).parent().text();
	            	filter_task_list_colors.splice( filter_task_list.indexOf( remove_task_name ), 1 );
	            	filter_task_list.splice( filter_task_list.indexOf( remove_task_name ), 1 );
	            	$('span.task-name:contains(' + $(ev.target).parent().text() + ')').remove();
	            	filterByDate($('#from').datepicker('getDate'), $('#to').datepicker('getDate'));
				},
			});

		var filters = new Filters();

		function filterByDate (start, end) {
			var	tasks_filtered = tasks.getTasksByParams(filter_task_list, getFormatDate(start), getFormatDate(end)),
				period_count_day = moment(end).diff(moment(start), 'days', true) + 1,
				period = {start: getFormatDate(start), end: getFormatDate(end)};

			if (filter_task_list.length) {
				renderChart(tasks_filtered, period_count_day, period); 
			} else {
				search_task.parent().find('.select2-container').addClass('error');
			}
		}	

		function tasksListByMoment (tasks_filtered, moment_size, period) {
		    var tasks_by_moments = {},
		    	moment_list = [],
		    	current_moment,
		    	moment_start,
		    	moment_end;

		    function addToMomentList (task_moment) {
		    	if (moment_size == 'month') {
		    		moment_list.push(moment.months(task_moment));
		    	} else {
		    		moment_list.push(task_moment);
		    	}
		    }

		    //create empty tasks_by_moments
			switch (moment_size) {
				case 'day':
					for (var d = moment(period.start, 'YYYY-MM-DD').format('YYYY-MM-DD'); d <= moment(period.end, 'YYYY-MM-DD').format('YYYY-MM-DD'); d = moment(d, 'YYYY-MM-DD').add(1, moment_size).format('YYYY-MM-DD')) {
					    tasks_by_moments[d] = {'by_project':{}, 'tasks_list':[]};
					    moment_list.push(d);
					}
					break;
				case 'week':
					for (var d = moment(period.start).day("Monday").week(); d <= moment(period.end).day("Monday").week(); d = moment(d, 'ww').add(1, moment_size).week()) {
					    tasks_by_moments[d] = {'by_project':{}, 'tasks_list':[]};
					    moment_list.push(d);
					}
					break;
				case 'month':
					for (var d = moment(period.start).month(); d <= moment(period.end).month(); d = moment(d+1, 'MM').add(1, moment_size).month()) {
					    tasks_by_moments[d] = {'by_project':{}, 'tasks_list':[]};
					    moment_list.push(moment.months(d));
					}
					break;
				case 'year':
					for (var d = moment(period.start).year(); d <= moment(period.end).year(); d = moment(d, 'yyyy').add(1, moment_size).year()) {
					    tasks_by_moments[d] = {'by_project':{}, 'tasks_list':[]};
					    moment_list.push(d);
					}
					break;
			}

			tasks_filtered.forEach(function(task) {
				var task_moment,
					current_project_name;

				switch (moment_size) {
					case 'day':
						task_moment = task.get('date');
						break;
					case 'week':
						task_moment = moment(task.get('date')).day("Monday").week();
						break;
					case 'month':
						task_moment = moment(task.get('date')).month();
						break;
					case 'year':
						task_moment = moment(task.get('date')).year();
						break;
				}

				current_moment = current_moment || task_moment;

				tasks_by_moments[task_moment] = tasks_by_moments[task_moment] || {};
				tasks_by_moments[task_moment].tasks_list = tasks_by_moments[task_moment].tasks_list || [];

				current_project_id = task.get('project_id');

				tasks_by_moments[task_moment].by_project = tasks_by_moments[task_moment].by_project || {};

				tasks_by_moments[task_moment].by_project[current_project_id] = tasks_by_moments[task_moment].by_project[current_project_id] || {};

				tasks_by_moments[task_moment].by_project[current_project_id].sum = tasks_by_moments[task_moment].by_project[current_project_id].sum || 0;
				tasks_by_moments[task_moment].by_project[current_project_id].sum += parseInt(task.get('time'));

				tasks_by_moments[task_moment].tasks_list.push(task);

				if (current_moment != task_moment) {
					current_moment = task_moment;
				}
			});

			return {'tasks_by_moments':tasks_by_moments, 'moment_list':moment_list};
		}

		function renderChart (tasks_filtered, period_count_day, period) {

		    var moment_list = [],
		    	tasks_bar_series = [],
		    	tasks_bar_series1 = [],
		    	tickInterval,
		    	projects_detailed = {},
		    	projectsDetailedView,
		    	period_total_time = 0,
		    	tasksList,
		    	tasks_by_moments;

			switch (true) {
				case period_count_day <= 31:
					tasksList = tasksListByMoment(tasks_filtered, 'day', period);
					tickInterval = 3600000; //1 hour
					break;
				case period_count_day > 31 && period_count_day <= 90:
					tasksList = tasksListByMoment(tasks_filtered, 'week', period);
					tickInterval = 3600000*12; 
					break;
				case period_count_day > 90 && period_count_day <= 730:
					tasksList = tasksListByMoment(tasks_filtered, 'month', period);
					tickInterval = 3600000*48; 
					break;
				case period_count_day > 730:
					tasksList = tasksListByMoment(tasks_filtered, 'year', period);
					tickInterval = 3600000*480; 
					break;
			}

			tasks_by_moments = tasksList.tasks_by_moments;
			moment_list = tasksList.moment_list;

			filter_task_list.forEach(function(task_name) {
				var item = {data: []};

				item.color = filter_task_list_colors[filter_task_list.indexOf( task_name )];
				item.name = task_name;

				$.each(tasks_by_moments, function(index, value) {
					var current_time = 0;

					value.tasks_list.forEach(function(task) {
						if (task_name == task.get('desc')) {
							current_time += parseInt(task.get('time'));
						}
					});

					item.data.push(current_time);
				});

				tasks_bar_series.push(item);
			});

	        $("#task-report-line").highcharts({
	            chart: {
	                type: 'line'
	            },
	            title: {
	                text:''
	            },
	            xAxis: {
	                categories: moment_list
	            },
	            yAxis: {
	                min: 0,
	                title: {
	                    text: 'Total times'
	                },
	                stackLabels: {
	                    enabled: true,
	                    style: {
	                        fontWeight: 'bold',
	                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
	                    },
		                formatter: function() {
		                    return msToTime(this.total);
		                }                    
	                },
		            labels: {
						formatter: function() {
						    var time = msToTime(this.value);
						    return time == '00' ? '' : time.substring(0, time.length - 6) + 'h';
						}
		            },
		            tickInterval: tickInterval
	            },
	            legend: {
	                align: 'top',
	                x: 0,
	                verticalAlign: 'top',
	                y: 0,
	                floating: false,
	                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
	                borderColor: '#CCC',
	                borderWidth: 1,
	                shadow: false
	            },
	            tooltip: {
	                formatter: function() {
	                	var time = msToTime(this.y);
	                	if (time == '00') time = 0;
	                    return '<b>'+ this.x +'</b><br/>'+ 
	                        this.series.name +': '+ time;
	                }
	            },
	            plotOptions: {
	                column: {
	                    stacking: 'normal',
	                    dataLabels: {
	                        enabled: false,
	                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
	                        style: {
	                            textShadow: '0 0 3px black, 0 0 3px black'
	                        },
			                formatter: function() {
			                    if (this.y != '00')  
			                    	return msToTime(this.y);
			                }	                        
	                    }
	                }
	            },
	            series: tasks_bar_series
	        });


		}


	}
});	