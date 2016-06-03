var Report = require('nomniture').Report;
var Util = require('./Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var username = nconf.get('username');
var secret = nconf.get('secret');
console.log('username is ' + username);
console.log('secret is ' + secret);

generateText(function(err, totalMembershipPurchases) {
	if(err) {
		throw err;
	}

	var numberWithCommas = function(x) {
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	var js = '$("#membershipPurchasesText").text("' + numberWithCommas(totalMembershipPurchases) + '");';
	var filename = "membershipPurchasesText.js";
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});


function generateText(callback) {
	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: "2016-03-22", 
			dateTo: Util.dates.yesterday,
			elements: [{ id: "page", search:{"keywords":["Membership-ThankYou"]}}, { id: "mobileappid", selected:["Guardian/4.4.662"]}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}],
			metrics: [{id:"pageviews"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if(err) throw new Error(err.message);

		console.log(JSON.stringify(response));
		console.log("*****************");

		var totalMembershipPurchases = response.report.data[0].breakdown[0].counts[0];

		callback(null, totalMembershipPurchases);
	});
}
