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
		interval;

	function timer_start(time_current) {
		var start = new Date().getTime();

		time_current = typeof time_current !== 'undefined' ? time_current : 0;

		interval = setInterval(function () {
			timer_status = 1;
			time = new Date().getTime() - start + time_current;
			time_str = msToTime(time);
			$("span.time").text(time_str);
		}, 1000); //this will check in every 1 second
	}

	var Task = Backbone.Model.extend({});

	var Tasks = Backbone.Collection.extend({
		model: Task
	});

	var tasks = new Tasks();  	


	//event
	var timer_event = {};
	_.extend(timer_event, Backbone.Events);

	var Timer = Backbone.View.extend({
		el: $("#timer"), 
		events: {
			"click .start": "start", 
			"click .stop": "stop", 
			"click .pause": "pause" 
		},
		start: function () {

			$("button.start")
				.text('Stop')
				.addClass('stop')
				.removeClass('start');

			timer_start();

		},
		stop: function () {

			clearInterval(interval);

			if (tasks.length == 0) {
				task_id = 1;
			} else {
				task_id = tasks.at(tasks.length - 1).id + 1;
			}

			tasks.add(new Task({
				id: 		task_id, 
				time: 		time, 
				time_str: 	time_str, 
				desc: 		$("input.task").val()
			}));

			console.log(JSON.stringify(tasks));

			$("button.stop")
				.text('Start')
				.addClass('start')
				.removeClass('stop');
			$("button.pause").removeClass('active');

			var taskListView = new TaskListView({tasks: tasks});

			$("input.task").val('');
			$("span.time").text('');
			task_id = null;
			time = null;
			time_str = '';
			timer_status = 0;

		},
		pause: function () {
			timer_status ? clearInterval(interval) : timer_start(time);

			$("button.pause").toggleClass('active');

			timer_status = !timer_status;
		}

	});

	var timer = new Timer();

});


