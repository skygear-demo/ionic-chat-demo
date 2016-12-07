# Chat app using Ionic, backed by SkygearIO

## Prerequisites

- Node.js >= 4

## Get started

### Install Dependencies

```
$ npm install
```

### Restore ionic app state

```
$ npm run ionic state reset
```

### Update skygear credentials

Get your skygear api credentials from portal and replace
string in the following code snippet in `www/js/app.js`.

```
skygear.config({
  endPoint: '<API_ENDPOINT>',
  apiKey: '<API_KEY>'
}).then(function(client) {
  ...
```

### Run your app

Open xcode to fulfill code signing requirement for the first time.

```
$ open platforms/ios/Ionic\ Chat\ Demo.xcodeproj
```

After that we can build app using command line.

```
$ npm run ionic emulate ios
```

### Build to device

Open xcode and select build device and start build.

```
$ open platforms/ios/Ionic\ Chat\ Demo.xcodeproj
```
