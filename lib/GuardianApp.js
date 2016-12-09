var GooglePlayScraper = require('google-play-scraper');
var AppStoreScraper= require('app-store-scraper');
var google = require('googleapis');
var key = require('./secret.json');
var deasync = require('deasync');
var GitHub = require('github-api');
var nconf = require('nconf');
nconf.file({ file: '../config.json' });
var github_username = nconf.get('github_username');
var github_token = nconf.get('github_token');

var GuardianApp = {};

GuardianApp.getLatestAndroidBetaVersion = function() {
	return this.getLatestAndroidBeta().version;
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
	return this.getLatestAndroidBetaAsync();

}

GuardianApp.getLatestAndroidBetaAsync = function (callback) {
	var versionCode = deasync(this.getVersionCodeCurrentlyInGooglePlayTrack)(1);
	var release = deasync(this.getReleaseDataFromGithub)(versionCode);

	return release;
}

GuardianApp.getLatestAndroidAlphaAsync = function (callback) {
	var versionCode = deasync(this.getVersionCodeCurrentlyInGooglePlayTrack)(2);
	var release = deasync(this.getReleaseDataFromGithub)(versionCode);

	return release;
}

function findRelease(releases, versionCode) {
	for(i = 0; i < releases.length;i++) {
		console.log(i)
		if( releases[i].tag_name.includes(versionCode) ) {
			break;
		}
	}
	return releases[i];
}

GuardianApp.getReleaseDataFromGithub = function(versionCode, callback) {
	function readbleVersionFrom(tag) {
		return tag.substring(1).split("-")[0];
	}
	// token auth
	 var gh = new GitHub({
	       username: github_username,
	       password: github_token
	    });
	 var repo = gh.getRepo("guardian", "android-news-app");
	var releases = repo.listReleases((err, releases) => { 
		if(err) callback(err);

		var release = findRelease(releases, versionCode);
		callback(null, {version: readbleVersionFrom(release.tag_name), releaseDate:release.published_at});
	});
}
GuardianApp.getGooglePlayTracks = function(callback) {
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
				callback(null, res.tracks);
			});
		});
	});
}

GuardianApp.getVersionCodeCurrentlyInGooglePlayTrack = function(track, callback) {
	console.log("howdy");
	this.getGooglePlayTracks(function(err, tracks) {
		if(err) callback(err);
		callback(null, tracks[track].versionCodes[0]);
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

GuardianApp.getLatestiOSAppId = function () {
	return "Guardian " +  this.getLatestiOSAppVersion();
}

GuardianApp.getLatestiOSBetaAppId = function () {
	return "Guardian " +  this.getLatestiOSBetaVersion();
}

GuardianApp.getLatestiOSAppVersion = function () {
	//return this.getLatestiOSApp().version;
	return "4.12 (14945)"
}

GuardianApp.getLatestiOSBetaVersion = function () {
	return "4.12 (14945)"
}


GuardianApp.getLatestiOSApp = function () {
	return deasync(this.getLatestiOSAppAsync)();
}

GuardianApp.getLatestiOSAppAsync = function (callback) {
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
