colors = {
        tags: [
            'lightblue',
            'lightcoral',
            'lightgreen',
            'lightsteelblue',
            'lightpink',
            'lightsalmon',
            'lightseagreen',
            'lightslategray',
            'lightgray',
        ],
        projects: [
            'project1',
            'project2',
            'project3',
            'project4',
            'project5',
            'project6',
            'project7',
            'project8',
            'project9',
        ]
    };

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

function getFormatDate(date) {
	var date = (typeof date === "undefined") ? new Date() : date,
		dd = date.getDate(),
		mm = date.getMonth() + 1,
		yyyy = date.getFullYear();

	dd = dd < 10 ? '0' + dd : dd;
	mm = mm < 10 ? '0' + mm : dd;
	
	return yyyy + '-' + mm + '-' + dd;
}

function getProjectColor(id) {
	var colors = [
			'#66CDAA',
			'#7B68EE',
			'#FF4500',
			'#000080',
			'#DC143C',
			'#FFD700',
			'#BDB76B',
			'#8B008B',
			'#808000',
		]

	return colors[id];
}

function getPath(period) {
	console.log(period.b);
	console.log(moment.duration(period.b).asMilliseconds());
	console.log(period.e);
	console.log(moment.duration(period.e).asMilliseconds());

	dig_begin = (moment.duration(period.b).asMilliseconds() * 2 * Math.PI / 43200000) - Math.PI / 2;
	dig_end = (moment.duration(period.e).asMilliseconds() * 2 * Math.PI / 43200000) - Math.PI / 2;
	console.log('dig');
	console.log(dig_begin);
	console.log(dig_end);

	x_begin = 100 + 100 * Math.cos(dig_begin);
	y_begin = 100 + 100 * Math.sin(dig_begin);

	x_end = 100 + 100 * Math.cos(dig_end);
	y_end = 100 + 100 * Math.sin(dig_end);

	console.log('begin');
	console.log(x_begin);
	console.log(y_begin);


	console.log('end');
	console.log(x_end);
	console.log(y_end);

	console.log('path');
	console.log('M100,100 L' + x_begin + ',' + y_begin + ' A100,100 1 0,1 ' + x_end + ',' + y_end + ' z');
	//<path d="M100,100 L100,0 A100,100 1 0,1 150,13.3974596216 z" fill="green"></path>

	//moment.duration(period.b).asMilliseconds();
}