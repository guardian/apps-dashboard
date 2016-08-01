var Report = require('nomniture').Report;
var Util = require('../lib/Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var username = nconf.get('username');
var secret = nconf.get('secret');
console.log('username is ' + username);
console.log('secret is ' + secret);

generateChart(function(err, chart) {
	if(err) {
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
	var chart = Util.getTemplate("pie-basic");
	var appid = "Guardian 4.9 (13713)";
	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aMonthAndADayAgo,
			dateTo: Util.dates.aDayAgo,
			elements: [{ id: "mobiledevice", top: "30" }],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}, {element:"mobileappid", selected:[appid]}],
			metrics: [{id:"uniquevisitors"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)
	report.request("Report.Queue", reportData, function(err, response){
		if (err) {
			callback(err);
		}

		console.log(JSON.stringify(response));

		chart.chart.renderTo = "screenSizeBeta";
		chart.title.text = "Screen size";


		delete chart.chart.plotBackgroundColor;
		delete chart.chart.plotBorderWidth;
		delete chart.chart.plotShadow;
		delete chart.plotOptions.pie.dataLabels.format;
		chart.plotOptions.pie.dataLabels.distance = -50;
		chart.plotOptions.pie.dataLabels.style = {"fontWeight":"bold","color":"white","textShadow":"0px 1px 2px black"};
		chart.series[0].name = "Sizes";
		chart.series[0].name = "Sizes";
		chart.series[0].data = highChartSeriesDataFrom(response);
		//chart.drilldown.series = highChartDrilldownSeriesFrom(response);

		//chart.subtitle.text = "";
		console.log("*****************");
		console.log(JSON.stringify(chart.series[0].data));
		console.log("*****************");
		callback(null, chart);
	});
}

function subtitleWithDeviceCategoryBreakdown(data) {
        var total = _.reduce(data, function(sum, device){
                return sum + device.y;
        }, 0);
        var totalIphone = _.reduce(data, function(sum, device){
                if(device.name.indexOf("iPhone") > -1)
                        return sum + device.y;
                else
                        return sum;
        }, 0);
        var totalIpad = _.reduce(data, function(sum, device){
                if(device.name.indexOf("iPad") > -1)
                        return sum + device.y;
                else
                        return sum;
        }, 0);
        var iPhone = (totalIphone / total) * 100;
        var iPad = (totalIpad / total) * 100;
        return "iPhone " + iPhone.toFixed(1) + "% iPad " + iPad.toFixed(1) + "%<br>click the bars to break down by iOS version";

}

function highChartSeriesDataFrom(data) {
	var translationTable = {
                'iPad1,1': '9.7 "',
                'iPad2,1': '9.7 "',
                'iPad2,2': '9.7 "',
                'iPad2,3': '9.7 "',
                'iPad2,4': '9.7 "',
                'iPad2,5': '7.9 "',
                'iPad2,6': '7.9 "',
                'iPad2,7': '7.9 "',
                'iPad3,1': '9.7 "',
                'iPad3,2': '9.7 "',
                'iPad3,3': '9.7 "',
                'iPad3,4': '9.7 "',
                'iPad3,5': '9.7 "',
                'iPad3,6': '9.7 "',
                'iPad4,1': '9.7 "',
                'iPad4,2': '9.7 "',
                'iPad4,3': '9.7 "',
                'iPad4,4': '7.9 "',
                'iPad4,5': '7.9 "',
                'iPad4,6': '7.9 "',
                'iPad4,7': '7.9 "',
                'iPad4,8': '7.9 "',
                'iPad4,9': '7.9 "',
                'iPad5,1': '7.9 "',
                'iPad5,2': '7.9 "',
                'iPad5,3': '9.7 "',
                'iPad5,4': '9.7 "',
                'iPad6,3': '9.7 "',
                'iPad6,4': '9.7 "',
                'iPad6,7': '12.9 "',
                'iPad6,8': '12.9 "',
                'iPhone3,1': '3.5 "',
                'iPhone3,2': '3.5 "',
                'iPhone3,3': '3.5 "',
                'iPhone4,1': '3.5 "',
                'iPhone5,1': '4 "',
                'iPhone5,2': '4 "',
                'iPhone5,3': '4 "',
                'iPhone5,4': '4 "',
                'iPhone6,1': '4 "',
                'iPhone6,2': '4 "',
                'iPhone7,1': '5.5 "',
                'iPhone7,2': '4.7 "',
                'iPhone8,1': '4.7 "',
                'iPhone8,2': '5.5 "',
                'iPhone8,4': '4 "'
	}
	var arr = [];
	data.report.data.forEach(function(item) {
		arr.push({name: item.name, y:parseInt(item.counts[0])});
	});
	arr = arr.map(function(elem) {
		console.log(elem.name + ":" + translationTable[elem.name]);
		if(translationTable[elem.name])
			elem.name = translationTable[elem.name];
		return elem;
	});
	return mergeDuplicates(arr);

	//return arr;//[{ name: 'iPhone7,2', y: 1111, drilldown: 'iPhone7,2' }, ...]
}

//var derp = mergeDuplicates([{name: 'B', y: 1, drilldown: 'A'}, { name: 'A', y: 1, drilldown: 'A'}, {name: 'A', y: 1, drilldown: 'A'}, {name: 'C', y: 1, drilldown: 'A'}]);
function mergeDuplicates(arr) {
	var unique = _.uniqWith(arr, function(arrVal, othVal) {
		return arrVal.name === othVal.name;
	});
console.log(JSON.stringify(unique));
	return unique.map(function(elem){
	console.log(JSON.stringify(elem));
		elem.y = _.reduce(arr, function(sum, subElem) {
			console.log("+" + JSON.stringify(subElem) + (subElem.name === elem.name));
			if(subElem.name === elem.name)
				return sum + subElem.y;
			else
				return sum;

		}, 0);
		return elem;
	}).sort(function(a,b){
		return b.y - a.y; //b.y > a.y;
	});
}

function highChartDrilldownSeriesFrom(data) {
	var arr = [];
	data.report.data.forEach(function(item) {
		arr.push({name: item.name, id:item.name, data:item.breakdown.map(function(elem){ return [elem.name, parseInt(elem.counts[0])] })});
	});
	return arr;
	           //[{ name: 'iPhone7,2', id: 'iPhone7,2', data: [ [ 'iOS 9.1', 11111 ], [ 'iOS9.0.2', 1111 ], [ 'iOS 8.4.1', 1111 ] ]}, ...]
            
}
