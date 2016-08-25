$(function () {
    $('#starRatingsGraph').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'App Store Rating'
        },
        xAxis: {
            categories: [
                'Guardian 4.0',
                'Guardian 4.1',
                'Guardian 4.2',
                'Guardian 4.3',
                'Guardian 4.4',
                'Guardian 4.5',
                'Guardian 4.6',
                'Guardian 4.7',
                'Guardian 4.8',
                'Guardian 4.9',
            ],
            crosshair: true
        },
        yAxis: {
            min: 4,
            max: 5,
            title: {
                text: 'Star Rating'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.2f} </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Star Rating',
            data: [4.76, 4.76, 4.63, 4.73, 4.70, 4.70, 4.80, 4.90]
        }]
    });
});
