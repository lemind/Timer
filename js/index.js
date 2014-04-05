$(function(){

	if ($("#timer").length) {

		var last_new_project,
			time_str,  
			time,
			timer_status,
			interval,
			current_task_id,
			pause_status = 0,
			tasks = new Tasks(),

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
			editing = 				'editing',

	 		project_select2_params = {
				placeholder: "Select project",
				quietMillis: 100,
				data: function() { return {results: projects.toJSON(), text: 'name'}; },
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
				data: function() { return {results: tags.toJSON(), text: 'name'}; },
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

			$("." + tags_select2).length > 0 && taskTagsUpdate($("." + tags_select2).parent().attr("task_id"), $("." + tags_select2).select2('data'));

			$("." + input_desc).length > 0 && taskDescUpdate($("." + input_desc).parents(".task").attr("id"), $("." + input_desc + " input").val());
		});

		$('html').keyup(function(ev) { 
			ev.which == 27 && $("." + editing).remove();
		});

		function taskUpdate (id, arg, cb) {
			var task = tasks.get(id);

			task.set(arg).save(null, {
			    success: function (model, response) {
			    	typeof cb == "function" && cb.call();
					console.log('task update');
					console.log(response);
			    },
			    error: function (model, response) {
			        console.log("error: task update");
			    }
			});
		}	

		function createProject (name) {
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

		 function createTag (name, select2) {
			var new_tag = new Tag({
					name: name,
					color: Math.floor(Math.random() * 9)
				});

			new_tag.save(null, {
			    success: function (model, response) {
					var selected_tags = select2.select2('data'),
						tags_ids_arr = [],
						current_task_tags = [];

			    	tags.add(new Tag(response));

					selected_tags.forEach(function(tag) {
						if (tag.fl != 'new') tags_ids_arr.push(tag.id);
					});

					tags_ids_arr.push(response.id);

					tags_ids_arr.forEach(function(id) {
						current_task_tags.push(tags.get(id).toJSON());
					});

					select2.select2("data", current_task_tags);

			    },
			    error: function (model, response) {
			        console.log("error: save new tag");
			    }
			});
		 }

		function taskTagsUpdate(task_id, selected_tags) {

			var tags_ids_arr = [];

			$("." + tags_select2).remove();

			if (selected_tags.length > 0) {
				selected_tags.forEach(function(tag) {
					if (tag.fl != 'new') tags_ids_arr.push(tag.id);
				});
			}

			if (task_id)
				taskUpdate(task_id, {
					tags: tags_ids_arr.join(),
					new_task: 0
				});

		};

		function taskDescUpdate(task_id, new_desc) {

			$("." + input_desc).remove();

			taskUpdate(task_id, {desc: new_desc});

		};

		function projectsSelect2Init () {

			main_select2_projects.select2(project_select2_params).on("select2-selecting", function(e) {

				e.val == 0 && createProject(e.object.name);

			}).on("change", function(e) {

				setTimeout(function() {
					taskUpdate(current_task_id, {
						project_id: main_select2_projects.select2('data').id,
						new_task: 0
					});
				}, 1000);

			});

		}

		function tagsSelect2Init () {

			main_select2_tags.select2(tags_select2_params).on("select2-selecting", function(e) {

				e.object.fl == 'new' && createTag(e.object.name, main_select2_tags);

			}).on("change", function(e) {

				//TODO fix getting select2 data
				setTimeout(function() {
					taskTagsUpdate(current_task_id, main_select2_tags.select2('data'));
				}, 1000);

			});

		}

		function timerStart(current_time, status) {

			var start = new Date().getTime();

			current_time = typeof current_time !== 'undefined' ? current_time : 0;

			if (!current_time) {

				var selected_project = main_select2_projects.select2('data'),
					selected_tags = main_select2_tags.select2('data'),
					tags_ids_arr = [];

				selected_tags.forEach(function(tag) {
					if (tag.fl != 'new') tags_ids_arr.push(tag.id);
				});

				selected_project.id == 0 ? selected_project = last_new_project : selected_project;

				tasks.create(new Task({
						status:		1,
						project_id:	selected_project.id, 
						desc: 		input_task_name.val(),
						tags:		tags_ids_arr.join(),
						date:		moment(new Date).format("YYYY-MM-DD")
					}), { 
						success: function (model, response) {
							console.log('new task');
							current_task_id = response.id;
						},
						error: function (model, response) {
							console.log("error: new task save");
						}
					});
			} else {
				if (!status) {
					taskUpdate(
						current_task_id, 
						{
							status:	1,
							new_task: 1
						}
					);
				}
			}

			interval = setInterval(function () {
				timer_status = 1;
				time = new Date().getTime() - start + parseInt(current_time);

				time_str = msToTime(time);
				main_time.text(time_str);
			}, 1000); //this will check in every 1 second

		}

		function taskStart (task_id) {
			var tags_ids = [],
				current_task_tags = [],
				task,
				periods;

			task = tasks.get(task_id);

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

			if (task.get('status') == 1) {
				current_task_id = task.get('id');
				periods = JSON.parse(task.get('periods'));

				timerStart(moment().diff(moment(periods[periods.length-1].b, "HH:mm:ss")) + parseInt(task.get('time')), 1);
			} else {
				current_task_id = task.get('id');

				//if today start old task else start new task
				if (task.get('date') == moment(new Date).format("YYYY-MM-DD")) {
					timerStart(task.get('time'), 0);
				} else {
					timerStart(0, 0);
				}
			}

		}

		function resetVariables () {

			main_button_stop.call()
				.text('Start')
				.addClass('start')
				.removeClass('stop');

			pause_status && main_button_pause.removeClass('active');
			pause_status = 0;

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
				"click .tasks .start": 		"oldTaskStart",
				"click .tasks .delete":		"deleteTask",
				"click .tasks .project":	"editProject",
				"click .tasks .tags":		"editTags",
				"click .tasks .desc":		"editDesc",
				"focusout input.task":		"updateTask"
			},
			initialize: function() {

				projectsSelect2Init();
				tagsSelect2Init();

				tasks.fetch({
					success: function (model, response) {
						console.log("tasks fetch success");

						var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});

						var active = tasks.find(function(model){ return model.get('status') == 1; });

						if (active) {
							var periods = JSON.parse(tasks.get(active.get('id')).get('periods'));
							taskStart(active.get('id'));
						}						
					},
					error: function (model, response) {
					    console.log("tasks fetch error");
					}
				});

				main_button_pause.attr("disabled", true);

			},		
			start: function () {
				main_button_pause.attr("disabled", false);

				!main_select2_projects.select2('data') && main_select2_projects.select2('data', {id: 1, name: 'no project'});

				main_button_start
					.text('Stop')
					.addClass('stop')
					.removeClass('start');

				current_task_id = 0;

				timerStart();

			},
			stop: function () {
				main_button_pause.attr("disabled", true);

				var selected_project = main_select2_projects.select2('data'),
					selected_tags = main_select2_tags.select2('data'),
					tags_ids_arr = [];

				selected_tags.forEach(function(tag) {
					if (tag.fl != 'new') tags_ids_arr.push(tag.id);
				});

				clearInterval(interval);

				selected_project.id == 0 ? selected_project = last_new_project : selected_project;

				taskUpdate(
					current_task_id, 
					{
						time: 		time,
						time_str: 	time_str,
						project_id:	selected_project.id,
						desc: 		input_task_name.val(),
						tags:		tags_ids_arr.join(),
						status:		0,
						end_period:	moment( new Date).format("HH:mm:ss")
					},
					resetVariables
				);

				current_task_id = 0;

			},
			pause: function () {

				timer_status ? clearInterval(interval) : timerStart(time, 0);

				main_button_pause.toggleClass('active');

				timer_status = !timer_status;

				pause_status = 1;

			},
			oldTaskStart: function (ev) {
				var el_task_line

				(pause_status || timer_status) && this.stop();

				main_button_pause.attr("disabled", false);

				el_task_line = $(ev.target).parents('.task');

				current_task_id = el_task_line.attr("id");

				// set data new started task after current task stop
				setTimeout(function() {
					console.log('2');

					taskStart(current_task_id);

				}, 1000);

			},		
			deleteTask: function (ev) {

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
			editProject: function (ev) {

				var el_task_line = $(ev.target),
					task_project_id;

				ev.stopPropagation();

				$("." + project_select2_str).remove();

				selected_task_id = el_task_line.attr("task_id");			

				task_project_id = tasks.get(selected_task_id).get('project_id');

				if (selected_task_id != current_task_id) {

					el_task_line.parent().append('<div class="' + project_select2_str + ' ' + editing + '"></div>');

					$("." + project_select2_str).select2(project_select2_params).on("select2-selecting", function(e) {

						var selected_project = e.object;

						e.val == 0 && createProject(e.object.name);

						setTimeout(function() {
							selected_project.id == 0 ? selected_project = last_new_project : selected_project;

							taskUpdate(selected_task_id, {project_id: selected_project.id});

							$(".task" + selected_task_id + " ." + project_select2_str).remove();
						}, 200);

					});

					$(".task" + selected_task_id + " ." + project_select2_str).select2('data', {id: task_project_id, name: projects.get(task_project_id).get('name')});
				}

			},
			editTags: function (ev) {

				var tags_ids = [],
					current_task_tags = [],
					el_task_line,
					task;

				ev.stopPropagation();

				$("." + tags_select2).length > 0 && taskTagsUpdate($("." + tags_select2).parent().attr("task_id"), $("." + tags_select2).select2('data'));			

				el_task_line = $(ev.target).hasClass("tags") ? $(ev.target) : $(ev.target).parents('.tags');

				selected_task_id = el_task_line.attr("task_id");

				if (selected_task_id != current_task_id) {

					el_task_line.append('<div class="' + tags_select2 + ' ' + editing + '"></div>');

					task = tasks.get(selected_task_id);

					$("." + tags_select2).select2(tags_select2_params).on("select2-selecting", function(e) {

						e.object.fl == 'new' && createTag(e.object.name, $("." + tags_select2));

					});


					if (task.get('tags')) {
						tags_ids = task.get('tags').split(',');

						tags_ids.forEach(function(id) {
							current_task_tags.push(tags.get(id).toJSON());
						});

						$(".task" + selected_task_id + " ." + tags_select2).select2("data", current_task_tags);
					}
				}

			},
			editDesc: function (ev) {

				var el_task_line = $(ev.target),
					task,
					input;

				ev.stopPropagation();

				$("." + input_desc).length > 0 && taskDescUpdate($("." + input_desc).parents(".task").attr("id"), $("." + input_desc + " input").val());

				selected_task_id = el_task_line.parents('.task').attr("id");

				if (selected_task_id != current_task_id) {

					task = tasks.get(selected_task_id);

					el_task_line.parent().append('<div class="' + input_desc + ' ' + editing + '"><input></div>');

					//set cursor
					input = $('.' + input_desc + ' input');
					input[0].selectionStart = input[0].selectionEnd = input.val().length;

					$("." + input_desc).click(function(ev) { ev.stopPropagation(); });

					$("." + input_desc).keypress(function(ev) { 
						ev.stopPropagation(); 
						ev.which == 13 && taskDescUpdate($("." + input_desc).parents(".task").attr("id"), $("." + input_desc + " input").val());
					});

					$(".task" + selected_task_id + " ." + input_desc + " input").val(task.get('desc'));
				}
			},
			updateTask: function (ev) {
				taskUpdate(current_task_id, {
					desc: input_task_name.val(),
					new_task: 0
				});
			}				

		});

		var timer = new Timer();
	}

});


