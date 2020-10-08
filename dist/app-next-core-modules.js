System.register("handlers/data", [], function (exports_1, context_1) {
    "use strict";
    var AppNextDataEvents;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            AppNextDataEvents = class AppNextDataEvents {
                constructor() {
                    this.waiting = false;
                }
                static from(listeners) {
                    const handler = new AppNextDataEvents();
                    handler.onCancel = listeners.onCancel;
                    handler.onData = listeners.onData;
                    handler.onError = listeners.onError;
                    handler.onPending = listeners.onPending;
                    handler.onReady = listeners.onReady;
                    return handler;
                }
                set onCancel(listener) { this.cancel = listener; }
                set onData(listener) { this.data = listener; }
                set onError(listener) { this.error = listener; }
                set onPending(listener) { this.pending = listener; }
                set onReady(listener) { this.ready = listener; }
                invokeCancelEvent(error) {
                    try {
                        if (this.cancel)
                            this.cancel(error);
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
                invokeDataEvent(data) {
                    try {
                        if (this.data)
                            this.data(data);
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
                invokeErrorEvent(error) {
                    if (this.error)
                        this.error(error);
                }
                invokePendingEvent() {
                    try {
                        this.waiting = true;
                        if (this.pending)
                            this.pending();
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
                invokeReadyEvent() {
                    try {
                        if (!this.waiting)
                            this.invokePendingEvent();
                        if (this.ready)
                            this.ready();
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
            };
            exports_1("AppNextDataEvents", AppNextDataEvents);
        }
    };
});
System.register("handlers/error", [], function (exports_2, context_2) {
    "use strict";
    var Errors, errors;
    var __moduleName = context_2 && context_2.id;
    function error(code) {
        const info = errors[Errors[code]];
        if (!info)
            return new Error();
        const error = new Error(info.message);
        error.name = info.name;
        return error;
    }
    exports_2("error", error);
    return {
        setters: [],
        execute: function () {
            (function (Errors) {
                Errors[Errors["acceptNotSupported"] = 0] = "acceptNotSupported";
                Errors[Errors["captureNotSupported"] = 1] = "captureNotSupported";
                Errors[Errors["downloadNotSupported"] = 2] = "downloadNotSupported";
                Errors[Errors["featureTerminated"] = 3] = "featureTerminated";
                Errors[Errors["invalidConfig"] = 4] = "invalidConfig";
                Errors[Errors["invalidFactoryFunction"] = 5] = "invalidFactoryFunction";
                Errors[Errors["notificationError"] = 6] = "notificationError";
                Errors[Errors["notificationNotFound"] = 7] = "notificationNotFound";
                Errors[Errors["permissionDenied"] = 8] = "permissionDenied";
            })(Errors || (Errors = {}));
            exports_2("Errors", Errors);
            errors = {
                acceptNotSupported: { name: 'accept not supported', message: 'Input element "accept" attribute is not supported by this device' },
                captureNotSupported: { name: 'capture not supported', message: 'Input element "capture" attribute is not supported by this device' },
                downloadNotSupported: { name: 'download not supported', message: 'Link element "download" attribute is not supported by this device' },
                featureTerminated: { name: 'feature terminated', message: 'Current feature terminated due to user action' },
                invalidConfig: { name: 'invalid config', message: 'Config object is missing required members' },
                invalidFactoryFunction: { name: 'invalid factory', message: 'Factory function must provide a valid handler instance' },
                notificationError: { name: 'notification error', message: 'An error raised while handling notification' },
                notificationNotFound: { name: 'notification not found', message: 'Notification not found in service worker registration' },
                permissionDenied: { name: 'permission denied', message: 'Requested permission denied by user' }
            };
        }
    };
});
System.register("providers/permission", ["handlers/data", "handlers/error"], function (exports_3, context_3) {
    "use strict";
    var data_1, error_1, AppNextPermissionProvider;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (data_1_1) {
                data_1 = data_1_1;
            },
            function (error_1_1) {
                error_1 = error_1_1;
            }
        ],
        execute: function () {
            AppNextPermissionProvider = class AppNextPermissionProvider extends data_1.AppNextDataEvents {
                constructor(permissions) {
                    super();
                    this.permissions = Array.isArray(permissions) ? permissions : [permissions];
                }
                handle(permission) {
                    try {
                        switch (permission) {
                            case 'granted':
                                this.invokeReadyEvent();
                                return true;
                            case 'prompt':
                                this.invokePendingEvent();
                                return false;
                            case 'denied':
                            default:
                                this.invokeCancelEvent(error_1.error(error_1.Errors.permissionDenied));
                                return false;
                        }
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                        return false;
                    }
                }
                register() {
                    const request = this.permissions.map(permission => navigator.permissions.query({ name: permission }));
                    return Promise.all(request).then(permissions => {
                        permissions.forEach(permission => {
                            this.handle(permission.state);
                            permission.onchange = () => this.handle(permission.state);
                        });
                    });
                }
            };
            exports_3("AppNextPermissionProvider", AppNextPermissionProvider);
        }
    };
});
System.register("handlers/watch", ["handlers/data", "providers/permission"], function (exports_4, context_4) {
    "use strict";
    var data_2, permission_1, AppNextWatch;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (data_2_1) {
                data_2 = data_2_1;
            },
            function (permission_1_1) {
                permission_1 = permission_1_1;
            }
        ],
        execute: function () {
            AppNextWatch = class AppNextWatch extends data_2.AppNextDataEvents {
                constructor(permissions) {
                    super();
                    this.permission = new permission_1.AppNextPermissionProvider(permissions);
                    this.permission.onCancel = error => this.invokeCancelEvent(error);
                    this.permission.onError = error => this.invokeErrorEvent(error);
                    this.permission.onPending = () => this.invokePendingEvent();
                    this.permission.onReady = () => this.invokeReadyEvent();
                }
                request() {
                    return this.permission.register();
                }
            };
            exports_4("AppNextWatch", AppNextWatch);
        }
    };
});
System.register("sensors/base/sensor", ["handlers/watch", "handlers/error"], function (exports_5, context_5) {
    "use strict";
    var watch_1, error_2, AppNextSensor;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (watch_1_1) {
                watch_1 = watch_1_1;
            },
            function (error_2_1) {
                error_2 = error_2_1;
            }
        ],
        execute: function () {
            AppNextSensor = class AppNextSensor extends watch_1.AppNextWatch {
                constructor(factory, permissions) {
                    super(permissions);
                    this.factory = factory;
                }
                request() {
                    if (!this.factory)
                        return Promise.reject(error_2.error(error_2.Errors.invalidFactoryFunction));
                    this.invokePendingEvent();
                    return super.request().then(() => {
                        try {
                            this.handler = this.factory();
                        }
                        catch (error) {
                            switch (error.name) {
                                case 'SecurityError':
                                case 'ReferenceError':
                                    return this.invokeCancelEvent(error);
                                default:
                                    this.invokeErrorEvent(error);
                            }
                        }
                    }).catch(error => this.invokeErrorEvent(error));
                }
                start() {
                    const invoke = () => {
                        this.handler.start();
                        this.invokeReadyEvent();
                    };
                    if (this.handler) {
                        invoke();
                        return Promise.resolve();
                    }
                    else {
                        return this.request().then(() => {
                            if (!this.handler)
                                return;
                            this.handler.onerror = event => {
                                switch (event.error.name) {
                                    case 'NotAllowedError':
                                    case 'NotReadableError':
                                        return this.invokeCancelEvent(event.error);
                                    default:
                                        return this.invokeErrorEvent(event.error);
                                }
                            };
                            this.handler.onreading = () => this.invokeDataEvent(this.handler);
                            invoke();
                        }).catch(error => {
                            this.invokeErrorEvent(error);
                        });
                    }
                }
                stop() {
                    if (this.handler) {
                        this.handler.stop();
                        this.invokeCancelEvent(error_2.error(error_2.Errors.featureTerminated));
                        return true;
                    }
                    return false;
                }
            };
            exports_5("AppNextSensor", AppNextSensor);
        }
    };
});
System.register("sensors/accelerometer", ["sensors/base/sensor"], function (exports_6, context_6) {
    "use strict";
    var sensor_1, AppNextAccelerometerSensor;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (sensor_1_1) {
                sensor_1 = sensor_1_1;
            }
        ],
        execute: function () {
            AppNextAccelerometerSensor = class AppNextAccelerometerSensor extends sensor_1.AppNextSensor {
                constructor(options) {
                    super(() => new Accelerometer(options), 'accelerometer');
                }
            };
            exports_6("AppNextAccelerometerSensor", AppNextAccelerometerSensor);
        }
    };
});
System.register("providers/geolocation", ["handlers/watch", "handlers/error"], function (exports_7, context_7) {
    "use strict";
    var watch_2, error_3, AppNextGeoLocationProvider;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (watch_2_1) {
                watch_2 = watch_2_1;
            },
            function (error_3_1) {
                error_3 = error_3_1;
            }
        ],
        execute: function () {
            AppNextGeoLocationProvider = class AppNextGeoLocationProvider extends watch_2.AppNextWatch {
                constructor(options) {
                    super('geolocation');
                    this.options = options;
                }
                start() {
                    return new Promise((resolve, reject) => {
                        var init = true;
                        this.id = navigator.geolocation.watchPosition(position => {
                            if (init) {
                                init = false;
                                this.invokeReadyEvent();
                            }
                            this.invokeDataEvent(position);
                            resolve();
                        }, error => {
                            if (init) {
                                this.invokeCancelEvent(new Error(error.message));
                            }
                            else {
                                this.invokeErrorEvent(new Error(error.message));
                            }
                            reject();
                        }, this.options || {});
                    });
                }
                stop() {
                    if (!this.id)
                        return false;
                    try {
                        navigator.geolocation.clearWatch(this.id);
                        this.id = null;
                        this.invokeCancelEvent(error_3.error(error_3.Errors.featureTerminated));
                        return true;
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                        return false;
                    }
                }
            };
            exports_7("AppNextGeoLocationProvider", AppNextGeoLocationProvider);
        }
    };
});
System.register("sensors/gyroscope", ["sensors/base/sensor"], function (exports_8, context_8) {
    "use strict";
    var sensor_2, AppNextGyroscopeSensor;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (sensor_2_1) {
                sensor_2 = sensor_2_1;
            }
        ],
        execute: function () {
            AppNextGyroscopeSensor = class AppNextGyroscopeSensor extends sensor_2.AppNextSensor {
                constructor(options) {
                    super(() => new Gyroscope(options), 'gyroscope');
                }
            };
            exports_8("AppNextGyroscopeSensor", AppNextGyroscopeSensor);
        }
    };
});
System.register("sensors/light", ["sensors/base/sensor"], function (exports_9, context_9) {
    "use strict";
    var sensor_3, AppNextLightSensor;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (sensor_3_1) {
                sensor_3 = sensor_3_1;
            }
        ],
        execute: function () {
            AppNextLightSensor = class AppNextLightSensor extends sensor_3.AppNextSensor {
                constructor(options) {
                    super(() => new AmbientLightSensor(options), 'ambient-light-sensor');
                }
            };
            exports_9("AppNextLightSensor", AppNextLightSensor);
        }
    };
});
System.register("sensors/magnetometer", ["sensors/base/sensor"], function (exports_10, context_10) {
    "use strict";
    var sensor_4, AppNextMagnetometerSensor;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (sensor_4_1) {
                sensor_4 = sensor_4_1;
            }
        ],
        execute: function () {
            AppNextMagnetometerSensor = class AppNextMagnetometerSensor extends sensor_4.AppNextSensor {
                constructor(options) {
                    super(() => new Magnetometer(options), 'magnetometer');
                }
            };
            exports_10("AppNextMagnetometerSensor", AppNextMagnetometerSensor);
        }
    };
});
System.register("handlers/pubsub", ["handlers/data"], function (exports_11, context_11) {
    "use strict";
    var data_3, AppNextPubSubManager;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (data_3_1) {
                data_3 = data_3_1;
            }
        ],
        execute: function () {
            AppNextPubSubManager = class AppNextPubSubManager extends data_3.AppNextDataEvents {
                constructor(post) {
                    super();
                    this.listeners = [];
                    this.post = post;
                }
                invoke(event) {
                    this.listeners.forEach(listener => {
                        try {
                            listener.call({}, event);
                        }
                        catch (error) {
                            this.invokeErrorEvent(error);
                        }
                    });
                }
                publish(message) {
                    return this.post ? this.post(message) : false;
                }
                subscribe(listener) {
                    this.listeners.push(listener);
                }
                reset() {
                    this.listeners.splice(0, this.listeners.length);
                }
            };
            exports_11("AppNextPubSubManager", AppNextPubSubManager);
        }
    };
});
System.register("handlers/worker", ["handlers/data", "handlers/error", "handlers/pubsub"], function (exports_12, context_12) {
    "use strict";
    var data_4, error_4, pubsub_1, AppNextServiceWorker;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (data_4_1) {
                data_4 = data_4_1;
            },
            function (error_4_1) {
                error_4 = error_4_1;
            },
            function (pubsub_1_1) {
                pubsub_1 = pubsub_1_1;
            }
        ],
        execute: function () {
            AppNextServiceWorker = class AppNextServiceWorker extends data_4.AppNextDataEvents {
                constructor() {
                    super();
                    this.pubsub = new pubsub_1.AppNextPubSubManager(data => this.message(data));
                }
                invoke(handler) {
                    try {
                        if (handler)
                            handler(this.registration);
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                        return error;
                    }
                }
                message(data) {
                    try {
                        if (navigator.serviceWorker.controller) {
                            navigator.serviceWorker.controller.postMessage(data);
                            return true;
                        }
                        return false;
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                        return false;
                    }
                }
                subscribe(listener) {
                    this.pubsub.subscribe(listener);
                }
                start() {
                    if (this.registration)
                        return Promise.reject();
                    this.invokePendingEvent();
                    try {
                        navigator.serviceWorker.onmessage = event => this.pubsub.invoke(event);
                        navigator.serviceWorker.register('/app-next-service-worker.js');
                        return navigator.serviceWorker.ready.then(registration => {
                            this.registration = registration;
                            return registration.update();
                        }).then(() => {
                            this.invokeReadyEvent();
                            this.invokeDataEvent(this.registration);
                        }).catch(error => this.invokeCancelEvent(error));
                    }
                    catch (error) {
                        this.invokeCancelEvent(error);
                    }
                }
                stop() {
                    const handleError = (error) => {
                        if (error)
                            this.invokeErrorEvent(error);
                        return Promise.reject();
                    };
                    if (!this.registration)
                        return handleError();
                    return this.registration.unregister().then(success => {
                        if (success) {
                            this.invokeCancelEvent(error_4.error(error_4.Errors.featureTerminated));
                            return Promise.resolve();
                        }
                        return handleError();
                    });
                }
            };
            exports_12("AppNextServiceWorker", AppNextServiceWorker);
        }
    };
});
System.register("providers/notifications", ["handlers/watch", "handlers/error", "handlers/data"], function (exports_13, context_13) {
    "use strict";
    var watch_3, error_5, data_5, AppNextNotificationsProvider;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (watch_3_1) {
                watch_3 = watch_3_1;
            },
            function (error_5_1) {
                error_5 = error_5_1;
            },
            function (data_5_1) {
                data_5 = data_5_1;
            }
        ],
        execute: function () {
            AppNextNotificationsProvider = class AppNextNotificationsProvider extends watch_3.AppNextWatch {
                constructor(worker) {
                    super('notifications');
                    this.active = false;
                    this.registry = {};
                    worker.subscribe(event => {
                        const message = event.data;
                        switch (message.source) {
                            case 'notification':
                                const close = () => {
                                    delete this.registry[event.id];
                                    registry.events.invokeCancelEvent(error_5.error(error_5.Errors.featureTerminated));
                                }, event = message.event;
                                if (!event)
                                    return;
                                const registry = this.registry[event.id];
                                if (!event.id || !registry)
                                    return;
                                switch (message.on) {
                                    case 'click':
                                        registry.events.invokeDataEvent(event);
                                        this.query(event.id).catch(() => close());
                                        break;
                                    case 'close':
                                        close();
                                        break;
                                }
                        }
                    });
                    this.worker = worker;
                }
                query(tag) {
                    return new Promise((resolve, reject) => {
                        const error = this.worker.invoke(registration => {
                            registration.getNotifications({ tag }).then(notifications => {
                                const notification = notifications[0];
                                notification ? resolve(notification) : reject();
                            }).catch(reject);
                        });
                        if (error)
                            reject(error);
                    });
                }
                create(title, listeners, options) {
                    if (!this.active)
                        return;
                    const events = data_5.AppNextDataEvents.from(listeners), id = 'app-next-' + new Date().getTime().toString(36);
                    events.invokePendingEvent();
                    this.worker.invoke(registration => {
                        registration.showNotification(title, Object.assign(options, { tag: id }))
                            .then(() => this.query(id))
                            .then(notification => {
                            this.registry[id] = { events, notification };
                            this.invokeDataEvent(notification);
                            events.invokeReadyEvent();
                        }).catch((error) => events.invokeCancelEvent(error));
                    });
                }
                request() {
                    return new Promise((resolve, reject) => {
                        const handlePermission = (permission) => {
                            if (handling)
                                return;
                            handling = true;
                            this.active = true;
                            if (!this.permission.handle(permission)) {
                                this.active = false;
                            }
                            resolve();
                        };
                        var handling = false;
                        const handler = Notification.requestPermission(handlePermission);
                        if (handler instanceof Promise) {
                            handler.then(handlePermission).catch(error => {
                                this.active = false;
                                this.invokeErrorEvent(error);
                                reject(error);
                            });
                        }
                    });
                }
                start() {
                    return this.active ? Promise.reject() : this.request();
                }
                stop() {
                    if (!this.active)
                        return false;
                    this.active = false;
                    try {
                        const keys = Object.keys(this.registry), count = keys.length;
                        keys.forEach(key => {
                            const registry = this.registry[key];
                            try {
                                registry.notification.close();
                                registry.events.invokeCancelEvent(error_5.error(error_5.Errors.featureTerminated));
                            }
                            catch (error) {
                                registry.events.invokeErrorEvent(error);
                            }
                        });
                        for (let i = 0; i < count; i++) {
                            delete this.registry[keys[i]];
                        }
                        this.invokeCancelEvent(error_5.error(error_5.Errors.featureTerminated));
                        return true;
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                        return false;
                    }
                }
            };
            exports_13("AppNextNotificationsProvider", AppNextNotificationsProvider);
        }
    };
});
System.register("handlers/background", ["handlers/data", "handlers/error"], function (exports_14, context_14) {
    "use strict";
    var data_6, error_6, AppNextBackgroundService;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (data_6_1) {
                data_6 = data_6_1;
            },
            function (error_6_1) {
                error_6 = error_6_1;
            }
        ],
        execute: function () {
            AppNextBackgroundService = class AppNextBackgroundService extends data_6.AppNextDataEvents {
                constructor(script) {
                    super();
                    this.code = 'data:application/x-javascript;base64,' + btoa(script);
                }
                request() {
                    try {
                        if (this.worker)
                            return;
                        this.worker = new Worker(this.code);
                        this.invokePendingEvent();
                    }
                    catch (error) {
                        this.invokeCancelEvent(error);
                    }
                }
                post(data) {
                    try {
                        this.worker.postMessage(data);
                        return true;
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                        return false;
                    }
                }
                start() {
                    if (!this.worker) {
                        this.request();
                        if (!this.worker)
                            return false;
                    }
                    try {
                        this.worker.onerror = event => this.invokeErrorEvent(new Error(event.message));
                        this.worker.onmessage = event => {
                            try {
                                this.invokeDataEvent(event);
                            }
                            catch (error) {
                                this.invokeErrorEvent(error);
                            }
                        };
                        this.invokeReadyEvent();
                        return true;
                    }
                    catch (error) {
                        this.invokeCancelEvent(error);
                        return false;
                    }
                }
                stop(data) {
                    return new Promise((resolve, reject) => {
                        try {
                            if (arguments.length == 1)
                                this.post(data);
                            setTimeout(() => {
                                this.worker.terminate();
                                this.worker.onerror = this.worker.onmessage = null;
                                this.invokeCancelEvent(error_6.error(error_6.Errors.featureTerminated));
                                resolve();
                            }, 10);
                        }
                        catch (error) {
                            this.invokeErrorEvent(error);
                            reject();
                        }
                    });
                }
            };
            exports_14("AppNextBackgroundService", AppNextBackgroundService);
        }
    };
});
System.register("core", ["sensors/accelerometer", "providers/geolocation", "sensors/gyroscope", "sensors/light", "sensors/magnetometer", "providers/notifications", "handlers/worker", "handlers/data", "handlers/error", "handlers/pubsub", "handlers/background"], function (exports_15, context_15) {
    "use strict";
    var accelerometer_1, geolocation_1, gyroscope_1, light_1, magnetometer_1, notifications_1, worker_1, data_7, error_7, pubsub_2, background_1, AppNextCore;
    var __moduleName = context_15 && context_15.id;
    function config(name) {
        const object = (AppNextCore.config || {})[name] || {};
        object.name = name;
        return object;
    }
    exports_15("config", config);
    return {
        setters: [
            function (accelerometer_1_1) {
                accelerometer_1 = accelerometer_1_1;
            },
            function (geolocation_1_1) {
                geolocation_1 = geolocation_1_1;
            },
            function (gyroscope_1_1) {
                gyroscope_1 = gyroscope_1_1;
            },
            function (light_1_1) {
                light_1 = light_1_1;
            },
            function (magnetometer_1_1) {
                magnetometer_1 = magnetometer_1_1;
            },
            function (notifications_1_1) {
                notifications_1 = notifications_1_1;
            },
            function (worker_1_1) {
                worker_1 = worker_1_1;
            },
            function (data_7_1) {
                data_7 = data_7_1;
            },
            function (error_7_1) {
                error_7 = error_7_1;
            },
            function (pubsub_2_1) {
                pubsub_2 = pubsub_2_1;
            },
            function (background_1_1) {
                background_1 = background_1_1;
            }
        ],
        execute: function () {
            AppNextCore = class AppNextCore extends data_7.AppNextDataEvents {
                constructor(events) {
                    super();
                    this.onCancel = events.onCancel;
                    this.onData = events.onData;
                    this.onError = events.onError;
                    this.onPending = events.onPending;
                    this.onReady = events.onReady;
                    this.providers =
                        {
                            geolocation: null,
                            notifications: null
                        };
                    this.sensors =
                        {
                            accelerometer: null,
                            gyroscope: null,
                            light: null,
                            magnetometer: null
                        };
                    this.pubsub = new pubsub_2.AppNextPubSubManager(message => this.service.post(message));
                    this.service = new background_1.AppNextBackgroundService('onmessage = event => postMessage(event.data)');
                    this.service.onError = error => this.invokeErrorEvent(error);
                    this.service.onData = event => this.pubsub.invoke(event);
                    this.worker = new worker_1.AppNextServiceWorker();
                }
                config(value) { AppNextCore.config = value || {}; }
                publish(message, topic) {
                    if (!(message instanceof Object))
                        message = { message };
                    return this.pubsub.publish(Object.assign(message, { topic }));
                }
                subscribe(listener, topic) {
                    this.pubsub.subscribe((event) => {
                        if (topic == event.data.topic)
                            listener(event);
                    });
                }
                start() {
                    try {
                        const handle = {
                            notifications: null
                        };
                        this.worker.onError = error => this.invokeErrorEvent(error);
                        this.worker.onReady = () => {
                            this.providers.geolocation = (options) => new geolocation_1.AppNextGeoLocationProvider(options);
                            this.providers.notifications = () => {
                                if (!handle.notifications) {
                                    handle.notifications = new notifications_1.AppNextNotificationsProvider(this.worker);
                                }
                                return handle.notifications;
                            };
                            this.sensors.accelerometer = (options) => new accelerometer_1.AppNextAccelerometerSensor(options);
                            this.sensors.gyroscope = (options) => new gyroscope_1.AppNextGyroscopeSensor(options);
                            this.sensors.light = (options) => new light_1.AppNextLightSensor(options);
                            this.sensors.magnetometer = (options) => new magnetometer_1.AppNextMagnetometerSensor(options);
                        };
                        return this.worker.start().then(() => {
                            this.service.onReady = () => {
                                this.invokeReadyEvent();
                                this.invokeDataEvent(this);
                            };
                            this.service.start();
                        }).catch(error => this.invokeCancelEvent(error));
                    }
                    catch (error) {
                        this.invokeCancelEvent(error);
                        return Promise.reject();
                    }
                }
                stop() {
                    const tasks = [
                        this.service.stop(),
                        this.worker.stop()
                    ];
                    return Promise.all(tasks)
                        .then(() => this.invokeCancelEvent(error_7.error(error_7.Errors.featureTerminated)))
                        .catch(error => this.invokeErrorEvent(error));
                }
            };
            exports_15("AppNextCore", AppNextCore);
        }
    };
});
System.register("elements/base/utils", ["core"], function (exports_16, context_16) {
    "use strict";
    var core_1, AppNextCustomElementUtils;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            }
        ],
        execute: function () {
            AppNextCustomElementUtils = class AppNextCustomElementUtils {
                constructor(container) {
                    this.support = {
                        attribute: (element, name) => {
                            const handler = document.createElement(element);
                            if (name in handler)
                                return true;
                            handler.setAttribute(name, true);
                            return !!handler[name];
                        }
                    };
                    this.container = container;
                }
                attribute(name, value) {
                    switch (arguments.length) {
                        case 1: return this.container.getAttribute(name);
                        case 2: this.container.setAttribute(name, value);
                    }
                }
                config() {
                    return core_1.config(this.attribute('config'));
                }
                element(type) {
                    const element = document.createElement(type);
                    this.container.attachShadow({ mode: 'open' });
                    this.container.shadowRoot.append(element);
                    return element;
                }
                reset() {
                    this.container.innerHTML = '';
                }
            };
            exports_16("AppNextCustomElementUtils", AppNextCustomElementUtils);
        }
    };
});
System.register("elements/base/element", ["elements/base/utils", "handlers/data"], function (exports_17, context_17) {
    "use strict";
    var utils_1, data_8, AppNextCustomElement;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (data_8_1) {
                data_8 = data_8_1;
            }
        ],
        execute: function () {
            AppNextCustomElement = class AppNextCustomElement extends HTMLElement {
                constructor() {
                    super();
                    this.events = new data_8.AppNextDataEvents();
                    this.utils = new utils_1.AppNextCustomElementUtils(this);
                }
            };
            exports_17("AppNextCustomElement", AppNextCustomElement);
        }
    };
});
System.register("elements/file-saver", ["elements/base/element", "handlers/error"], function (exports_18, context_18) {
    "use strict";
    var element_1, error_8, AppNextFileSaver;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (element_1_1) {
                element_1 = element_1_1;
            },
            function (error_8_1) {
                error_8 = error_8_1;
            }
        ],
        execute: function () {
            AppNextFileSaver = class AppNextFileSaver extends element_1.AppNextCustomElement {
                render() {
                    const config = this.utils.config(), target = 'a';
                    this.utils.reset();
                    this.events.onCancel = config.oncancel;
                    if (!this.utils.support.attribute(target, 'download')) {
                        return this.events.invokeCancelEvent(error_8.error(error_8.Errors.downloadNotSupported));
                    }
                    if (!(config.data instanceof Function)) {
                        return this.events.invokeCancelEvent(error_8.error(error_8.Errors.invalidConfig));
                    }
                    try {
                        const element = this.utils.element(target), data = config.data.call(config), label = this.utils.attribute('label') || 'Save', name = this.utils.attribute('name') || new Date().getTime().toString(36), type = this.utils.attribute('type') || 'application/octet-stream';
                        this.events.onError = config.onerror;
                        this.events.onData = config.onsave;
                        this.events.onReady = config.onready;
                        element.download = name;
                        element.href = 'data:' + type + ',' + encodeURIComponent(data);
                        element.innerText = label;
                        element.onclick = element.ontouchend = () => {
                            this.events.invokeDataEvent({ data, name, type, size: (new TextEncoder().encode(data)).length });
                        };
                        this.events.invokeReadyEvent();
                    }
                    catch (error) {
                        this.events.invokeErrorEvent(error);
                    }
                }
            };
            exports_18("AppNextFileSaver", AppNextFileSaver);
        }
    };
});
System.register("elements/media-picker", ["elements/base/element", "handlers/error"], function (exports_19, context_19) {
    "use strict";
    var element_2, error_9, AppNextMediaPicker;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (element_2_1) {
                element_2 = element_2_1;
            },
            function (error_9_1) {
                error_9 = error_9_1;
            }
        ],
        execute: function () {
            AppNextMediaPicker = class AppNextMediaPicker extends element_2.AppNextCustomElement {
                render() {
                    this.utils.reset();
                    const target = 'input', config = this.utils.config(), element = this.utils.element(target), type = this.utils.attribute('type'), single = this.utils.attribute('single'), source = this.utils.attribute('source');
                    this.events.onCancel = config.oncancel;
                    this.events.onData = config.onmedia;
                    this.events.onError = config.onerror;
                    this.events.onReady = config.onready;
                    try {
                        if (source) {
                            if (this.utils.support.attribute(target, 'capture')) {
                                element.capture = source == 'auto' ? '' : source;
                            }
                            else {
                                this.events.invokeCancelEvent(error_9.error(error_9.Errors.captureNotSupported));
                            }
                        }
                        if (type) {
                            if (this.utils.support.attribute(target, 'accept')) {
                                element.accept = type + '/*';
                            }
                            else {
                                this.events.invokeCancelEvent(error_9.error(error_9.Errors.acceptNotSupported));
                            }
                        }
                        element.multiple = single == null || single == undefined || single != '';
                        element.onchange = () => this.events.invokeDataEvent(element.files);
                        element.type = 'file';
                        this.events.invokeReadyEvent();
                    }
                    catch (error) {
                        this.events.invokeErrorEvent(error);
                    }
                }
            };
            exports_19("AppNextMediaPicker", AppNextMediaPicker);
        }
    };
});
System.register("handlers/scheduler", ["handlers/background"], function (exports_20, context_20) {
    "use strict";
    var background_2, AppNextScheduler;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (background_2_1) {
                background_2 = background_2_1;
            }
        ],
        execute: function () {
            AppNextScheduler = class AppNextScheduler extends background_2.AppNextBackgroundService {
                constructor(seconds = 1) {
                    super(`
            function handleError(error)
            {
                throw error
            }

            const tasks = []

            setInterval(() =>
            {
                const count = tasks.length,
                      now = new Date().getTime()
    
                for (let i = 0; i < count; i++)
                {
                    const task = tasks.shift()

                    try
                    {
                        if (now > task.when)
                        {
                            postMessage(task)
                        }
                        else
                        {
                            tasks.push(task)
                        }
                    }
                    catch(error)
                    {
                        handleError(error)
                    }
                }

            }, ${seconds * 1000})

            onmessage = event =>
            {
                try
                {
                    const task = event.data

                    if (!(task.when instanceof Date) || !(task.key))
                    {
                        const error = new Error('Invalid task object')

                        error.name = 'invalid task'; handleError(error)
                    }

                    task.when.setMilliseconds(0)
                    task.when = task.when.getTime()
                    tasks.push(task)
                }
                catch(error)
                {
                    handleError(error)
                }
            }
        `);
                    this.tasks = {};
                    this.onData = event => {
                        const task = this.tasks[event.data.key];
                        if (!task)
                            return;
                        task.what.call(task.context || {});
                        this.invokeExecuteEvent(task);
                    };
                }
                set onExecute(listener) { this.execute = listener; }
                set onRegister(listener) { this.register = listener; }
                invokeExecuteEvent(task) {
                    if (this.execute)
                        this.execute(task);
                }
                invokeRegisterEvent(task) {
                    if (this.register)
                        this.register(task);
                }
                post(task) {
                    try {
                        const key = new Date().getTime().toString(36);
                        this.tasks[key] = task;
                        super.post({ key, when: task.when });
                        this.invokeRegisterEvent(task);
                        return true;
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                        return false;
                    }
                }
            };
            exports_20("AppNextScheduler", AppNextScheduler);
        }
    };
});
System.register("handlers/reflector", [], function (exports_21, context_21) {
    "use strict";
    var AppNextReflector;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [],
        execute: function () {
            AppNextReflector = class AppNextReflector {
                constructor(events) {
                    this.events = events;
                    this.start();
                }
                invoke(name, args = []) {
                    const handler = this.events[name];
                    if (this.active && handler instanceof Function)
                        handler.apply(this, args);
                }
                attach(object) {
                    return object instanceof Object ? new Proxy(object, {
                        deleteProperty: (target, name) => {
                            if (name in target) {
                                delete target[name];
                                this.invoke('onMemberRemove', [target, name]);
                                return true;
                            }
                            return false;
                        },
                        set: (target, name, value) => {
                            var method;
                            if (name in target) {
                                value =
                                    {
                                        current: value,
                                        previous: target[name] instanceof Object ? JSON.parse(JSON.stringify(target[name])) : target[name]
                                    };
                                method = 'onMemberUpdate';
                            }
                            else {
                                method = 'onMemberAttach';
                            }
                            target[name] = value;
                            this.invoke(method, [target, name, value]);
                            return true;
                        }
                    }) : null;
                }
                start() {
                    return this.active = true;
                }
                stop() {
                    return this.active = false;
                }
            };
            exports_21("AppNextReflector", AppNextReflector);
        }
    };
});
System.register("setup", ["handlers/background", "elements/file-saver", "elements/media-picker", "elements/base/element", "handlers/scheduler", "handlers/reflector"], function (exports_22, context_22) {
    "use strict";
    var background_3, file_saver_1, media_picker_1, element_3, scheduler_1, reflector_1, AppNextSetupRegistry, AppNextCustomElementsRegistry, AppNextServicesRegistry, AppNextRenderer, AppNextSetup;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (background_3_1) {
                background_3 = background_3_1;
            },
            function (file_saver_1_1) {
                file_saver_1 = file_saver_1_1;
            },
            function (media_picker_1_1) {
                media_picker_1 = media_picker_1_1;
            },
            function (element_3_1) {
                element_3 = element_3_1;
            },
            function (scheduler_1_1) {
                scheduler_1 = scheduler_1_1;
            },
            function (reflector_1_1) {
                reflector_1 = reflector_1_1;
            }
        ],
        execute: function () {
            AppNextSetupRegistry = class AppNextSetupRegistry {
                constructor() {
                    this.registry = {};
                }
                exists(key) {
                    return this.registry[key] ? true : false;
                }
                update(key, value) {
                    this.registry[key] = value;
                }
            };
            AppNextCustomElementsRegistry = class AppNextCustomElementsRegistry extends AppNextSetupRegistry {
                constructor() {
                    super();
                    this.register('file-saver', file_saver_1.AppNextFileSaver);
                    this.register('media-picker', media_picker_1.AppNextMediaPicker);
                    this.CustomElement = element_3.AppNextCustomElement;
                }
                register(name, ctor) {
                    if (!customElements || this.exists(name))
                        return null;
                    customElements.define(name, ctor);
                    this.update(name, ctor);
                    return ctor;
                }
            };
            AppNextServicesRegistry = class AppNextServicesRegistry extends AppNextSetupRegistry {
                register(path, worker) {
                    if (!window.Worker || this.exists(path))
                        return null;
                    this.update(path, worker);
                    return worker;
                }
            };
            AppNextRenderer = class AppNextRenderer {
                custom(elements) {
                    elements.forEach(element => this.render(document.querySelectorAll(element)));
                }
                render(elements = document.querySelectorAll('*')) {
                    elements.forEach((element) => {
                        if (element.render instanceof Function)
                            element.render();
                    });
                }
            };
            AppNextSetup = class AppNextSetup {
                constructor() {
                    this.register = {
                        element: (name, ctor) => {
                            return this.elements.register(name, ctor);
                        },
                        reflector: (events) => {
                            return new reflector_1.AppNextReflector(events);
                        },
                        scheduler: (seconds) => {
                            if (!this.scheduler) {
                                this.scheduler = new scheduler_1.AppNextScheduler(seconds);
                            }
                            return this.scheduler;
                        },
                        service: (name, script) => {
                            return this.services.register(name, new background_3.AppNextBackgroundService(script));
                        }
                    };
                    this.elements = new AppNextCustomElementsRegistry();
                    this.renderer = new AppNextRenderer();
                    this.services = new AppNextServicesRegistry();
                    addEventListener('load', () => {
                        this.renderer.custom(Object.keys(this.elements.registry));
                    });
                }
                render(elements) {
                    this.renderer.render(elements);
                }
            };
            exports_22("AppNextSetup", AppNextSetup);
        }
    };
});
