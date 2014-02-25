$(function(){

	var projects = new Projects(),
		last_new_project,
		last_new_tags = [],
		time_str,  
		time,
		timer_status,
		interval,
		current_task_id,
		tasks = new Tasks(),
		tags = new Tags(),

		timer = 				$("#timer"),
		main_select2_projects = $("#projects"),
		main_select2_tags = 	$("#tags"),
		main_time = 			$("span.time"),
		input_task_name = 		$("input.task"),
		main_button_start = 	$(".main button.start")
		main_button_stop = 		(function() { return $(".main button.stop"); }),
		main_button_pause = 	$(".main button.pause"),
		project_select2_str = 	'project-select2',
		tags_select2 = 			'tags-select2',
		input_desc = 			'input_desc',

 		project_select2_params = {
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
		},

		tags_select2_params = {
			placeholder: "Select tags",
			quietMillis: 100,
			multiple: true,
			data: function() { return {results: tags.toJSON()}; },
			formatResult: function(post) {
				return post.name;
			},
			formatSelection: function(post) {
				return post.name;
			},
		    createSearchChoice: function (term) {
		        return { id: term, name: term, fl: 'new' };
		    }
		};

	$('html').click(function() {
		if ($("." + project_select2_str).length > 0) {
			$("." + project_select2_str).remove();
		}

		$("." + tags_select2).length > 0 && task_tags_update($("." + tags_select2).parent().attr("task_id"), $("." + tags_select2).select2('data'));

		$("." + input_desc).length > 0 && task_desc_update($("." + input_desc).parents(".task").attr("id"), $("." + input_desc + " input").val());
	});

	function task_update (id, arg, cb) {
		var task = tasks.get(id);

		task.set(arg).save(null, {
		    success: function (model, response) {
		    	typeof cb == "function" && cb.call();
				console.log('task update');
		    },
		    error: function (model, response) {
		        console.log("error: task update");
		    }
		});
	}	

	//todo fix this
	function task_view_render () {
		var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});
	}

	function create_project (name) {
		var new_project = new Project({
				name: name,
				color: Math.floor(Math.random() * 9)
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

	 function create_tag (name) {
		var new_tag = new Tag({
			name: name,
			color: Math.floor(Math.random() * 9)
		});

		new_tag.save(null, {
		    success: function (model, response) {
		    	tags.add(new Tag(response));
		    	last_new_tags.push(response.id);
		    },
		    error: function (model, response) {
		        console.log("error: save new tag");
		    }
		});
	 }

	function task_tags_update(task_id, selected_tags) {

		var tags_ids_arr = [];

		$("." + tags_select2).remove();

		if (selected_tags.length > 0) {
			selected_tags.forEach(function(tag) {
				if (tag.fl != 'new') tags_ids_arr.push(tag.id);
			});
		}

		if (last_new_tags.length) {
			tags_ids_arr = tags_ids_arr.concat(last_new_tags);	
			last_new_tags = [];
		}

		if (task_id)
			task_update(task_id, {tags: tags_ids_arr.join()}, task_view_render);

	};

	function task_desc_update(task_id, new_desc) {

		$("." + input_desc).remove();

		task_update(task_id, {desc: new_desc}, task_view_render);

	};

	function projects_select2_init () {

		projects.fetch({
		    success: function (model, response) {
		        console.log("projects fetch success");

				main_select2_projects.select2(project_select2_params).on("select2-selecting", function(e) {

					e.val == 0 && create_project(e.object.name);

				});

		    },
		    error: function (model, response) {
		        console.log("error: projects fetch");
		    }
		});

	}

	function tags_select2_init () {

		tags.fetch({
		    success: function (model, response) {
		        console.log("tags fetch success");

				main_select2_tags.select2(tags_select2_params).on("select2-selecting", function(e) {

					e.object.fl == 'new' && create_tag(e.object.name);

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

	function reset_variables () {

		main_button_stop.call()
			.text('Start')
			.addClass('start')
			.removeClass('stop');

		//if press save on timer pause
		main_button_pause.removeClass('active');

		var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});

		input_task_name.val('');
		main_time.text('');
		main_select2_projects.select2('data', '');
		main_select2_tags.select2('data', '');

		time = null;
		time_str = '';
		timer_status = 0;
	}

	var Timer = Backbone.View.extend({
		el: timer, 
		events: {
			"click .main .start": 		"start", 
			"click .main .stop": 		"stop", 
			"click .main .pause": 		"pause", 
			"click .tasks .start": 		"old_task_start",
			"click .tasks .delete":		"delete_task",
			"click .tasks .project":	"edit_project",
			"click .tasks .tags":		"edit_tags",
			"click .tasks .desc":		"editDesc" 
		},
		initialize: function() {

			tasks.fetch({
			    success: function (model, response) {
			        console.log("tasks fetch success");

					projects_select2_init();
					tags_select2_init();

					setTimeout(function() {
						var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});
					}, 200);
			    },
			    error: function (model, response) {
			        console.log("error: tasks fetch");
			    }
			});

		},		
		start: function () {

			!main_select2_projects.select2('data') && main_select2_projects.select2('data', {id: 1, name: 'no project'});

			main_button_start
				.text('Stop')
				.addClass('stop')
				.removeClass('start');

			current_task_id = 0;

			timer_start();

		},
		stop: function () {

			var selected_project = main_select2_projects.select2('data'),
				selected_tags = main_select2_tags.select2('data'),
				tags_ids_arr = [];

			selected_tags.forEach(function(tag) {
				if (tag.fl != 'new') tags_ids_arr.push(tag.id);
			});

			if (last_new_tags.length) {
				tags_ids_arr = tags_ids_arr.concat(last_new_tags);	
				last_new_tags = [];
			}

			clearInterval(interval);

			selected_project.id == 0 ? selected_project = last_new_project : selected_project;

			if (current_task_id == 0) {

				tasks.create(new Task({
						time: 			time, 
						time_str: 		time_str, 
						project_id:		selected_project.id, 
						desc: 			input_task_name.val(),
						tags:			tags_ids_arr.join(),
						date:			getCurrentDate()
					}), { 
						success: function (model, response) {
							reset_variables();
						},
						error: function (model, response) {
							console.log("error: new task save");
						}
					});

			} else {
				task_update(
					current_task_id, 
					{
						time: 			time,
						time_str: 		time_str,
						project_id:		selected_project.id,
						desc: 			input_task_name.val(),
						tags:			tags_ids_arr.join()
					},
					reset_variables
				);
			}

		},
		pause: function () {

			timer_status ? clearInterval(interval) : timer_start(time);

			main_button_pause.toggleClass('active');

			timer_status = !timer_status;

		},
		old_task_start: function (ev) {

			var tags_ids = [],
				current_task_tags = [],
				el_task_line,
				task;

			timer_status && this.stop();

			el_task_line = $(ev.target).parents('.task');

			current_task_id = el_task_line.attr("id");

			task = tasks.get(current_task_id);

			// set data new started task after current task stop
			setTimeout(function() {
				main_button_start
					.text('Stop')
					.addClass('stop')
					.removeClass('start');

				input_task_name.val(task.get('desc'));
				main_select2_projects.select2('data', {id: task.get('project_id'), name: projects.get(task.get('project_id')).get('name')});

				if (task.get('tags')) {
					tags_ids = task.get('tags').split(',');

					tags_ids.forEach(function(id) {
						current_task_tags.push(tags.get(id).toJSON());
					});

					main_select2_tags.select2("data", current_task_tags);
				}

				if (getCurrentDate() > task.get('date')) {
					current_task_id = 0;
					timer_start();
				} else {
					$(".task" + current_task_id).css('background-color', 'khaki');
					$(".task" + current_task_id + ' .start').remove();
					timer_start(task.get('time'));					
				}

			}, 200);

		},		
		delete_task: function (ev) {

			var el_task_line = $(ev.target).parent().parent();

			selected_task_id = el_task_line.attr("id");

			if(selected_task_id == current_task_id) {
				timer_status && this.stop();
			}

			if (confirm('Are you sure you want to delete this task?')) {

				tasks.get(selected_task_id).destroy({
				    success: function (model, response) {
 						$(".task" + selected_task_id).remove();
				    },
				    error: function (model, response) {
				        console.log("error delete task");
				    }
				});
			}

		},
		edit_project: function (ev) {

			var el_task_line = $(ev.target),
				task_project_id;

			ev.stopPropagation();

			$("." + project_select2_str).remove();

			selected_task_id = el_task_line.attr("task_id");			

			task_project_id = tasks.get(selected_task_id).get('project_id');

			el_task_line.parent().append('<div class="' + project_select2_str + '"></div>');

			$("." + project_select2_str).select2(project_select2_params).on("select2-selecting", function(e) {

				var selected_project = e.object;

				e.val == 0 && create_project(e.object.name);

				setTimeout(function() {
					selected_project.id == 0 ? selected_project = last_new_project : selected_project;

					task_update(selected_task_id, {project_id: selected_project.id});

					$(".task" + selected_task_id + " ." + project_select2_str).remove();

					var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});
				}, 200);

			});

			$(".task" + selected_task_id + " ." + project_select2_str).select2('data', {id: task_project_id, name: projects.get(task_project_id).get('name')});

		},
		edit_tags: function (ev) {

			var tags_ids = [],
				current_task_tags = [],
				el_task_line,
				task;

			ev.stopPropagation();

			$("." + tags_select2).length > 0 && task_tags_update($("." + tags_select2).parent().attr("task_id"), $("." + tags_select2).select2('data'));			

			el_task_line = $(ev.target).hasClass("tags") ? $(ev.target) : $(ev.target).parents('.tags');

			selected_task_id = el_task_line.attr("task_id");
			el_task_line.append('<div class="' + tags_select2 + '"></div>');

			task = tasks.get(selected_task_id);

			$("." + tags_select2).select2(tags_select2_params).on("select2-selecting", function(e) {

				e.object.fl == 'new' && create_tag(e.object.name);

			});


			if (task.get('tags')) {
				tags_ids = task.get('tags').split(',');

				tags_ids.forEach(function(id) {
					current_task_tags.push(tags.get(id).toJSON());
				});

				$(".task" + selected_task_id + " ." + tags_select2).select2("data", current_task_tags);
			}

		},
		editDesc: function (ev) {

			var el_task_line = $(ev.target),
				task;

			ev.stopPropagation();

			$("." + input_desc).length > 0 && task_desc_update($("." + input_desc).parents(".task").attr("id"), $("." + input_desc + " input").val());

			selected_task_id = el_task_line.parents('.task').attr("id");

			task = tasks.get(selected_task_id);

			el_task_line.parent().append('<div class="' + input_desc + '"><input></div>');

			$("." + input_desc).click(function(ev) { ev.stopPropagation(); });

			$(".task" + selected_task_id + " ." + input_desc + " input").val(task.get('desc'));

		}

	});

	var timer = new Timer();

});


