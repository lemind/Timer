$(function(){

	if ($(".summary-report").length) {

	    var tasks_by_days = {},
	    	day_list = [],
	    	tasks_bar_series = [],
	    	projects_detailed = {},
	    	current_day,
	    	projectsDetailedView;

		//period
	    $( "#from" ).attr("placeholder", "period start").datepicker({
	      defaultDate: "+1w",
	      changeMonth: true,
	      dateFormat: 'dd.mm.yy',
	      numberOfMonths: 3,
	      onClose: function( selectedDate ) {
	        $( "#to" ).datepicker( "option", "minDate", selectedDate );
	      }
	    });
	    $( "#to" ).attr("placeholder", "period end").datepicker({
	      defaultDate: "+1w",
	      changeMonth: true,
	      dateFormat: 'dd.mm.yy',
	      numberOfMonths: 3,
	      onClose: function( selectedDate ) {
	        $( "#from" ).datepicker( "option", "maxDate", selectedDate );
	      }
	    });

		tasks.forEach(function(task) {
			var task_date = task.get('date'),
				current_project_name;

			current_day = current_day || task_date;
			day_list.length == 0 && day_list.push(task_date);

			tasks_by_days[task_date] = tasks_by_days[task_date] || {};
			tasks_by_days[task_date].tasks_list = tasks_by_days[task_date].tasks_list || [];

			current_project_name = projects.get(task.get('project_id')).get('name');

			tasks_by_days[task_date].by_project = tasks_by_days[task_date].by_project || {};
			tasks_by_days[task_date].by_project[current_project_name] = tasks_by_days[task_date].by_project[current_project_name] || {};

			tasks_by_days[task_date].by_project[current_project_name].sum = tasks_by_days[task_date].by_project[current_project_name].sum || 0;

			tasks_by_days[task_date].by_project[current_project_name].sum += parseInt(task.get('time'));

			tasks_by_days[task_date].tasks_list.push(task);

			if (current_day != task_date) {
				current_day = task_date;
				day_list.push(task_date);
			}
		});

		console.log(tasks_by_days);

		projects.forEach(function(project) {
			var item = {data: []};

			item.color = getProjectColor(project.get('color'));
			item.name = project.get('name');

			projects_detailed[item.name] = projects_detailed[item.name] || {};
			projects_detailed[item.name].tasks_list = projects_detailed[item.name].tasks_list || {};

			$.each(tasks_by_days, function(index, value) {

				value.tasks_list.forEach(function(task) {
					if (task.get('project_id') == project.get('id')) {
						projects_detailed[item.name].tasks_list[task.get('desc')] = projects_detailed[item.name].tasks_list[task.get('desc')] || {};
						projects_detailed[item.name].tasks_list[task.get('desc')].time = projects_detailed[item.name].tasks_list[task.get('desc')].time || 0;
						projects_detailed[item.name].tasks_list[task.get('desc')].time += parseInt(task.get('time'));

						projects_detailed[item.name].sum_time = projects_detailed[item.name].sum_time || 0;
						projects_detailed[item.name].sum_time += parseInt(task.get('time'));
					}
				});

			    if (value.by_project[item.name]) {
			    	item.data.push(value.by_project[item.name].sum);
			    } else {
			    	item.data.push(0);
			    }
			});

			tasks_bar_series.push(item);
		});

		//console.log(tasks_bar_series);
		console.log(projects_detailed);

		projectsDetailedView = new ProjectsDetailedView({projects: projects_detailed});


        $("#summary-report-bar").highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text:''
            },
            xAxis: {
                categories: day_list
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
	            tickInterval: 3600000 //1 hour
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
                        }
                    }
                }
            },
            series: tasks_bar_series
        });


	}
});	