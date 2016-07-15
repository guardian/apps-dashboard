var CrittercismClient = require('../lib/CrittercismClient.js');
var Util = require('../lib/Util.js');
var moment = require ('moment');
var _ = require ('lodash');
var nconf = require('nconf');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');
var sleep = require('sleep');
var async = require('async');

nconf.file({ file: '../config.json' });
var username = nconf.get('crittercism_username');
var password = nconf.get('crittercism_password');
var clientid = nconf.get('crittercism_clientid');
console.log('username is ' + username);
console.log('clientid is ' + clientid);

function crashAsHtml(c){
	return `<a href='https://app.crittercism.com/developers/crash-details/5457bc14d478bc2b14000002/${c.hash}' target='_blank'>${c.name}</a><BR>${Util.abreviated(c.reason)}<BR>${c.uniqueSessionCount} users, ${c.sessionCount} crashes<BR><BR>`;
}

generateText(function(err, appVersion, majorVersion, newCrashes, newMajorVersionCrashes) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var newCrashesAsText = newCrashes.map(c => crashAsHtml(c)).join("");
	var newMajorVersionCrashesAsText = newMajorVersionCrashes.map(c => crashAsHtml(c)).join("");

	var js = `
$("#newCrashes").html("<b>${newCrashes.length} new crashes in ${appVersion}</b>:<BR>${newCrashesAsText}");
$("#newCrashesMajorVersion").html("<b>${newMajorVersionCrashes.length} new crashes in ${majorVersion}</b>:<BR>${newMajorVersionCrashesAsText}");`;

	var filename = "crashNew.js"
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

 
function generateText(callback) {
	var appVersion = "4.6.733"
	var majorVersion = "4.6"
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

			function wrapper(c,cb) {
				console.log(c.name);
				console.log(c.reason);
				console.log(c.suspectLine);
				cc.getCrashDetails(c.hash,function(err, result){
					if(err) cb(err);
					if(!result) {
						console.log("result came back as " +result);
						console.log("why?!");
						process.exit(1);
					}
					c["versions"] = result.sessionCountsByVersion;
					c["os"] = result.diagnostics.discrete_diagnostic_data.system_version;
					console.log("> " + Object.keys(result.sessionCountsByVersion).join(" "));
					console.log("> " + result.diagnostics.discrete_diagnostic_data.system_version.map(v => v[0]).join(" "));
					console.log("*****************************************************");
					//sleep.sleep(30);
					cb(null, c);
				});
			}
			

			async.mapSeries(crashes, wrapper, function(err, crashesWithVersions) {
				if(err) callback(err);
				

				//crashesWithVersions = crashesWithVersions.filter(c => c.sessionCount > 1 && c.uniqueSessionCount > 1)

				    // results is now an array of stats for each file
				var newCrashes = crashesWithVersions.filter(c => Object.keys(c.versions).length == 1)
				console.log("New in " + appVersion);
				Util.print(newCrashes);
				var merged = mergeThem(newCrashes);
				console.log("**Merged " + appVersion);
				Util.print(merged)
			
				var newMajorVersionCrashes = crashesWithVersions.filter(c => { 
					var versions = Object.keys(c.versions)
					var versionsInterested = versions.filter(v => v.indexOf(majorVersion) > -1);
					return versionsInterested.length == versions.length;
				});
				
				
				console.log("New in " + majorVersion);
				Util.print(newMajorVersionCrashes);
				var merged2 = mergeThem(newMajorVersionCrashes);
				console.log("**Merged " + majorVersion);
				Util.print(merged2)

				callback(null, appVersion, majorVersion, merged, crashes);
			});

		});
	});
};

function mergeThem(crashes) {
	var merged = [];
	function findMergedCrash(crash) {
		var filtered = merged.filter(c => ( c.name === crash.name && 
		                                    c.reason === crash.reason)
		                                  ) || 
		                                  ( c.name === crash.name && 
		                                    c.suspectLine === crash.suspectLine
		                                  );
		return filtered[0]; //dodg
	}

	crashes.forEach(crash => {
		if(mergedCrash = findMergedCrash(crash)) {
			merged[0].sessionCount += crash.sessionCount;
			merged[0].uniqueSessionCount += crash.uniqueSessionCount;
		}
		else {
			merged.push(crash)
		}
	});

	return merged.sort( (a,b) => b.uniqueSessionCount - a.uniqueSessionCount );
}

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
