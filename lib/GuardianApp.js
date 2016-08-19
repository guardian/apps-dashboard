var GooglePlayScraper = require('google-play-scraper');
var AppStoreScraper= require('app-store-scraper');
var deasync = require('deasync');

var GuardianApp = {};

GuardianApp.getLatestAndroidBetaVersion = function() {
	return "4.7.767";
}

GuardianApp.getLatestAndroidAppId = function () {
	return "Guardian/" +  this.getLatestAndroidAppVersion();
}

GuardianApp.getLatestAndroidBetaAppId = function () {
	return "Guardian/" +  this.getLatestAndroidBetaVersion();
}

GuardianApp.getLatestAndroidAppVersion = function () {
	return this.getLatestAndroidApp().version;
}

GuardianApp.getLatestAndroidApp = function () {
	return deasync(this.getLatestAndroidAppAsync)();
}

GuardianApp.getLatestAndroidAppAsync = function (callback) {
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
