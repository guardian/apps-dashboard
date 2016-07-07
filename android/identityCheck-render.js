var fs = require('fs');
var request = require('request');

generateText(function (err, background, checkmark) {
    if (err) {
        throw err;
    }

    var js = '$("#identityBackground").addClass("' + background + '");$("#identityCheckmark").addClass("' + checkmark + '")';
    var filename = "identityCheck.js"
    console.log(js);
    fs.writeFile(filename, js, function (err) {
        if (err) {
            throw err;
        }
        console.log(filename + " was saved!");
    });
});

function generateText(callback) {
    var identity_api = "https://idapi.theguardian.com/user/10000001";

    callAPI(identity_api, function (err, result) {
        if (err)
            callback(err);
        else
            console.log(JSON.stringify(result));

        var res = JSON.stringify(result);

        if (res.indexOf('10000001') >= 0) {
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

