var MAPI_uk = "http://mobile-apps.guardianapis.com/uk/navigation";
//var MAPI_url = "http://mobile-apps.guardianapis.com/uk/navigation";
//var MAPI_url = "http://mobile-apps.guardianapis.com/uk/navigation";


var request = require('request');

function callAPI(url, callback) {

    var options = {
        url: url,
        headers: {
            'Accept': 'application/json',
            'Authorization': module.auth
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            callback(null, JSON.parse(body));
        } else {
            if (error)
                callback(error);
            else
                callback(new Error(JSON.parse(body).code + ": " + JSON.parse(body).error));
        }
    });
}


callAPI(MAPI_uk, function (err, result) {

    if (err)
        throw err;
    else
        console.log(JSON.stringify(result));

    var res = JSON.stringify(result);

    var js = "";

    var filename = "latestVersionText.js";
    console.log(js);
    fs.writeFile(filename, js, function(err) {
        if(err) {
            throw err;
        }

        console.log(filename + " was saved!");
    });

    if (res.indexOf('uk/fronts/home') >= 0) {
        console.log("found!");

        return "<td class=\"success\"><span class=\"glyphicon glyphicon-ok-sign\"><\/span><\/td>";
    }
    else {
        console.log("Not found!");

        return "<td class=\"danger\"><span class=\"glyphicon glyphicon-remove-sign\"><\/span><\/td>";
    }

});

