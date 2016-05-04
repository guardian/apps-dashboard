var AppAnnieClient = require("./AppAnnieClient.js")
var _ = require("lodash");
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var apikey = nconf.get("appannie_apikey");
var androidProductID = nconf.get("appannie_androidProductID");
var iosProductID = nconf.get("appannie_iosProductID");
console.log('apikey is ' + apikey);
console.log('androidProductID is ' + androidProductID);
console.log('iosProductID is ' + iosProductID);

generateTable(function(err, table) {
	if(err) {
		throw err;
	}

	var js = '$("#reviewsForCurrentVersion").append(' + JSON.stringify(table) + ");";
	var filename = "reviewsForCurrentVersion.js"
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
})
 
function generateTable(callback) {
	var appAnnie = new AppAnnieClient(apikey, androidProductID, iosProductID);
	appAnnie.getAppStoreReviewsForVersionWithRating("4.4", 2, function(err, preResult){
		if (err) {
			callback(err);
		}
		appAnnie.getAppStoreReviewsForVersionWithRating("4.4", 1, function(err, result){
			if (err) {
				callback(err);
			}

			result.reviews = preResult.reviews.concat(result.reviews);
			console.log(JSON.stringify(result));
			var rows = result.reviews.map(function(review){
				return "<tr><td><i>" + review.title + "</i> " + review.text.replace(/\n/g, "<BR>\n") + "</td></tr>"
			}).join("");
			var table = "<tr><th>Critical Reviews (" + result.reviews.length + ")</th></tr>" + rows
			console.log(JSON.stringify(table));

			callback(null, table);
		});
	});
};
