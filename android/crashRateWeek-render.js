var CrittercismClient = require('./CrittercismClient.js');
var Util = require('./Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var username = nconf.get('crittercism_username');
var password = nconf.get('crittercism_password');
var clientid = nconf.get('crittercism_clientid');
console.log('username is ' + username);
console.log('clientid is ' + clientid);

generateChart(function(err, chart) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = "new Highcharts.Chart(" + JSON.stringify(chart) + ");";
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
	var cc = new CrittercismClient(clientid);

	cc.init(username, password, function(err) {
		if (err) {
			callback(err);
		}

		console.log('Crittercism API client initialized');
		cc.errorGraph(["5457bc14d478bc2b14000002"],"crashPercent", 10080, {appVersion: "4.4.659"}, function(err, result){
			if (err) {
				callback(err);
			}

			console.log(JSON.stringify(result));

			chart.chart.renderTo = "crashRateWeek";
			chart.xAxis.categories = highchartCategoriesFromCrittercismData(result);
			console.log(JSON.stringify(chart.xAxis.categories));
			chart.series = highChartSeriesFromCrittercismData(result);
			console.log(JSON.stringify(chart.series));

			chart.title.text = "Crash Rate";
			chart.subtitle.text = "";
			chart.yAxis.title = "%";
			chart.yAxis.plotLines = [{
				value:0.3,
				color: '#ff0000',
				width:2,
				zIndex:4,
				label:{text:'average'}
			}]
			chart.legend.enabled = false;
			chart.tooltip.pointFormat = "{series.name}: <b>{point.y:,.2f} %</b><br/>";

			callback(null, chart);
		});
	});
};

// // ["December", "November"]
function highchartCategoriesFromCrittercismData(crit) {
	function getDates(startDate, originalstopDate) {
	var stopDate = moment(originalstopDate);
	    var dateArray = [];
	    var currentDate = moment(startDate);
	    while (currentDate <= stopDate) {
		dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
		currentDate = moment(currentDate).add(1, 'days');
	    }
	    return dateArray;
	}
	return getDates(crit.data.start, crit.data.end);
}

//[ {name: 'Subscriptions', data: [1, 23.7] }]
function highChartSeriesFromCrittercismData(crit) {
	var name = crit.data.series[0].name;
	var data = crit.data.series[0].points;

	return [{name:name, data:data}];
}
