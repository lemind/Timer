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
