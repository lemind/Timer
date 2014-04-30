function pathInfoUpdate() {
	setTimeout(function() {
		$('path.info').tooltip({container:'body'});
	}, 100);
}

$( document ).ready(function() {
	pathInfoUpdate();
});