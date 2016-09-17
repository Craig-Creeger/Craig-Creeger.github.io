$(document).ready(function(e) {
	//Assumes you already have jQuery loaded.
	//Assumes there is a table with id="assignments" and the first column contains valid dates
	var colDate;
	$rows = $('#assignments tr');
	for (var i = $rows.length - 1; i > 0; i--) {
		colDate = Date.parse($($rows[i]).children('td:first').text())
		if (colDate <= Date.today()) {
			$($rows[i]).attr('id','addendumCurrentWeek');
			break;
		}
	}
});
