var GooglePlayScraper = require('google-play-scraper');
var AppStoreScraper= require('app-store-scraper');
var deasync = require('deasync');

var GuardianApp = {};

GuardianApp.getLatestAndroidVersion = function () {
	return deasync(this.getLatestAndroidVersionAsync)();
}

GuardianApp.getLatestAndroidVersionAsync = function (callback) {
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

GuardianApp.getLatestiOSVersionAsync = function (callback) {
	AppStoreScraper.app({id: '409128287'})
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
