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

generateChart(function(err, reviews) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	console.log(reviews.length + " complaints today")
});
 
function generateChart(callback) {
        var chart = Util.getTemplate("custom-line-compact");
	var appAnnie = new AppAnnieClient(apikey, androidProductID, iosProductID);

	appAnnie.getGooglePlayReviews(Util.dates.today, Util.dates.today, [1,2], 0, function(err, reviews){
		if (err) {
			callback(err);
		}
		console.log(JSON.stringify(reviews));


		callback(null, reviews);
	});
};

function calculateHistogramFor(reviews) {
	var histogram = {};
	reviews.sort(function(a,b){
		return new Date(a.date) - new Date(b.date);
	})
	reviews.forEach(function(review) {
		if(typeof histogram[review.date] === "undefined")
			histogram[review.date] = 1;
		else
			histogram[review.date]++;
	});
	return histogram;
}
