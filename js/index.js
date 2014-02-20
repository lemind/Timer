$(function(){

	function msToTime(s) {
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;

		if (secs < 10) secs = '0' + secs;
		if (mins < 10) mins = '0' + mins;

		if (hrs > 0) {
			return hrs + ':' + mins + ':' + secs;
		} else if (mins > 0) {
			return mins + ':' + secs;
		} else {
			return secs;
		}
	}

	//project start

	var Project = Backbone.Model.extend({
		urlRoot: 'project'
	});

	var Projects = Backbone.Collection.extend({
		model: Project,
		url: 'projects'
	});

	var projects = new Projects(),
		last_new_project;


	var results = [];

	function project_select2_init () {

		projects.fetch({
		    success: function (model, response) {
		        console.log("projects fetch success");

				$('#project').select2({
					placeholder: "Select project",
					quietMillis: 100,
					data: function() { return {results: projects.toJSON()}; },
					// ajax: {
					// 	url: 'projects',
					// 	dataType: 'json',
					// 	type: 'GET',
					// 	// data: function (term) {
					// 	// 	// return {
					// 	// 	// 	term: term
					// 	// 	// };
					// 	// },
					// 	results: function (data) {
					// 		results = data;

					// 		return {
					// 			results: data
					// 		};
					// 	}
					// },
					formatResult: function(post) {
						return post.name;
					},
					formatSelection: function(post) {
						return post.name;
					},
				    createSearchChoice: function (term) {
				        return { id: 0, name: term };
				    }	
				}).on("select2-selecting", function(e) {

					if (e.val == 0) {

						var new_project = new Project({
							name: e.object.name
						});


						console.log('new project '+JSON.stringify(new_project));

						new_project.save(null, {
						    success: function (model, response) {
						    	projects.add(new Project(response));

						        last_new_project = response;
						    },
						    error: function (model, response) {
						        console.log("save new project error");
						    }
						});
					}

				});

		    },
		    error: function (model, response) {
		        console.log("projects fetch error");
		    }
		});

	}

	var time_str, 
		task_id, 
		time,
		timer_status,
		interval,
		current_task_id;

	function timer_start(time_current) {
		var start = new Date().getTime();

		time_current = typeof time_current !== 'undefined' ? time_current : 0;

		interval = setInterval(function () {
			timer_status = 1;
			time = new Date().getTime() - start + parseInt(time_current);

			time_str = msToTime(time);
			$("span.time").text(time_str);
		}, 1000); //this will check in every 1 second
	}

	function after_task_save () {
		$(".main button.stop")
			.text('Start')
			.addClass('start')
			.removeClass('stop');
		$(".main button.pause").removeClass('active');

		console.log('after_task_save');
		console.log(projects);
		var taskListView = new TaskListView({tasks: tasks, projects: projects});

		$("input.task").val('');
		$("span.time").text('');
		$("#project").select2('data', '');
		task_id = null;
		time = null;
		time_str = '';
		timer_status = 0;
	}

	var Task = Backbone.Model.extend({
		urlRoot: 'task'
	});

	var Tasks = Backbone.Collection.extend({
		model: Task,
		url: 'tasks'
	});

	var tasks = new Tasks();

	var Timer = Backbone.View.extend({
		el: $("#timer"), 
		events: {
			"click .main .start": 	"start", 
			"click .main .stop": 	"stop", 
			"click .main .pause": 	"pause", 
			"click .tasks .start": 	"old_task_start",
			"click .tasks .delete":	"delete_task" 
		},
		initialize: function() {
			tasks.fetch({
			    success: function (model, response) {
			        console.log("tasks fetch success");

					project_select2_init();
					
					setTimeout(function() {
						var taskListView = new TaskListView({tasks: tasks, projects: projects});
					}, 200);					
			    },
			    error: function (model, response) {
			        console.log("error");
			    }
			});
		},		
		start: function () {

			if (!$("#project").select2('data')) $("#project").select2('data', {id: 1, name: 'no project'});

			$(".main button.start")
				.text('Stop')
				.addClass('stop')
				.removeClass('start');

			current_task_id = 0;

			timer_start();

		},
		stop: function () {

			var selected_project = $("#project").select2('data');

			clearInterval(interval);

			selected_project.id == 0 ? selected_project = last_new_project : selected_project;

			if (current_task_id == 0) {

				var new_task = new Task({
					time: 		time, 
					time_str: 	time_str, 
					project_id:	selected_project.id, 
					desc: 		$("input.task").val()
				});

				new_task.save(null, {
				    success: function (model, response) {
				    	tasks.add(new Task(response));

						after_task_save();
				    },
				    error: function (model, response) {
				        console.log("error");
				    }
				});

			} else {
				tasks.get(current_task_id).set({
					time: 		time,
					time_str: 	time_str,
					project_id:	selected_project.id,
					desc: 		$("input.task").val()
				}).save(null, {
				    success: function (model, response) {
						after_task_save();
				    },
				    error: function (model, response) {
				        console.log("error");
				    }
				});
			}

		},
		pause: function () {
			timer_status ? clearInterval(interval) : timer_start(time);

			$(".main button.pause").toggleClass('active');

			timer_status = !timer_status;
		},
		old_task_start: function (ev) {

			if(timer_status) {
				this.stop();
			}

			var el_task_line = $(ev.target).parent().parent();

			el_task_line.css('background-color', 'khaki');

			current_task_id = el_task_line.attr("id");

			var task = tasks.get(current_task_id);

			$(".main button.start")
				.text('Stop')
				.addClass('stop')
				.removeClass('start');

			$(".task" + current_task_id).css('background-color', 'khaki');
			$(".task" + current_task_id + ' .start').remove();

			console.log('toshonada');
			$("input.task").val(task.get('desc'));
			$("#project").select2('data', {id: task.get('project_id'), name: projects.get(task.get('project_id')).get('name')});

			timer_start(task.get('time'));

		},		
		delete_task: function (ev) {

			if(timer_status) {
				this.stop();
			}

			var el_task_line = $(ev.target).parent().parent();

			current_task_id = el_task_line.attr("id");

			if (confirm('Are you sure you want to delete this task?')) {

				tasks.get(current_task_id).destroy({
				    success: function (model, response) {

				    	console.log(response);
				        console.log("delete_success");

 						$(".task" + current_task_id).remove();

				    },
				    error: function (model, response) {
				        console.log("error");
				    }
				});
			}

		},

	});

	var timer = new Timer();

});


