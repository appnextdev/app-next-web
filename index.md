## Future Is Now

*AppNext* enables you, to develop and deploy modern apps without the need to install them on any device. This is accomplished by using modern APIs which are currently supported by **most** browsers.

It is ideal to use *AppNext* if your app is:

* **Straightforward** - clean UI, easy to use and operate 
* **Transparent** - not required to be installed on hosted device
* **Dynamic** - quick changes in your app will not involve users by asking them to update anything
* **Trustworthy** - serve a simple concept for users witout trying to exploit them or their devices
* **Highly Available** - hosted on fast storage or it is cloud based and available when users request it

It is also worth mentioning that *AppNext* will probably be more suitable for users that:

* Have rapid connection to the internet - your app will probably **not** work or be available offline
* Using modern browsers on their devices - to ensure that they emjoy the full experience your app has to offer
* Curious by nature - your app will be something different than what they are already used to

*AppNext* may suit you for the following usecases:

* POC (proof of concept) - you intend to create an app as fast as possible to allow testing and get feedbacks from early users / beta testers
* Lightweight app - your app will not use advanced device features or heavily integrate with hosting device
* Alpha / Beta phases - many times apps are changing fast during their early phases of development. Without any installation required, your changes will be affected instatly

## Background

Ever had a great idea for a life-changing app? Or even a tiny silly application, just for fun? Well, congrats! you've got a great idea - it's a great place to start. All you need to do now is to develop your app and deploy it to the world, right? Unfortunately, developing & deploying modern apps can result in an overwhelming process which requires a lot of effort. The funny thing is that many modern apps are simply hosted on device (almost like modern websites) without truly use their hosted device capacity.

*AppNext* project suggest, that one can simply devlop a lightweight app running on-top of device browser (with the same UX as regular app) and easliy deploy it (just like publishing a website). This is done by using modern APIs which are supported on most modern web browsers. Start as small and flexible as possible - extend your app only when you need it. 

## Feature Support

How can you tell if this project supports your app requirements? By default, *AppNext* project try to support as many featutres as possible while informing the developer if a feature is not supported on a specific device. The best way is to test it yourself by using the project test pages
* Core
    * [Compatibility Check](/test/core.load.html) - verify that your browser supports AppNext project
* Elements
    * [File Saver](/test/core.file-saver.html) - save data from your app as a file in hosting device
    * [Media Picker](/test/core.media-picker.html) - capture or select audio, images and videos
* Providers
    * [Geolocation](/test/core.geolocation.html) - capture device current location and listen to position changes
    * [Notifications](/test/core.notification.html) - manage application notifications
* Sensors
    * [Accelerometer](/test/core.accelerometer.html) - get x,y,z coordinates of device acceleration forces
    * [Gyroscope](/test/core.gyroscope.html) - get x,y,z coordinates of angular velocity
    * [Light](/test/core.light.html) - detect the illuminance volume around your device
    * [Magnetometer](/test/core.magnetometer.html) - retrive the magnetic field detected by device
* Utils
    * [Objects Reflector](/test/core.reflector.html) - attach objects and reflect changes on them when their values changed
    * [Tasks Scheduler](/test/core.scheduler.html) - manage scheduled tasks (can be combined to fire notifications as well)
    


