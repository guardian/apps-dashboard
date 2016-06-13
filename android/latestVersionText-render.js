var fs = require('fs');
var Util = require('./Util.js')
var GuardianApp = require('../lib/GuardianApp.js');

generateText(function(err, version, releaseDate) {
	if(err) {
		throw err;
	}

	var js = '$("#latestVersionText").text("' + version + '");';
	js += '$("#releaseDate").text("' + Util.dayOfMonth(releaseDate) + '");';
	js += '$("#releaseDays").text("' + Util.daysSince(releaseDate) + '");';
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
	GuardianApp.getLatestAndroidVersion(function(err, app){
		callback(err, app.version, app.releaseDate);
	});
};

