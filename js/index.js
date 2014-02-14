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
			"click .tasks .start": 	"old_task_start" 
		},
		initialize: function() {
			tasks.fetch({
			    success: function (model, response) {
			    	//console.log(new_task.toJSON());
			    	//console.log(response);

			        console.log(" tasks fetch success");

					//console.log(JSON.stringify(tasks));

					var taskListView = new TaskListView({tasks: tasks});
			    },
			    error: function (model, response) {
			        console.log("error");
			    }
			});
		},		
		start: function () {

			$(".main button.start")
				.text('Stop')
				.addClass('stop')
				.removeClass('start');

			current_task_id = 0;

			timer_start();

		},
		stop: function () {

			clearInterval(interval);

			console.log('current_task_id' + current_task_id);

			if (current_task_id == 0) {
				if (tasks.length == 0) {
					task_id = 1;
				} else {
					task_id = tasks.at(tasks.length - 1).id + 1;
				}

				var new_task = new Task({
					///id: 		task_id, 
					time: 		time, 
					time_str: 	time_str, 
					desc: 		$("input.task").val()
				});


				//console.log(JSON.stringify(new_task));

				//tasks.add(new_task);

				new_task.save(null, {
				    success: function (model, response) {
				    	//console.log(new_task.toJSON());
				    	console.log(response);
				    	tasks.add(new Task(response));
				        console.log("success");

						console.log(JSON.stringify(tasks));

						$(".main button.stop")
							.text('Start')
							.addClass('start')
							.removeClass('stop');
						$(".main button.pause").removeClass('active');

						var taskListView = new TaskListView({tasks: tasks});

						$("input.task").val('');
						$("span.time").text('');
						task_id = null;
						time = null;
						time_str = '';
						timer_status = 0;

				    },
				    error: function (model, response) {
				        console.log("error");
				    }
				});

			} else {
				tasks.get(current_task_id).set({
					time: 		time,
					time_str: 	time_str,
					desc: 		$("input.task").val()
				}).save(null, {
				    success: function (model, response) {
				    	//console.log(new_task.toJSON());
				    	console.log(response);
				        console.log("_success");

						//console.log(JSON.stringify(tasks));

						$(".main button.stop")
							.text('Start')
							.addClass('start')
							.removeClass('stop');
						$(".main button.pause").removeClass('active');

						var taskListView = new TaskListView({tasks: tasks});

						$("input.task").val('');
						$("span.time").text('');
						task_id = null;
						time = null;
						time_str = '';
						timer_status = 0;

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

			$("input.task").val(task.get('desc'));

			timer_start(task.get('time'));

		},		

	});

	var timer = new Timer();

});


