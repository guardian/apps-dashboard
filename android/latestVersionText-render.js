var fs = require('fs');
var Util = require('../lib/Util.js')
var GuardianApp = require('../lib/GuardianApp.js');

generateText(function(err, version, releaseDate) {
	if(err) {
		throw err;
	}

	var js = `
	$("#latestVersionText").text("${version}");
	$("#releaseDate").text("${Util.dayOfMonthAndWeek(releaseDate)}");
	$("#releaseDays").text("${Util.daysSince(releaseDate)}");
	`;
	var filename = "latestVersionText.js";
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function generateText(callback) {
	var app = GuardianApp.getLatestAndroidApp();
	callback(null, app.version, app.releaseDate);
};

