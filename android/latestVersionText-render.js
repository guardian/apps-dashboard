var GooglePlayScraper = require('google-play-scraper');
var fs = require('fs');
var Util = require('./Util.js')

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
	GooglePlayScraper.app({appId: 'com.guardian'})
	.then(function(app){
		console.log('Retrieved application: ' + app.version);
		callback(null, app.version, app.updated);
	})
	.catch(function(err){
		console.log('There was an error fetching the application!');
		callback(e);
	});
};

