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


	var Task = Backbone.Model.extend({});

	var Tasks = Backbone.Collection.extend({
		model: Task
	});

	var tasks = new Tasks();  	


	//event
	var timer_event = {};
	_.extend(timer_event, Backbone.Events);


	var Start = Backbone.View.extend({
	    el: $("#timer"), 
	    events: {
	        "click .start": "start", 
	        "click .stop": "stop" 
	    },
	    start: function () {

	    	var time_str, task_id, time;

			$("button.start").text('Stop');
			$("button.start").addClass('stop');
			$("button.start").removeClass('start');

	    	var start = new Date().getTime();

	    	function timer () {
	    		time = new Date().getTime() - start;
	    		time_str = msToTime(time);
	    		$("span.time").text(time_str);
	    	}

			var Interval = setInterval(function () {
				timer();
			}, 1000); //this will check in every 1 second

			timer_event.once("stop", function() {
				clearInterval(Interval);

			  	if (tasks.length == 0) {
			  		task_id = 1;
			  	} else {
			  		task_id = tasks.at(tasks.length - 1).id + 1;
			  	}

			  	tasks.add(new Task({id: task_id, time: time, time_str: time_str, desc: $("input.task").val()}));

			  	$("input.task").val('');
			  	$("span.time").text('');

				console.log(JSON.stringify(tasks));

			  	$("button.stop").text('Start');
				$("button.stop").addClass('start');
				$("button.stop").removeClass('stop');


				var TaskListView = Backbone.View.extend({
				    el: '.tasks',
				     
				    initialize:function(){
				        this.render();
				    },
				    render: function () {
				        var template = _.template($('#task-list-template').html(), {tasks: tasks.models});
				        this.$el.html(template);
				    }
				});
				var taskListView = new TaskListView();


			});


	    },
	    stop: function () {
			timer_event.trigger("stop");
	    }	    
	});


	var start = new Start();

}());