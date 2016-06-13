var GooglePlayScraper = require('google-play-scraper');

var GuardianApp = {};

GuardianApp.getLatestAndroidVersion = function (callback) {
	GooglePlayScraper.app({appId: 'com.guardian'})
	.then(function(app){
		console.log('Retrieved application: ' + app.version);
		callback(null, {version:app.version, releaseDate:app.updated});
	})
	.catch(function(err){
		console.log('There was an error fetching the application!' + err.message);
		callback(err);
	});
}

module.exports = GuardianApp;
