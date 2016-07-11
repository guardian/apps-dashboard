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
	var chart = Util.getTemplate("column-drilldown");
	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aMonthAndADayAgo,
			dateTo: Util.dates.aDayAgo,
			elements: [{ id: "mobiledevice", top: "30" },  {id: "mobileosversion", top: "5"}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"},{id:"5550876be4b0b5455b979741"}],
			metrics: [{id:"uniquevisitors"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)
	report.request("Report.Queue", reportData, function(err, response){
		if (err) {
			callback(err);
		}

		console.log(JSON.stringify(response));

		chart.chart.renderTo = "screenSize";
		chart.title.text = Util.humanReadbleDate(reportData.reportDescription.dateFrom) + ' to ' + Util.humanReadbleDate(reportData.reportDescription.dateTo);
		chart.yAxis.title = "Uniques";
		chart.plotOptions.series.dataLabels.format = "{point.y:,.0f}";
		chart.tooltip.pointFormat = '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:,.0f}</b><br/>';

		chart.series[0].data = highChartSeriesDataFrom(response);
		//chart.drilldown.series = highChartDrilldownSeriesFrom(response);

		chart.subtitle.text = "";
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
                "iPad1,1": "iPad 9.7 inches",
                "iPad2,1": "iPad 9.7 inches",
                "iPad2,2": "iPad 9.7 inches",
                "iPad2,3": "iPad 9.7 inches",
                "iPad2,4": "iPad 9.7 inches",
                "iPad2,5": "iPad 7.9 inches",
                "iPad2,6": "iPad 7.9 inches",
                "iPad2,7": "iPad 7.9 inches",
                "iPad3,1": "iPad 9.7 inches",
                "iPad3,2": "iPad 9.7 inches",
                "iPad3,3": "iPad 9.7 inches",
                "iPad3,4": "iPad 9.7 inches",
                "iPad3,5": "iPad 9.7 inches",
                "iPad3,6": "iPad 9.7 inches",
                "iPad4,1": "iPad 9.7 inches",
                "iPad4,2": "iPad 9.7 inches",
                "iPad4,3": "iPad 9.7 inches",
                "iPad4,4": "iPad 7.9 inches",
                "iPad4,5": "iPad 7.9 inches",
                "iPad4,6": "iPad 7.9 inches",
                "iPad4,7": "iPad 7.9 inches",
                "iPad4,8": "iPad 7.9 inches",
                "iPad4,9": "iPad 7.9 inches",
                "iPad5,1": "iPad 7.9 inches",
                "iPad5,2": "iPad 7.9 inches",
                "iPad5,3": "iPad 9.7 inches",
                "iPad5,4": "iPad 9.7 inches",
                "iPad6,3": "iPad 9.7 inches",
                "iPad6,4": "iPad 9.7 inches",
                "iPad6,7": "iPad 12.9 inches",
                "iPad6,8": "iPad 12.9 inches",
                "iPhone3,1": "iPhone 3.5 inches",
                "iPhone3,2": "iPhone 3.5 inches",
                "iPhone3,3": "iPhone 3.5 inches",
                "iPhone4,1": "iPhone 3.5 inches",
                "iPhone5,1": "iPhone 4 inches",
                "iPhone5,2": "iPhone 4 inches",
                "iPhone5,3": "iPhone 4 inches",
                "iPhone5,4": "iPhone 4 inches",
                "iPhone6,1": "iPhone 4 inches",
                "iPhone6,2": "iPhone 4 inches",
                "iPhone7,1": "iPhone 5.5 inches",
                "iPhone7,2": "iPhone 4.7 inches",
                "iPhone8,1": "iPhone 4.7 inches",
                "iPhone8,2": "iPhone 5.5 inches",
                "iPhone8,4": "iPhone 4 inches"
	}
	var arr = [];
	data.report.data.forEach(function(item) {
		arr.push({name: item.name, y:parseInt(item.counts[0]), drilldown:item.name});
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