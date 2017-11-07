# Apps Dashboard

Dashboard with data relating to the iOS app.

## Configuration

This project depends on a `config.json` existing on the root with the following
structure. sup

    {
      "username": "",
      "secret": "",
      "itc_username": "",
      "itc_secret": "",
      "crittercism_username": "",
      "crittercism_password": "",
      "crittercism_clientid": "",
      "appannie_apikey": "",
      "appannie_androidProductID": "",
      "appannie_iosProductID": "",
      "gmail_user": "",
      "gmail_password": ""
    }

## Building

    cd ios
    make -j8
    open dashboard.html
