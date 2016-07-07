var AppAnnieClient = require("../lib/AppAnnieClient.js")
var Util = require("../lib/Util.js")
var _ = require("lodash");
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var apikey = nconf.get("appannie_apikey");
var androidProductID = nconf.get("appannie_androidProductID");
var iosProductID = nconf.get("appannie_iosProductID");

generateText(function(err, numberOfComplaints) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	if (numberOfComplaints <= 0.29) {
		var color = "green";
	} else if (numberOfComplaints <= 0.69) {
		var color = "amber";
	} else {
		var color = "red";
	}

	console.log(numberOfComplaints + " complaints today")
	var js = `
	$("#todaysNumberOfComplaints").text("${numberOfComplaints}");
	$("#todaysNumberOfComplaints").addClass("${color}");
	`;
	console.log(js);

	var filename = "todaysNumberOfComplaints.js"
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});
 
function generateText(callback) {
        var chart = Util.getTemplate("custom-line-compact");
	var appAnnie = new AppAnnieClient(apikey, androidProductID, iosProductID);

	appAnnie.getGooglePlayReviews(Util.dates.today, Util.dates.today, [1,2], 0, function(err, reviews){
		if (err) {
			callback(err);
		}
		console.log(JSON.stringify(reviews));


		callback(null, reviews.length);
	});
};
