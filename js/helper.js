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

function getPath(period, color) {
	if (period.b && period.e) {
		var period_begin_millsec = moment.duration(period.b).asMilliseconds(),
			period_end_millsec = moment.duration(period.e).asMilliseconds(),
			twelve_hours_millsec = 43200000,
			meridiem = 0, // 0 - am(ante meridiem), 1 - pm(post meridiem), 2 - mix(begin am, end pm)
			diff_coordinates = 220, //different px between am and pm clock
			center_x = 100,
			result_path,
			large_arc_flag = 0; //0 - angle < 180, 1 - angle > 180

		if (period_begin_millsec > twelve_hours_millsec && period_end_millsec > twelve_hours_millsec) {
			meridiem = 1;
			period_begin_millsec = period_begin_millsec - twelve_hours_millsec;
			period_end_millsec = period_end_millsec - twelve_hours_millsec;
		} else if (period_begin_millsec < twelve_hours_millsec && period_end_millsec > twelve_hours_millsec) {
			meridiem = 2;
			period_end_millsec = period_end_millsec - twelve_hours_millsec;
		}

		if (((period_end_millsec - period_begin_millsec > twelve_hours_millsec / 2)) && meridiem != 2) {
			large_arc_flag = 1;
		}

		dig_begin = (period_begin_millsec * 2 * Math.PI / twelve_hours_millsec) - Math.PI / 2;
		dig_end = (period_end_millsec * 2 * Math.PI / twelve_hours_millsec) - Math.PI / 2;

		x_begin = 100 + 100 * Math.cos(dig_begin);
		y_begin = 100 + 100 * Math.sin(dig_begin);

		x_end = 100 + 100 * Math.cos(dig_end);
		y_end = 100 + 100 * Math.sin(dig_end);

		if (meridiem != 2) {
			if (meridiem == 1) {
				x_begin += diff_coordinates;
				x_end += diff_coordinates;
				center_x += diff_coordinates;
			}

			result_path = '<path d="M' + center_x + ',100 L' + x_begin + ',' + y_begin + ' A100,100 0 ' + large_arc_flag + ' 1 ' + x_end + ',' + y_end + ' z" fill="' + color + '"></path>';
		} else {

			result_path = '<path d="M' + center_x + ',100 L' + x_begin + ',' + y_begin + ' A100,100 0 ' + large_arc_flag + ' 1 100,0 z" fill="' + color + '"></path>';
			x_end += diff_coordinates;
			center_x += diff_coordinates;
			result_path += '<path d="M' + center_x + ',100 L320,0 A100,100 0 ' + large_arc_flag + ' 1 ' + x_end + ',' + y_end + ' z" fill="' + color + '"></path>';
		}

		return result_path;
	} else return '';
}