$(function () {
    $('#crashRatesGraph').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Crash Rate'
        },
        xAxis: {
            categories: [
                '4.0',
                '4.1',
                '4.2',
                '4.3',
                '4.4',
                '4.5',
                '4.6',
                '4.7',
                '4.8',           
                '4.9',
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            max: 1,
            title: {
                text: 'Crash Rate %'
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
            name: 'Crash Rate',
            data: [0.39, 0.34, 0.33, 0.27, 0.25, 0.29, 0.30, 0.24, 0.15, 0.17]
        }]
    });
});
