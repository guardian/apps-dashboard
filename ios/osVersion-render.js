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
	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aMonthAndADayAgo,
			dateTo: Util.dates.aDayAgo,
			elements: [{id: "mobileosversion", top: "20"}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"},{id:"5550876be4b0b5455b979741"}],
			metrics: [{id:"uniquevisitors"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)
		
	report.request("Report.Queue", reportData, function(err, response){
		if (err) {
			callback(err);
		}


		console.log("*****************");
		console.log(JSON.stringify(response));
		console.log("*****************");

		var chart = getDonutChart(response);
		chart.chart.renderTo = "osVersion";
		chart.title.text = "iOS version"
		chart.tooltip["headerFormat"] = "iOS {point.key}<br>";
		chart.tooltip.pointFormat = "Percentage of users: <b>{point.percentage:.1f}%</b>";

		callback(null, chart);
	});
}

// This code was lifted from a highcarts demo
function getDonutChart(response) {
    categories = arrayOfDataNames(response).sort();
    console.log(JSON.stringify(categories));
    
    iOS7Versions = categories.filter(function(elem){ return elem.indexOf("iOS 7") > -1});
    iOS8Versions = categories.filter(function(elem){ return elem.indexOf("iOS 8") > -1});
    iOS9Versions = categories.filter(function(elem){ return elem.indexOf("iOS 9") > -1});
    iOS10Versions = categories.filter(function(elem){ return elem.indexOf("iOS 10") > -1});
    console.log(JSON.stringify(iOS7Versions));
    console.log(JSON.stringify(iOS8Versions));
    console.log(JSON.stringify(iOS9Versions));
    console.log(JSON.stringify(iOS10Versions));
    
    iOS7VersionUptake = arrayOfCountsForDataWithNames(response, iOS7Versions), response.report.totals[0];
    iOS8VersionUptake = arrayOfCountsForDataWithNames(response, iOS8Versions);
    iOS9VersionUptake = arrayOfCountsForDataWithNames(response, iOS9Versions);
    iOS10VersionUptake = arrayOfCountsForDataWithNames(response, iOS10Versions);
    console.log(JSON.stringify(iOS7VersionUptake));
    console.log(JSON.stringify(iOS8VersionUptake));
    console.log(JSON.stringify(iOS9VersionUptake));
    console.log(JSON.stringify(iOS10VersionUptake));
    console.log("*****************");

    var colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"],
        categories = ['7', '8', '9', '10'],
        data = [{
            y: total(iOS7VersionUptake),
            color: colors[0],
            drilldown: {
                name: 'iOS 7 versions',
                categories: iOS7Versions.map(s => s.substring(4)),
                data: iOS7VersionUptake,
                color: colors[0]
            }
        }, {
            y: total(iOS8VersionUptake),
            color: colors[1],
            drilldown: {
                name: 'iOS 8 versions',
                categories: iOS8Versions.map(s => s.substring(4)),
                data: iOS8VersionUptake,
                color: colors[1]
            }
        }, {
            y: total(iOS9VersionUptake),
            color: colors[2],
            drilldown: {
                name: 'iOS 9 versions',
                categories: iOS9Versions.map(s => s.substring(4)),
                data: iOS9VersionUptake,
                color: colors[2]
            }
        }, {
            y: total(iOS10VersionUptake),
            color: colors[3],
            drilldown: {
                name: 'iOS 10 versions',
                categories: iOS10Versions.map(s => s.substring(4)),
                data: iOS10VersionUptake,
                color: colors[3]
            }
        }
        ],
        browserData = [],
        versionsData = [],
        i,
        j,
        dataLen = data.length,
        drillDataLen,
        brightness;


    // Build the data arrays
    for (i = 0; i < dataLen; i += 1) {

        // add browser data
        browserData.push({
            name: categories[i],
            y: data[i].y,
            color: data[i].color
        });

        // add version data
        drillDataLen = data[i].drilldown.data.length;
        for (j = 0; j < drillDataLen; j += 1) {
            brightness = 0.2 - (j / drillDataLen) / 5;
            versionsData.push({
                name: data[i].drilldown.categories[j],
                y: data[i].drilldown.data[j],
                color: shadeColor2(data[i].color, brightness * 3 )
            });
        }
    }

    // Create the chart
    var chart={
        chart: {
            type: 'pie',
            renderTo: ''
        },
        title: {
            text: ''
        },
        plotOptions: {
            pie: {
                shadow: false,
                center: ['50%', '50%']
            }
        },
        tooltip: {
	    pointFormat: 'Number of users: <b>{point.percentage:.1f}%</b>'
        },
        series: [{
            name: 'Major Versions',
            data: browserData,
            size: '60%',
            dataLabels: {
                color: '#ffffff',
                distance: -30
            }
        }, {
            name: 'Versions',
            data: versionsData,
            size: '100%',
            innerSize: '60%',
            dataLabels: {
		enabled: false
            }
        }],
        credits: {
            enabled: false
        },
    };
	return chart;
}

function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function total(arr) {
	function add(a, b) {
	    return a + b;
	}

	return arr.reduce(add, 0);
}

// IN data is [{name:'Google Chrome 45.0'},{name: 'Safari 8.0'}]
// OUT ['Google Chrome 45.0', 'Safari 8.0', 'Safari']
function arrayOfDataNames(omniture) {
	return omniture.report.data.map(function(item) {
		return item.name;
	});
}

// IN data is [{name:'Google Chrome 45.0', counts:['1']},{name: 'Safari 8.0', counts:['10']}]
// OUT 1
// Find the data with the matching name, either return the counts if it exists or an empty string
function countForDataWithName(data, name) {
	var matchingData = data.report.data.filter(function(elem){
		return elem.name === name;
	}).map(function(elem) {
		return parseInt(elem.counts[0]);
	});
	return matchingData[0] ? matchingData[0] : -1;
}

function arrayOfCountsForDataWithNames(data, names) {
	return names.map(function(name) {
		return countForDataWithName(data, name);
	});
}

function humanReadbleDate(str) {
	return moment(str).format('DD MMM, YYYY');
}
