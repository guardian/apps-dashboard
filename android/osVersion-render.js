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
	var chart = Util.getTemplate("");
	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aMonthAndADayAgo,
			dateTo: Util.dates.aDayAgo,
			elements: [{id: "mobileosversion", top: "20"}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"},{id:"55508808e4b0b5455b979744"}],
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
		chart.title.text = humanReadbleDate(reportData.reportDescription.dateFrom) + ' to ' + humanReadbleDate(reportData.reportDescription.dateTo);
		chart.chart.renderTo = "osVersion";

		callback(null, chart);
	});
}

// This code was lifted from a highcarts demo
function getDonutChart(response) {
    categories = arrayOfDataNames(response).sort();
    console.log(JSON.stringify(categories));

    android4Versions = categories.filter(function(elem){ return elem.indexOf("Android 4") > -1});
    android5Versions = categories.filter(function(elem){ return elem.indexOf("Android 5") > -1});
    android6Versions = categories.filter(function(elem){ return elem.indexOf("Android 6") > -1});
    console.log(JSON.stringify(android4Versions));
    console.log(JSON.stringify(android5Versions));
    console.log(JSON.stringify(android6Versions));
    
    android4VersionUptake = arrayOfCountsForDataWithNames(response, android4Versions), response.report.totals[0];
    android5VersionUptake = arrayOfCountsForDataWithNames(response, android5Versions);
    android6VersionUptake = arrayOfCountsForDataWithNames(response, android6Versions);
    console.log(JSON.stringify(android4VersionUptake));
    console.log(JSON.stringify(android5VersionUptake));
    console.log(JSON.stringify(android6VersionUptake));
    console.log("*****************");

    var colors = ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"],
        categories = ['KitKat', 'Lollipop', 'Marshmallow'],
        data = [{
            y: total(android4VersionUptake),
            color: colors[0],
            drilldown: {
                name: 'Android 4 versions',
                categories: android4Versions,
                data: android4VersionUptake,
                color: colors[0]
            }
        }, {
            y: total(android5VersionUptake),
            color: colors[1],
            drilldown: {
                name: 'Android 5 versions',
                categories: android5Versions,
                data: android5VersionUptake,
                color: colors[1]
            }
        }, {
            y: total(android6VersionUptake),
            color: colors[2],
            drilldown: {
                name: 'Android 6 versions',
                categories: android6Versions,
                data: android6VersionUptake,
                color: colors[2]
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
        subtitle: {
            text: ''
        },
        yAxis: {
            title: {
                text: 'Total percent market share'
            }
        },
        plotOptions: {
            pie: {
                shadow: false,
                center: ['50%', '50%']
            }
        },
        credits: {
            enabled: false

        },
        tooltip: {
	    pointFormat: 'Number of users: <b>{point.percentage:.1f}%</b>'
        },
        series: [{
            name: 'Browsers',
            data: browserData,
            size: '60%',
            dataLabels: {
                color: '#ffffff',
                distance: -30
            }
        }, {
            name: 'Versions',
            data: versionsData,
            size: '80%',
            innerSize: '60%',
            dataLabels: {

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
