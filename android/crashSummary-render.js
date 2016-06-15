var CrittercismClient = require('./CrittercismClient.js');
var Util = require('./Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');

nconf.file({ file: '../config.json' });
var username = nconf.get('crittercism_username');
var password = nconf.get('crittercism_password');
var clientid = nconf.get('crittercism_clientid');
console.log('username is ' + username);
console.log('clientid is ' + clientid);

generateText(function(err, widespreadCrash, frequentCrash) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = `$("#widespreadCrash").html("The most widespread crash is <i>${widespreadCrash.name}</i> happening to <b>${widespreadCrash.uniqueSessionCount}</b> people.");`
	js += `$("#frequentCrash").html("The most frequent crash is <i>${frequentCrash.name}</i>, <b>${frequentCrash.sessionCount}</b> crashes so far.");`
	var filename = "crashSummary.js"
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

 
function generateText(callback) {
        var chart = Util.getTemplate("custom-line-compact-percentage");
	var appVersion = GuardianApp.getLatestAndroidAppVersion();
	var cc = new CrittercismClient(clientid);

	cc.init(username, password, function(err) {
		if (err) {
			callback(err);
		}

		console.log('Crittercism API client initialized');
		cc.topCrashByUser(appVersion, function(err, crashes){
			if (err) {
				callback(err);
			}

			console.log(JSON.stringify(crashes));

			var widespreadCrash = mostWidespreadCrash(crashes);
			var frequentCrash = mostFrequentCrash(crashes);

			callback(null, widespreadCrash, frequentCrash);
		});
	});
};

function mostWidespreadCrash(crashes) {
	return crashes.sort((b,a) => a.uniqueSessionCount - b.uniqueSessionCount)[0];
}

function mostFrequentCrash(crashes) {
	return crashes.sort((b,a) => a.sessionCount - b.sessionCount)[0];
}
