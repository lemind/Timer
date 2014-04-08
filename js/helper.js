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