var fs = require('fs');
var request = require('request');

generateText(function (err, background, checkmark) {
    if (err) {
        throw err;
    }

    var js = '$("#mapiBackground").addClass("' + background + '");$("#mapiCheckmark").addClass("' + checkmark + '")';
    var filename = "mapiCheck.js"
    console.log(js);
    fs.writeFile(filename, js, function (err) {
        if (err) {
            throw err;
        }
        console.log(filename + " was saved!");
    });
});

function generateText(callback) {
    var MAPI_uk = "http://mobile-apps.guardianapis.com/uk/navigation";

    callAPI(MAPI_uk, function (err, result) {
        if (err)
            callback(err);
        else
            console.log(JSON.stringify(result));

        var res = JSON.stringify(result);

        if (res.indexOf('uk/fronts/home') >= 0) {
            console.log("found!");
            callback(null, "success", "glyphicon-ok-sign");
        }
        else {
            console.log("Not found!");
            callback(null, "danger", "glyphicon-remove-sign");
        }

    });

}

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

