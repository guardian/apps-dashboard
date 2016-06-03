var Report = require('nomniture').Report;
var Util = require('./Util.js');
var moment = require('moment');
var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');

nconf.file({file: '../config.json'});
var username = nconf.get('username');
var secret = nconf.get('secret');
console.log('username is ' + username);
console.log('secret is ' + secret);

generateChart(function (err, chart) {
    if (err) {
        throw err;
    }

    var js = "new Highcharts.Chart(" + JSON.stringify(chart) + ");";
    var filename = chart.chart.renderTo + ".js"
    console.log(js);
    fs.writeFile(filename, js, function (err) {
        if (err) {
            throw err;
        }

        console.log(filename + " was saved!");
    });
});

function generateChart(callback) {
    var chart = Util.getTemplate("column-drilldown");
    var options = {waitTime: 10, log: true, version: 1.4};
    var reportData = {
        reportDescription: {
            reportSuiteID: "guardiangu-globalapps-prod",
            dateFrom: Util.dates.aMonthAndADayAgo,
            dateTo: Util.dates.aDayAgo,
            elements: [{id: "mobiledevice", top: "30"}, {id: "mobileosversion", top: "5"}],
            segments: [{id: "s1218_55facf7ae4b08d193fc26205"}, {id: "55508808e4b0b5455b979744"}],
            metrics: [{id: "uniquevisitors"}]
        }

    };

    var report = new Report(username, secret, 'sanJose', options)
    report.request("Report.Queue", reportData, function (err, response) {
        if (err) {
            callback(err);
        }

        console.log(JSON.stringify(response));

        chart.chart.renderTo = "devices";
        chart.title.text = Util.humanReadbleDate(reportData.reportDescription.dateFrom) + ' to ' + Util.humanReadbleDate(reportData.reportDescription.dateTo);
        chart.yAxis.title = "Uniques";
        chart.plotOptions.series.dataLabels.format = "{point.y:,.0f}";
        chart.tooltip.pointFormat = '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:,.0f}</b><br/>';

        chart.series[0].name = "Devices";
        chart.series[0].data = highChartSeriesDataFrom(response);
        chart.drilldown.series = highChartDrilldownSeriesFrom(response);

        chart.subtitle.text = subtitleWithDeviceCategoryBreakdown(chart.series[0].data);
        console.log("*****************");
        console.log(JSON.stringify(chart.series[0].data));
        console.log("*****************");
        callback(null, chart);
    });
}

function subtitleWithDeviceCategoryBreakdown(data) {
    var total = _.reduce(data, function (sum, device) {
        return sum + device.y;
    }, 0);
    var totalIphone = _.reduce(data, function (sum, device) {
        if (device.name.indexOf("iPhone") > -1)
            return sum + device.y;
        else
            return sum;
    }, 0);
    var totalIpad = _.reduce(data, function (sum, device) {
        if (device.name.indexOf("iPad") > -1)
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
        "SM-G920F": "Galaxy S6",
        "SM-G900F": "Galaxy S5",
        "GT-19505": "Galaxy S4 LTE",
        "GT-19195": "Galaxy S4 Mini",
        "SM-G925F": "Galaxy S6 Edge",
        "D5803": "Sony Xperia Z3 Compact",
        "SM-A300FU": "Galaxy A3",
        "GT-I9300": "Galaxy S3",
        "SM-G935F": "Galaxy S7 edge",
        "SM-N910F": "Galaxy Note 4",
        "A0001": "OnePlus One",
        "LG-D855": "LG G3",
        "XT1032": "Motorola Moto G",
        "SM-G800F": "Galaxy S5 Mini",
        "SM-930F": "Galaxy S7",
        "D6603": "Sony Xperia Z3",
        "SM-900I": "Galaxy S5",
        "LG-H815": "LG G4",
        "XT1039": "Motorola Moto G 4G",
        "E5823": "Sony Xperia Z5 Compact",
        "SM-J500FN": "Galaxy J5",
        "xxx": "xxx",
        "xxx": "xxx"
    }
    var arr = [];
    data.report.data.forEach(function (item) {
        arr.push({name: item.name, y: parseInt(item.counts[0]), drilldown: item.name});
    });
    arr = arr.map(function (elem) {
        console.log(elem.name + ":" + translationTable[elem.name]);
        if (translationTable[elem.name])
            elem.name = translationTable[elem.name];
        return elem;
    });
    return mergeDuplicates(arr);

    //return arr;//[{ name: 'iPhone7,2', y: 1111, drilldown: 'iPhone7,2' }, ...]
}

//var derp = mergeDuplicates([{name: 'B', y: 1, drilldown: 'A'}, { name: 'A', y: 1, drilldown: 'A'}, {name: 'A', y: 1, drilldown: 'A'}, {name: 'C', y: 1, drilldown: 'A'}]);
function mergeDuplicates(arr) {
    var unique = _.uniqWith(arr, function (arrVal, othVal) {
        return arrVal.name === othVal.name;
    });
    console.log(JSON.stringify(unique));
    return unique.map(function (elem) {
        console.log(JSON.stringify(elem));
        elem.y = _.reduce(arr, function (sum, subElem) {
            console.log("+" + JSON.stringify(subElem) + (subElem.name === elem.name));
            if (subElem.name === elem.name)
                return sum + subElem.y;
            else
                return sum;

        }, 0);
        return elem;
    }).sort(function (a, b) {
        return b.y - a.y; //b.y > a.y;
    });
}

function highChartDrilldownSeriesFrom(data) {
    var arr = [];
    data.report.data.forEach(function (item) {
        arr.push({
            name: item.name, id: item.name, data: item.breakdown.map(function (elem) {
                return [elem.name, parseInt(elem.counts[0])]
            })
        });
    });
    return arr;

}
