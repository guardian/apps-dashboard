var jenkinsapi = require('/node_modules/jenkins-api/lib/main.js');

nconf.file({file: '../config.json'});
var userID = nconf.get('jenkins userID');
var apiToken = nconf.get('jenkins APIToken');
console.log('Jenkins userID is ' + userID);
console.log('jenkins APIToken is ' + apiToken);

// API Token
var jenkins = jenkinsapi.init('https://' + userID + ':' + apiToken + '@iosuiauto.gutools.co.uk:8080');


jenkins.job_info('job-in-jenkins', function (err, data) {
    if (err) {
        return console.log(err);
    }
    console.log(data)
});




