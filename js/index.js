$(function(){

	var projects = new Projects(),
		last_new_project,
		time_str,  
		time,
		timer_status,
		interval,
		current_task_id,
		tasks = new Tasks(),

		timer = 			$("#timer"),
		select2_project = 	$("#project"),
		main_time = 		$("span.time"),
		input_task_name = 	$("input.task"),
		main_button_start = $(".main button.start")
		main_button_stop = 	(function() { return $(".main button.stop"); }),
		main_button_pause = $(".main button.pause");

	function project_select2_init () {

		projects.fetch({
		    success: function (model, response) {
		        console.log("projects fetch success");

				select2_project.select2({
					placeholder: "Select project",
					quietMillis: 100,
					data: function() { return {results: projects.toJSON()}; },
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

						new_project.save(null, {
						    success: function (model, response) {
						    	projects.add(new Project(response));

						        last_new_project = response;
						    },
						    error: function (model, response) {
						        console.log("error: save new project");
						    }
						});
					}

				});

		    },
		    error: function (model, response) {
		        console.log("error: projects fetch");
		    }
		});

	}

	function timer_start(time_current) {

		var start = new Date().getTime();

		time_current = typeof time_current !== 'undefined' ? time_current : 0;

		interval = setInterval(function () {
			timer_status = 1;
			time = new Date().getTime() - start + parseInt(time_current);

			time_str = msToTime(time);
			main_time.text(time_str);
		}, 1000); //this will check in every 1 second
		
	}

	function after_task_save () {

		main_button_stop.call()
			.text('Start')
			.addClass('start')
			.removeClass('stop');

		//if press save on timer pause
		main_button_pause.removeClass('active');

		var taskListView = new TaskListView({tasks: tasks, projects: projects});

		input_task_name.val('');
		main_time.text('');
		select2_project.select2('data', '');

		time = null;
		time_str = '';
		timer_status = 0;

	}

	var Timer = Backbone.View.extend({
		el: timer, 
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
			        console.log("error: tasks fetch");
			    }
			});

		},		
		start: function () {

			!select2_project.select2('data') && select2_project.select2('data', {id: 1, name: 'no project'});

			main_button_start
				.text('Stop')
				.addClass('stop')
				.removeClass('start');

			current_task_id = 0;

			timer_start();

		},
		stop: function () {

			var selected_project = select2_project.select2('data');

			clearInterval(interval);

			selected_project.id == 0 ? selected_project = last_new_project : selected_project;

			if (current_task_id == 0) {

				var new_task = new Task({
					time: 		time, 
					time_str: 	time_str, 
					project_id:	selected_project.id, 
					desc: 		input_task_name.val()
				});

				new_task.save(null, {
				    success: function (model, response) {
				    	tasks.add(new Task(response));

						after_task_save();
				    },
				    error: function (model, response) {
				        console.log("error: new task save");
				    }
				});

			} else {
				tasks.get(current_task_id).set({
					time: 		time,
					time_str: 	time_str,
					project_id:	selected_project.id,
					desc: 		input_task_name.val()
				}).save(null, {
				    success: function (model, response) {
						after_task_save();
				    },
				    error: function (model, response) {
				        console.log("error: task save");
				    }
				});
			}

		},
		pause: function () {

			timer_status ? clearInterval(interval) : timer_start(time);

			main_button_pause.toggleClass('active');

			timer_status = !timer_status;

		},
		old_task_start: function (ev) {

			timer_status && this.stop();

			var el_task_line = $(ev.target).parent().parent();

			el_task_line.css('background-color', 'khaki');

			current_task_id = el_task_line.attr("id");

			var task = tasks.get(current_task_id);

			// set data new started task after current task stop
			setTimeout(function() {
				main_button_start
					.text('Stop')
					.addClass('stop')
					.removeClass('start');

				$(".task" + current_task_id).css('background-color', 'khaki');
				$(".task" + current_task_id + ' .start').remove();

				input_task_name.val(task.get('desc'));
				select2_project.select2('data', {id: task.get('project_id'), name: projects.get(task.get('project_id')).get('name')});

				timer_start(task.get('time'));
			}, 200);

		},		
		delete_task: function (ev) {

			var el_task_line = $(ev.target).parent().parent();

			select_task_id = el_task_line.attr("id");

			if(select_task_id == current_task_id) {
				timer_status && this.stop();
			}

			if (confirm('Are you sure you want to delete this task?')) {

				tasks.get(select_task_id).destroy({
				    success: function (model, response) {
 						$(".task" + select_task_id).remove();
				    },
				    error: function (model, response) {
				        console.log("error delete task");
				    }
				});
			}

		},

	});

	var timer = new Timer();

});


