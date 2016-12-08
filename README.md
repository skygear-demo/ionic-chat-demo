# Chat app using Ionic, backed by SkygearIO

This is a working ionic project demonstrating usage of SkygearIO
[chat plugin](https://github.com/skygeario/chat).

This demo project project demonstrates the followings:

- How to load [Skygear-SDK-JS](https://github.com/skygeario/skygear-SDK-JS) in
  ionic and Angular
- How to use [chat-SDK-JS](https://github.com/skygeario/chat-SDK-JS)

## Run the Demo 

### Prerequisites
- Node.js >= 4

For the first time runner, install the dependencies and restore ionic project
using following command.

```
$ git submodule init
$ git submodule update
$ npm install
$ npm run ionic state reset
```

Than run the application development server with following command

```
npm run ionic serve
```

### Update Skygear credentials to your personal one

The demo code come with credential to a pre-register Skygear back-end. If you
want to replace it with your personal one. Please go to 
[portal](https://portal.skygear.io) register your own Skygear back-end and
update the setting in the code located at `www/js/app.js`.

```
skygear.config({
  endPoint: '<API_ENDPOINT>',
  apiKey: '<API_KEY>'
}).then(function(client) {
  ...
```

## Build your app to devices

Command to build to iOS simulator

```
$ npm run ionic emulate ios
```

If you want to build the chat app on real device, open the
generated Xcode project and correct the signing configuration.

```
$ open platforms/ios/Ionic\ Chat\ Demo.xcodeproj
```

Command to build to Android device

```
$ npm run ionic run android --device
```

PS: you will have to install the Android SDK first, please follow the
[official instruction](https://developer.android.com/studio/index.html)
