var GooglePlayScraper = require('google-play-scraper');
var AppStoreScraper= require('app-store-scraper');
var google = require('googleapis');
var key = require('./secret.json');
var deasync = require('deasync');

var GuardianApp = {};

GuardianApp.getLatestAndroidBetaVersion = function() {
	return "4.7." + this.getLatestAndroidBeta().version;
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

GuardianApp.getLatestAndroidBeta = function() {
	return deasync(this.getLatestAndroidBetaAsync)();

}

GuardianApp.getLatestAndroidBetaAsync = function (callback) {
	// here, we'll initialize our client
	var OAuth2 = google.auth.OAuth2;
	var oauth2Client = new OAuth2();
	var play = google.androidpublisher({
		version: 'v2',
		auth: oauth2Client,
		params: {
			packageName: 'com.guardian'
		}
	});
	google.options({ auth: oauth2Client });


	// editing "scope" allowed for OAuth2
	var scopes = ['https://www.googleapis.com/auth/androidpublisher'];
	var jwtClient = new google.auth.JWT(key.client_email, null, key.private_key, scopes, null);
	jwtClient.authorize(function(err, tokens) {
		if(err) callback(err)

		oauth2Client.setCredentials(tokens);
		// any unique id will do; a timestamp is easiest
		var editId = ''+(new Date().getTime());

		play.edits.insert({resource: {id: editId, expiryTimeSeconds: 600}}, 
		function(err, edit) {
			if(err) callback(err)

			play.edits.tracks.list({editId: edit.id}, function(err, res) {
				if(err || !res) callback(err)
				callback(null, {version: res.tracks[1].versionCodes[0]});
			});
		});
	});

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
