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

		timer = 			$("#timer"),
		select2_projects = 	$("#projects"),
		select2_tags = 		$("#tags"),
		main_time = 		$("span.time"),
		input_task_name = 	$("input.task"),
		main_button_start = $(".main button.start")
		main_button_stop = 	(function() { return $(".main button.stop"); }),
		main_button_pause = $(".main button.pause");

	$('html').click(function() {
		console.log('all popups remove');
		if ($(".project-select2").select2('data').length > 0) {
			$(".project-select2").remove();
		}

		if ($(".tags-select2").select2('data').length > 0) {
			task_tags_update($(".tags-select2").parent().attr("task_id"), $(".tags-select2").select2('data'));
			$(".tags-select2").remove();
		}
	});

	function task_tags_update(task_id, selected_tags) {

		var tags_ids_arr = [];

		selected_tags.forEach(function(tag) {
			if (tag.fl != 'new') tags_ids_arr.push(tag.id);
		});

		if (last_new_tags.length) {
			tags_ids_arr = tags_ids_arr.concat(last_new_tags);	
			last_new_tags = [];
		}

		tasks.get(task_id).set({
			tags: tags_ids_arr.join()
		}).save(null, {
		    success: function (model, response) {
				console.log('task / tags update success');
				console.log(response);
				var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});
		    },
		    error: function (model, response) {
		        console.log("error: task save");
		    }
		});

	};

	function projects_select2_init () {

		projects.fetch({
		    success: function (model, response) {
		        console.log("projects fetch success");

				select2_projects.select2({
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
							name: e.object.name,
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

				select2_tags.select2({
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
				}).on("select2-selecting", function(e) {

					if (e.object.fl == 'new') {

						var new_tag = new Tag({
							name: e.object.name,
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

		var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});

		input_task_name.val('');
		main_time.text('');
		select2_projects.select2('data', '');
		select2_tags.select2('data', '');

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
			"click .tasks .tags":		"edit_tags" 
		},
		initialize: function() {

			tasks.fetch({
			    success: function (model, response) {
			        console.log("tasks fetch success");

					projects_select2_init();
					tags_select2_init();

					//todo move to model
					tasks.forEach(function(task) {
						if (task.get('tags')) {
							var tags_ids_arr = $.map(task.get('tags').split(','), function(val){
							    return parseInt(val);
							});

							tasks.get(task.id).set({'tags_ids_arr': tags_ids_arr});
						}
					});
					
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

			!select2_projects.select2('data') && select2_projects.select2('data', {id: 1, name: 'no project'});

			main_button_start
				.text('Stop')
				.addClass('stop')
				.removeClass('start');

			current_task_id = 0;

			timer_start();

		},
		stop: function () {

			var selected_project = select2_projects.select2('data');
			var selected_tags = select2_tags.select2('data');
			var tags_ids_arr = [];

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

				var new_task = new Task({
					time: 			time, 
					time_str: 		time_str, 
					project_id:		selected_project.id, 
					desc: 			input_task_name.val(),
					tags:			tags_ids_arr.join()
				});

				new_task.save(null, {
				    success: function (model, response) {
						var tags_ids_arr = $.map(response.tags.split(','), function(val){
							return parseInt(val);
						});

						response.tags_ids_arr = tags_ids_arr;

				    	tasks.add(new Task(response));

						after_task_save();
				    },
				    error: function (model, response) {
				        console.log("error: new task save");
				    }
				});

			} else {
				tasks.get(current_task_id).set({
					time: 			time,
					time_str: 		time_str,
					project_id:		selected_project.id,
					desc: 			input_task_name.val(),
					tags:			tags_ids_arr.join()
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

			var tags_ids = [],
				current_task_tags = [];

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
				select2_projects.select2('data', {id: task.get('project_id'), name: projects.get(task.get('project_id')).get('name')});

				if (task.get('tags')) {
					tags_ids = task.get('tags').split(',');

					tags_ids.forEach(function(id) {
						current_task_tags.push(tags.get(id).toJSON());
					});

					select2_tags.select2("data", current_task_tags);
				}

				timer_start(task.get('time'));
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
			ev.stopPropagation();
			$(".project-select2").remove();

			var el_task_line = $(ev.target).parent();

			selected_task_id = el_task_line.attr("id");			

			var task = tasks.get(selected_task_id);

			$(ev.target).append('<div class="project-select2"></div>');

			$(".project-select2").select2({
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

				var selected_project = e.object;

				if (e.val == 0) {

					var new_project = new Project({
						name: e.object.name,
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

				setTimeout(function() {
					selected_project.id == 0 ? selected_project = last_new_project : selected_project;

					task.set({
						project_id:	selected_project.id
					}).save(null, {
					    success: function (model, response) {
							console.log('task project update');
					    },
					    error: function (model, response) {
					        console.log("error: task project update");
					    }
					});

					$(".task" + selected_task_id + " .project-select2").remove();

					var taskListView = new TaskListView({tasks: tasks, projects: projects, tags: tags});
				}, 200);

			});

			$(".task" + selected_task_id + " .project-select2").select2('data', {id: task.get('project_id'), name: projects.get(task.get('project_id')).get('name')});

		},
		edit_tags: function (ev) {
			ev.stopPropagation();
			$(".tags-select2").remove();

			var tags_ids = [],
				current_task_tags = [];

			var el_task_line = $(ev.target);

			//todo fix it
			if (el_task_line.attr("task_id")) {
				selected_task_id = el_task_line.attr("task_id");
				el_task_line.append('<div class="tags-select2"></div>');
			} else {
				selected_task_id = el_task_line.parent().attr("task_id");
				el_task_line.parent().append('<div class="tags-select2"></div>');
			}

			var task = tasks.get(selected_task_id);

			$(".tags-select2").select2({
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
			}).on("select2-selecting", function(e) {

				if (e.object.fl == 'new') {

					var new_tag = new Tag({
						name: e.object.name,
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

			});


			if (task.get('tags')) {
				tags_ids = task.get('tags').split(',');

				tags_ids.forEach(function(id) {
					current_task_tags.push(tags.get(id).toJSON());
				});

				$(".task" + selected_task_id + " .tags-select2").select2("data", current_task_tags);
			}

		}

	});

	var timer = new Timer();

});


