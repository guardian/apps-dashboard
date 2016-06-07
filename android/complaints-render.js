var AppAnnieClient = require("../lib/AppAnnieClient.js")
var Util = require("./Util.js")
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

generateChart(function(err, chart) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = '$("#' + chart.chart.renderTo + 'Text").text("' + chart.series[0].data[chart.series[0].data.length - 1] + '");'
	js += "new Highcharts.Chart(" + JSON.stringify(chart) + ");";
	var filename = chart.chart.renderTo + ".js"
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});
 
function generateChart(callback) {
        var chart = Util.getTemplate("line-basic");
	var appAnnie = new AppAnnieClient(apikey, androidProductID, iosProductID);

	appAnnie.getGooglePlayReviews(Util.dates.aWeekAgo, Util.dates.aDayAgo, 1, function(err, preResult){
		if (err) {
			callback(err);
		}

		appAnnie.getGooglePlayReviews(Util.dates.aWeekAgo, Util.dates.aDayAgo, 2, function(err, result){
			if (err) {
				callback(err);
			}

			var reviews = preResult.reviews.concat(result.reviews);
			console.log(JSON.stringify(reviews));

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
			console.log(JSON.stringify(histogram));

			chart.chart.renderTo = "complaints";
			chart.xAxis.categories = Object.keys(histogram).map(Util.shortDate);
			var data = Object.keys(histogram).map(date => histogram[date])
			chart.series = [{name:"Complaints", data:data}]

			chart.legend.enabled = false;
			chart.title.text = "";
			chart.subtitle.text = "";
			chart.yAxis.title.text = "";
			chart.tooltip.pointFormat = "{series.name}: <b>{point.y:,.0f}</b><br/>";
			chart.series[0].color = "rgb(67,67,72)";
			chart.plotOptions = {line:{marker:{enabled: false}}};

			callback(null, chart);
		});
	});
};
