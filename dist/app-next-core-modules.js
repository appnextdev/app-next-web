System.register("handlers/data", [], function (exports_1, context_1) {
    "use strict";
    var AppNextDataEvents;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            AppNextDataEvents = class AppNextDataEvents {
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
                        if (this.pending)
                            this.pending();
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
                invokeReadyEvent() {
                    try {
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
                Errors[Errors["permissionDenied"] = 7] = "permissionDenied";
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
                register() {
                    function handlePermission(permission) {
                        try {
                            switch (permission.state) {
                                case 'granted': return provider.invokeReadyEvent();
                                case 'prompt': return provider.invokePendingEvent();
                                case 'denied':
                                default: return provider.invokeCancelEvent(error_1.error(error_1.Errors.permissionDenied));
                            }
                        }
                        catch (error) {
                            provider.invokeErrorEvent(error);
                        }
                    }
                    const provider = this;
                    const request = this.permissions.map(permission => navigator.permissions.query({ name: permission }));
                    return Promise.all(request).then(permissions => {
                        permissions.forEach(permission => {
                            handlePermission(permission);
                            permission.onchange = () => handlePermission(permission);
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
                    const invokePending = () => {
                        loading = false;
                        this.invokePendingEvent();
                    };
                    var loading = true;
                    this.permission = new permission_1.AppNextPermissionProvider(permissions);
                    this.permission.onCancel = error => this.invokeCancelEvent(error);
                    this.permission.onError = error => this.invokeErrorEvent(error);
                    this.permission.onPending = invokePending;
                    this.permission.onReady = () => {
                        if (loading)
                            invokePending();
                        this.invokeReadyEvent();
                    };
                }
                request() {
                    return this.permission.register();
                }
            };
            exports_4("AppNextWatch", AppNextWatch);
        }
    };
});
System.register("providers/geolocation", ["handlers/watch", "handlers/error"], function (exports_5, context_5) {
    "use strict";
    var watch_1, error_2, AppNextGeoLocationProvider;
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
            AppNextGeoLocationProvider = class AppNextGeoLocationProvider extends watch_1.AppNextWatch {
                constructor(options) {
                    super('geolocation');
                    this.options = options;
                }
                start() {
                    var init = true;
                    this.id = navigator.geolocation.watchPosition(position => {
                        if (init) {
                            init = false;
                            this.invokeReadyEvent();
                        }
                        this.invokeDataEvent(position);
                    }, error => {
                        if (init) {
                            this.invokeCancelEvent(new Error(error.message));
                        }
                        else {
                            this.invokeErrorEvent(new Error(error.message));
                        }
                    }, this.options || {});
                }
                stop() {
                    try {
                        if (!this.id)
                            return;
                        navigator.geolocation.clearWatch(this.id);
                        this.id = null;
                        this.invokeCancelEvent(error_2.error(error_2.Errors.featureTerminated));
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
            };
            exports_5("AppNextGeoLocationProvider", AppNextGeoLocationProvider);
        }
    };
});
System.register("sensors/base/sensor", ["handlers/watch", "handlers/error"], function (exports_6, context_6) {
    "use strict";
    var watch_2, error_3, AppNextSensor;
    var __moduleName = context_6 && context_6.id;
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
            AppNextSensor = class AppNextSensor extends watch_2.AppNextWatch {
                constructor(factory, permissions) {
                    super(permissions);
                    this.factory = factory;
                }
                request() {
                    if (!this.factory)
                        return Promise.reject(error_3.error(error_3.Errors.invalidFactoryFunction));
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
                    this.handler.start();
                    this.invokeReadyEvent();
                }
                stop() {
                    if (this.handler) {
                        this.handler.stop();
                        this.invokeCancelEvent(error_3.error(error_3.Errors.featureTerminated));
                    }
                }
            };
            exports_6("AppNextSensor", AppNextSensor);
        }
    };
});
System.register("sensors/accelerometer", ["sensors/base/sensor"], function (exports_7, context_7) {
    "use strict";
    var sensor_1, AppNextAccelerometer;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (sensor_1_1) {
                sensor_1 = sensor_1_1;
            }
        ],
        execute: function () {
            AppNextAccelerometer = class AppNextAccelerometer extends sensor_1.AppNextSensor {
                constructor(options) {
                    super(() => new Accelerometer(options), 'accelerometer');
                }
            };
            exports_7("AppNextAccelerometer", AppNextAccelerometer);
        }
    };
});
System.register("providers/notifications", ["handlers/watch", "handlers/error", "handlers/data"], function (exports_8, context_8) {
    "use strict";
    var watch_3, error_4, data_3, AppNextNotificationsProvider;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (watch_3_1) {
                watch_3 = watch_3_1;
            },
            function (error_4_1) {
                error_4 = error_4_1;
            },
            function (data_3_1) {
                data_3 = data_3_1;
            }
        ],
        execute: function () {
            AppNextNotificationsProvider = class AppNextNotificationsProvider extends watch_3.AppNextWatch {
                constructor() {
                    super('notifications');
                    this.notifications = [];
                }
                create(title, listeners, options) {
                    if (!this.active)
                        return;
                    const events = data_3.AppNextDataEvents.from(listeners), notification = new Notification(title, options);
                    notification.onclose = () => events.invokeCancelEvent(error_4.error(error_4.Errors.featureTerminated));
                    notification.onerror = () => events.invokeErrorEvent(error_4.error(error_4.Errors.notificationError));
                    notification.onclick = event => events.invokeDataEvent(event);
                    notification.onshow = () => events.invokeReadyEvent();
                    this.notifications.push(notification);
                    events.invokePendingEvent();
                    this.invokeDataEvent(notification);
                }
                start() {
                    this.active = true;
                    this.invokeReadyEvent();
                }
                stop() {
                    this.active = false;
                    try {
                        this.notifications.forEach(notification => notification.close());
                        this.notifications.splice(0, this.notifications.length);
                        this.invokeCancelEvent(error_4.error(error_4.Errors.featureTerminated));
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
            };
            exports_8("AppNextNotificationsProvider", AppNextNotificationsProvider);
        }
    };
});
System.register("core", ["providers/geolocation", "sensors/accelerometer", "providers/notifications"], function (exports_9, context_9) {
    "use strict";
    var geolocation_1, accelerometer_1, notifications_1, AppNextCore;
    var __moduleName = context_9 && context_9.id;
    function config(name) {
        const object = (AppNextCore.config || {})[name] || {};
        object.name = name;
        return object;
    }
    exports_9("config", config);
    return {
        setters: [
            function (geolocation_1_1) {
                geolocation_1 = geolocation_1_1;
            },
            function (accelerometer_1_1) {
                accelerometer_1 = accelerometer_1_1;
            },
            function (notifications_1_1) {
                notifications_1 = notifications_1_1;
            }
        ],
        execute: function () {
            AppNextCore = class AppNextCore {
                constructor() {
                    this.providers =
                        {
                            geolocation: (options) => new geolocation_1.AppNextGeoLocationProvider(options),
                            notifications: () => new notifications_1.AppNextNotificationsProvider()
                        };
                    this.sensors =
                        {
                            accelerometer: (options) => new accelerometer_1.AppNextAccelerometer(options)
                        };
                }
                config(value) { AppNextCore.config = value || {}; }
            };
            exports_9("AppNextCore", AppNextCore);
        }
    };
});
System.register("handlers/background", ["handlers/data", "handlers/error"], function (exports_10, context_10) {
    "use strict";
    var data_4, error_5, AppNextBackgroundService;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (data_4_1) {
                data_4 = data_4_1;
            },
            function (error_5_1) {
                error_5 = error_5_1;
            }
        ],
        execute: function () {
            AppNextBackgroundService = class AppNextBackgroundService extends data_4.AppNextDataEvents {
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
                    this.worker.postMessage(data);
                }
                start() {
                    if (!this.worker) {
                        this.request();
                        if (!this.worker)
                            return;
                    }
                    this.worker.onerror = event => this.invokeErrorEvent(event.error);
                    this.worker.onmessage = event => {
                        try {
                            this.invokeDataEvent(event);
                        }
                        catch (error) {
                            this.invokeErrorEvent(error);
                        }
                    };
                    this.invokeReadyEvent();
                }
                stop(data) {
                    try {
                        if (arguments.length == 1)
                            this.post(data);
                        setTimeout(() => {
                            this.worker.terminate();
                            this.worker.onerror = this.worker.onmessage = null;
                            this.invokeCancelEvent(error_5.error(error_5.Errors.featureTerminated));
                        }, 10);
                    }
                    catch (error) {
                        this.invokeErrorEvent(error);
                    }
                }
            };
            exports_10("AppNextBackgroundService", AppNextBackgroundService);
        }
    };
});
System.register("elements/base/utils", ["core"], function (exports_11, context_11) {
    "use strict";
    var core_1, AppNextCustomElementUtils;
    var __moduleName = context_11 && context_11.id;
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
            exports_11("AppNextCustomElementUtils", AppNextCustomElementUtils);
        }
    };
});
System.register("elements/base/element", ["elements/base/utils", "handlers/data"], function (exports_12, context_12) {
    "use strict";
    var utils_1, data_5, AppNextCustomElement;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (data_5_1) {
                data_5 = data_5_1;
            }
        ],
        execute: function () {
            AppNextCustomElement = class AppNextCustomElement extends HTMLElement {
                constructor() {
                    super();
                    this.events = new data_5.AppNextDataEvents();
                    this.utils = new utils_1.AppNextCustomElementUtils(this);
                }
            };
            exports_12("AppNextCustomElement", AppNextCustomElement);
        }
    };
});
System.register("elements/file-saver", ["elements/base/element", "handlers/error"], function (exports_13, context_13) {
    "use strict";
    var element_1, error_6, AppNextFileSaver;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (element_1_1) {
                element_1 = element_1_1;
            },
            function (error_6_1) {
                error_6 = error_6_1;
            }
        ],
        execute: function () {
            AppNextFileSaver = class AppNextFileSaver extends element_1.AppNextCustomElement {
                render() {
                    const config = this.utils.config(), target = 'a';
                    this.utils.reset();
                    this.events.onCancel = config.oncancel;
                    if (!this.utils.support.attribute(target, 'download')) {
                        return this.events.invokeCancelEvent(error_6.error(error_6.Errors.downloadNotSupported));
                    }
                    if (!(config.data instanceof Function)) {
                        return this.events.invokeCancelEvent(error_6.error(error_6.Errors.invalidConfig));
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
            exports_13("AppNextFileSaver", AppNextFileSaver);
        }
    };
});
System.register("elements/media-picker", ["elements/base/element", "handlers/error"], function (exports_14, context_14) {
    "use strict";
    var element_2, error_7, AppNextMediaPicker;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (element_2_1) {
                element_2 = element_2_1;
            },
            function (error_7_1) {
                error_7 = error_7_1;
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
                                this.events.invokeCancelEvent(error_7.error(error_7.Errors.captureNotSupported));
                            }
                        }
                        if (type) {
                            if (this.utils.support.attribute(target, 'accept')) {
                                element.accept = type + '/*';
                            }
                            else {
                                this.events.invokeCancelEvent(error_7.error(error_7.Errors.acceptNotSupported));
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
            exports_14("AppNextMediaPicker", AppNextMediaPicker);
        }
    };
});
System.register("handlers/scheduler", ["handlers/background"], function (exports_15, context_15) {
    "use strict";
    var background_1, AppNextScheduler;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (background_1_1) {
                background_1 = background_1_1;
            }
        ],
        execute: function () {
            AppNextScheduler = class AppNextScheduler extends background_1.AppNextBackgroundService {
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

                    task.when.setSeconds(0); task.when.setMilliseconds(0)
                    task.when = task.when.getTime(); tasks.push(task)
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
                    const key = new Date().getTime().toString(36);
                    this.tasks[key] = task;
                    super.post({ key, when: task.when });
                    this.invokeRegisterEvent(task);
                }
            };
            exports_15("AppNextScheduler", AppNextScheduler);
        }
    };
});
System.register("handlers/reflector", [], function (exports_16, context_16) {
    "use strict";
    var AppNextReflector;
    var __moduleName = context_16 && context_16.id;
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
                    this.active = true;
                }
                stop() {
                    this.active = false;
                }
            };
            exports_16("AppNextReflector", AppNextReflector);
        }
    };
});
System.register("setup", ["handlers/background", "elements/file-saver", "elements/media-picker", "elements/base/element", "handlers/scheduler", "handlers/reflector"], function (exports_17, context_17) {
    "use strict";
    var background_2, file_saver_1, media_picker_1, element_3, scheduler_1, reflector_1, AppNextSetupRegistry, AppNextCustomElementsRegistry, AppNextServicesRegistry, AppNextRenderer, AppNextSetup;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (background_2_1) {
                background_2 = background_2_1;
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
                            return this.services.register(name, new background_2.AppNextBackgroundService(script));
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
            exports_17("AppNextSetup", AppNextSetup);
        }
    };
});
