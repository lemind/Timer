$(function(){

	if ($(".summary-report").length) {

	    var tasks = new Tasks();
	    tasks.comparator = 'date'; //sort by date

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
	                "click .filter":  "filter", 
	            },
	            initialize: function() {

					var today = new Date(), 
						week_ago = new Date();

						week_ago.setDate(today.getDate()-6);						

					tasks.fetch({
						success: function (model, response) {
							console.log("tasks fetch success");

							filterByDate(week_ago, today);
						},
						error: function (model, response) {
						    console.log("tasks fetch error");
						}
					});

					$('#from').datepicker('setDate', week_ago);
					$('#to').datepicker('setDate', today);
	            },      
	            filter: function () {

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
			});

		var filters = new Filters();

		function filterByDate (start, end) {
			var	tasks_filtered = tasks.getTasksByDates(getFormatDate(start), getFormatDate(end)),
				period_count_day = moment(end).diff(moment(start), 'days', true) + 1;

			renderChart(tasks_filtered, period_count_day);

			FormTasksByTags(tasks_filtered, period_count_day);
		}	

		function tasksListByMoment (tasks_filtered, moment_size) {
		    var tasks_by_moments = {},
		    	moment_list = [],
		    	current_moment;

		    function addToMomentList (task_moment) {
		    	if (moment_size == 'month') {
		    		moment_list.push(moment.months(task_moment));
		    	} else {
		    		moment_list.push(task_moment);
		    	}
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
				}

				current_moment = current_moment || task_moment;
				moment_list.length == 0 && addToMomentList(task_moment);

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
					//moment_list.push(moment.months(task_moment));
					addToMomentList(task_moment);
				}
			});

			return {'tasks_by_moments':tasks_by_moments, 'moment_list':moment_list};
		}

		function renderChart (tasks_filtered, period_count_day) {

		    var moment_list = [],
		    	tasks_bar_series = [],
		    	tickInterval,
		    	projects_detailed = {},
		    	projectsDetailedView,
		    	period_total_time = 0,
		    	tasksList,
		    	tasks_by_moments;

			switch (true) {
				case period_count_day <= 31:
					tasksList = tasksListByMoment(tasks_filtered, 'day');
					tickInterval = 3600000; //1 hour
					break;
				case period_count_day > 31 && period_count_day <= 90:
					tasksList = tasksListByMoment(tasks_filtered, 'week');
					tickInterval = 3600000*12; //8 hours
					break;
				case period_count_day > 90:
					tasksList = tasksListByMoment(tasks_filtered, 'month');
					tickInterval = 3600000*48; //8 hours
					break;
			}

			tasks_by_moments = tasksList.tasks_by_moments;
			moment_list = tasksList.moment_list;

			//forming projects_detailed
			projects.forEach(function(project) {
				var item = {data: []};

				item.color = getProjectColor(project.get('color'));
				item.name = project.get('name').replace(/ +/,'_');
				item.id = project.get('id');

				projects_detailed[item.id] = projects_detailed[item.id] || {};
				projects_detailed[item.id].tasks_list = projects_detailed[item.id].tasks_list || {};

				$.each(tasks_by_moments, function(index, value) {
					value.tasks_list.forEach(function(task) {
						if (task.get('project_id') == project.get('id')) {
							projects_detailed[item.id].tasks_list[task.get('desc')] = projects_detailed[item.id].tasks_list[task.get('desc')] || {};
							projects_detailed[item.id].tasks_list[task.get('desc')].time = projects_detailed[item.id].tasks_list[task.get('desc')].time || 0;
							projects_detailed[item.id].tasks_list[task.get('desc')].time += parseInt(task.get('time'));

							projects_detailed[item.id].sum_time = projects_detailed[item.id].sum_time || 0;
							projects_detailed[item.id].sum_time += parseInt(task.get('time'));

							projects_detailed[item.id].color = projects_detailed[item.id].color || project.get('color');

							projects_detailed[item.id].name = projects_detailed[item.id].name || project.get('name');
						}
					});

				    if (value.by_project[item.id]) {
				    	item.data.push(value.by_project[item.id].sum);
				    } else {
				    	item.data.push(0);
				    }
				});

				tasks_bar_series.push(item);
			});

			var projects_detailed_pie = [],
				projects_detailed_pie_drilldown,
				pdp_series = {
					name: 'projects',
					colorByPoint: true,
					data: []
				},
				pdp_series_drilldown = {
					series: []
				};

			//prepare data to drilldown pie
			$.each(projects_detailed, function(key, project) {
				var data = [];

				if (!$.isEmptyObject(project.tasks_list)) {
					pdp_series.data.push({
		                id: key,
		                name: projects.get(key).get('name'),
		                y: project.sum_time,
		                drilldown: key,
		                color: getProjectColor(project.color)
					});

					$.each(project.tasks_list, function(key, task) {
						data.push([key, task.time]);
					});

					pdp_series_drilldown.series.push({
						id: key,
						data: data
					});

					period_total_time += project.sum_time;
				}
			});

			projectsDetailedView = new ProjectsDetailedView({
					projects: {
						projects_list: projects_detailed, 
						total_time: period_total_time
					}
				});


	        $("#summary-report-bar").highcharts({
	            chart: {
	                type: 'column'
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
	                    return '<b>'+ this.x +'</b><br/>'+
	                        this.series.name +': '+ msToTime(this.y) +'<br/>'+
	                        'Total: '+ msToTime(this.point.stackTotal);
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

			Highcharts.setOptions({
			    lang: {
			        drillUpText: '<- Back to {series.name}'
			    }
			});

	        // Create the drilldown chart
	        $('.projects-detailed-drilldown-pie').highcharts({
				chart: {
					type:'pie'
	            },        	
	            title: {
	                text: ''
	            },
	            subtitle: {
	                text: ''
	            },
	            plotOptions: {
	                pie: {
	                    allowPointSelect: true,
						animation: false,
	                    cursor: 'pointer',
	                    showInLegend: true,
	                    dataLabels: {
	                        enabled: true,
	                        formatter: function() {
	                            return this.percentage.toFixed(2) + '%';
	                        }
	                    }
	                }
	            },
	            legend: {
	                enabled: true,
	                layout: 'vertical',
	                align: 'right',
	                width: 250,
	                verticalAlign: 'top',
					borderWidth: 0,
	                useHTML: true,
					labelFormatter: function() {
						return '<div style="width:230px"><span style="float:left">' + this.name + '</span><span style="float:right">' + msToTime(this.y) + '</span></div>';
					},
					title: {
						text: '',
						style: {
							fontWeight: 'bold'
						}
					}
	            },
	            tooltip: {
	                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
		            formatter: function() {
		                return '<span style="color:' + this.color + '">' + this.key + '</span>: ' + msToTime(this.y);
		            }                
	            }, 
	            series: [pdp_series],
		        drilldown: pdp_series_drilldown

	        })
		}

		function FormTasksByTags (tasks_filtered, period_count_day) {

			var sum_time_tags = [];
		    //forming time task by tags
			tasks_filtered.forEach(function(task) {
				task.get('tags_ids_arr').forEach(function(tag_id) {
					if (!sum_time_tags[tag_id]) {
						sum_time_tags[tag_id] = {};
						sum_time_tags[tag_id].time = parseInt(task.get('time'));
						sum_time_tags[tag_id].time_average = parseInt(task.get('time')) / period_count_day;
					} else {
						sum_time_tags[tag_id].time += parseInt(task.get('time'));
						sum_time_tags[tag_id].time_average += parseInt(task.get('time')) / period_count_day;
					}
				});
				
			});

			tags.sort_by_name();

			sumTimeTagsView = new SumTimeTagsView({
					sum_time_tags: sum_time_tags,
					tags: tags
				});

		}

	}
});	