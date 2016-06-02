var nconf = require('nconf'); 
nconf.file({ file: '../config.json' }); 
var username = nconf.get('username'); 
var secret = nconf.get('secret'); 
console.log('username is ' + username); 
console.log('secret is ' + secret); 

// Get all available metrics using the Client object
var Report = require('nomniture').Client;
var options = { waitTime: 10, log: false, version: 1.4};
var report = new Report(username, secret, 'sanJose', options)
var reportData = { "reportSuiteID":"guardiangu-globalapps-prod" }

report.request('Report.GetMetrics', reportData, function(err, response){
	if(err) throw err;
	console.log("***Metrics:");
	response.forEach(function(elem) {
		console.log(elem.name + ":" + elem.id);
	});
	report.request('Report.GetElements', reportData, function(err, response){
		if(err) throw err;
		console.log("***Elements:");
		response.forEach(function(elem) {
			console.log(elem.name + ":" + elem.id);
		});
	});
});
