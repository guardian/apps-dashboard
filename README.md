# Apps Dashboard

Collection of dashboards related to the guardian apps.

## Builds

Mobile-friendly bootstrap/vue.js webpage providing over-the-air installation of
the latest development builds from TeamCity.

## Releases

Dashboard with the latest releases. Contains information like version number and
release date.

## ~~Changelog~~

No longer in use. Release notes are now posted to the [P&E/Apps/Releases chat channel](https://chat.google.com/room/AAAAGD0cCnc/YCe8IddTYZE).

On iOS this process is handled by github actions.

## Development

### Browser support

This site needs to support the same devices that our apps support. We need to take care to provide support for iOS Safari 9 and above.

### Install

```
$ npm install
```

### Builds

```
$ npm run start-builds
```

### Releases

```
$ npm start
```
