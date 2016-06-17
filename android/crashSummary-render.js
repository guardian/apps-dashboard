var CrittercismClient = require('../lib/CrittercismClient.js');
var Util = require('../lib/Util.js');
var moment = require ('moment');
var _ = require ('lodash');
var nconf = require('nconf');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');

nconf.file({ file: '../config.json' });
var username = nconf.get('crittercism_username');
var password = nconf.get('crittercism_password');
var clientid = nconf.get('crittercism_clientid');
console.log('username is ' + username);
console.log('clientid is ' + clientid);

generateText(function(err, widespreadCrash, widespreadVersionSummary, frequentCrash, frequentVersionSummary, nullPointerExceptions, mostCommonCategory) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = `$("#widespreadCrash").html("<b>Most widespread</b>: <i>${widespreadCrash.name}</i> happening to <b>${widespreadCrash.uniqueSessionCount}</b> people. ${widespreadVersionSummary}");
$("#frequentCrash").html("<b>Most frequent</b>: <i>${frequentCrash.name}</i>, with <b>${frequentCrash.sessionCount}</b> crashes so far. ${frequentVersionSummary}");
$("#nullPointers").html("${nullPointerExceptions}");
$("#category").html("${mostCommonCategory}");`

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
	var appVersion = GuardianApp.getLatestAndroidAppVersion();
	//var appVersion = "4.4.664";
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
			var histogram = calculateHistogramFor(crashes);
			Util.print(histogram);

			var nullPointerExceptions = `There have been <b>${histogram["java.lang.NullPointerException"]}</b> null pointer exceptions.`;
			var category = Object.keys(histogram)[0];
			var mostCommonCategory = `Our most common type of error is <b>${category}</b> with a total of <b>${histogram[category]}</b> exceptions.`;
			var widespreadCrash = mostWidespreadCrash(crashes);
			var frequentCrash = mostFrequentCrash(crashes);
			cc.getCrashDetails(widespreadCrash.hash, function(err, details) {
				var diagnostic = details.diagnostics.discrete_diagnostic_data;
				Util.print(diagnostic.system_version);
				var widespreadVersionSummary = generateVersionSummary(diagnostic.system_version, diagnostic.app_version);
				Util.print(widespreadVersionSummary);
				cc.getCrashDetails(frequentCrash.hash, function(err, details) {
					var diagnostic = details.diagnostics.discrete_diagnostic_data;
					Util.print(diagnostic.system_version);
					var frequentVersionSummary = generateVersionSummary(diagnostic.system_version, diagnostic.app_version);
					Util.print(frequentVersionSummary);
					callback(null, widespreadCrash, widespreadVersionSummary, frequentCrash, frequentVersionSummary, nullPointerExceptions, mostCommonCategory);
				});
			});

		});
	});
};

function generateVersionSummary(system_version, app_version) {
	var androidVersion = crashOSVersionSummary(system_version)
	var appVersion = crashAppVersionSummary(app_version)
	Util.print(androidVersion);
	Util.print(appVersion);
	if(appVersion === "" && androidVersion === "")
		return ""
	else if (appVersion != "" && androidVersion != "")
		return `Exclusive to <b>${appVersion}</b> and <b>${androidVersion}</b>.`
	else if (appVersion != "" && androidVersion === "")
		return `Exclusive to <b>${appVersion}</b>.`
	else if (appVersion === "" && androidVersion !== "")
		return `Exclusive to <b>${androidVersion}</b>.`

}

function crashOSVersionSummary(os) {
	var versions = os.map(a => a[0]);
	var majorVersions = _.uniq(versions.map(a => a.slice(0,9)));

	if(majorVersions.length == 1)
		return majorVersions[0].charAt(0).toUpperCase() + majorVersions[0].slice(1);
	else
		return "";
}

function crashAppVersionSummary(app) {
	var versions = app.map(a => a[0]);

	if(versions.length == 1)
		return versions[0];
	else
		return "";
}

function mostWidespreadCrash(crashes) {
	return crashes.sort((b,a) => a.uniqueSessionCount - b.uniqueSessionCount)[0];
}

function mostFrequentCrash(crashes) {
	return crashes.sort((b,a) => a.sessionCount - b.sessionCount)[0];
}

function calculateHistogramFor(crashes) {
	var histogram = {}
	crashes.forEach(crash => {
		if(typeof histogram[crash.name] === "undefined")
			histogram[crash.name] = crash.sessionCount;
		else
			histogram[crash.name] += crash.sessionCount;
	})
	var sortedKeys = Object.keys(histogram).sort( (a,b) => histogram[b] - histogram[a] );
	sortedHistogram = {};
	sortedKeys.forEach(key => sortedHistogram[key] = histogram[key]);
	return sortedHistogram;
}
