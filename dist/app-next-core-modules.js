System.register("handlers/data", [], function (exports_1, context_1) {
    "use strict";
    var AppNextDataEvents;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            AppNextDataEvents = class AppNextDataEvents {
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
                Errors[Errors["permissionDenied"] = 6] = "permissionDenied";
            })(Errors || (Errors = {}));
            exports_2("Errors", Errors);
            errors = {
                acceptNotSupported: { name: 'accept not supported', message: 'Input element "accept" attribute is not supported by this device' },
                captureNotSupported: { name: 'capture not supported', message: 'Input element "capture" attribute is not supported by this device' },
                downloadNotSupported: { name: 'download not supported', message: 'Link element "download" attribute is not supported by this device' },
                featureTerminated: { name: 'feature terminated', message: 'Current feature terminated due to user action' },
                invalidConfig: { name: 'invalid config', message: 'Config object is missing required members' },
                invalidFactoryFunction: { name: 'invalid factory', message: 'Factory function must provide a valid handler instance' },
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
                                case 'denied': return provider.invokeCancelEvent(error_1.error(error_1.Errors.permissionDenied));
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
                    this.permission = new permission_1.AppNextPermissionProvider(permissions);
                    this.permission.onCancel = error => this.invokeCancelEvent(error);
                    this.permission.onError = error => this.invokeErrorEvent(error);
                    this.permission.onPending = () => this.invokePendingEvent();
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
System.register("sensors/base", ["handlers/watch", "handlers/error"], function (exports_6, context_6) {
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
System.register("sensors/accelerometer", ["sensors/base"], function (exports_7, context_7) {
    "use strict";
    var base_1, AppNextAccelerometer;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (base_1_1) {
                base_1 = base_1_1;
            }
        ],
        execute: function () {
            AppNextAccelerometer = class AppNextAccelerometer extends base_1.AppNextSensor {
                constructor(options) {
                    super(() => new Accelerometer(options), 'accelerometer');
                }
            };
            exports_7("AppNextAccelerometer", AppNextAccelerometer);
        }
    };
});
System.register("core", ["providers/geolocation", "sensors/accelerometer"], function (exports_8, context_8) {
    "use strict";
    var geolocation_1, accelerometer_1, AppNextCore;
    var __moduleName = context_8 && context_8.id;
    function config(name) {
        const object = (AppNextCore.config || {})[name] || {};
        object.name = name;
        return object;
    }
    exports_8("config", config);
    return {
        setters: [
            function (geolocation_1_1) {
                geolocation_1 = geolocation_1_1;
            },
            function (accelerometer_1_1) {
                accelerometer_1 = accelerometer_1_1;
            }
        ],
        execute: function () {
            AppNextCore = class AppNextCore {
                constructor() {
                    this.providers =
                        {
                            geolocation: (options) => new geolocation_1.AppNextGeoLocationProvider(options)
                        };
                    this.sensors =
                        {
                            accelerometer: (options) => new accelerometer_1.AppNextAccelerometer(options)
                        };
                }
                config(value) { AppNextCore.config = value || {}; }
            };
            exports_8("AppNextCore", AppNextCore);
        }
    };
});
System.register("elements/base", ["core", "handlers/data"], function (exports_9, context_9) {
    "use strict";
    var core_1, data_3, AppNextCustomElementUtils, AppNextCustomElement;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (data_3_1) {
                data_3 = data_3_1;
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
            AppNextCustomElement = class AppNextCustomElement extends HTMLElement {
                constructor() {
                    super();
                    this.events = new data_3.AppNextDataEvents();
                    this.utils = new AppNextCustomElementUtils(this);
                }
            };
            exports_9("AppNextCustomElement", AppNextCustomElement);
        }
    };
});
System.register("elements/file-saver", ["elements/base", "handlers/error"], function (exports_10, context_10) {
    "use strict";
    var base_2, error_4, AppNextFileSaver;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (base_2_1) {
                base_2 = base_2_1;
            },
            function (error_4_1) {
                error_4 = error_4_1;
            }
        ],
        execute: function () {
            AppNextFileSaver = class AppNextFileSaver extends base_2.AppNextCustomElement {
                render() {
                    const config = this.utils.config(), target = 'a';
                    this.utils.reset();
                    this.events.onCancel = config.oncancel;
                    if (!this.utils.support.attribute(target, 'download')) {
                        return this.events.invokeCancelEvent(error_4.error(error_4.Errors.downloadNotSupported));
                    }
                    if (!(config.data instanceof Function)) {
                        return this.events.invokeCancelEvent(error_4.error(error_4.Errors.invalidConfig));
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
                            /*fetch(element.href).then(response => response.blob()).then(blob =>
                            {
                                
                            })*/
                            this.events.invokeDataEvent({ data, name, type, size: (new TextEncoder().encode(data)).length });
                        };
                        this.events.invokeReadyEvent();
                    }
                    catch (error) {
                        this.events.invokeErrorEvent(error);
                    }
                }
            };
            exports_10("AppNextFileSaver", AppNextFileSaver);
        }
    };
});
System.register("elements/media-picker", ["elements/base", "handlers/error"], function (exports_11, context_11) {
    "use strict";
    var base_3, error_5, AppNextMediaPicker;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (base_3_1) {
                base_3 = base_3_1;
            },
            function (error_5_1) {
                error_5 = error_5_1;
            }
        ],
        execute: function () {
            AppNextMediaPicker = class AppNextMediaPicker extends base_3.AppNextCustomElement {
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
                                this.events.invokeCancelEvent(error_5.error(error_5.Errors.captureNotSupported));
                            }
                        }
                        if (type) {
                            if (this.utils.support.attribute(target, 'accept')) {
                                element.accept = type + '/*';
                            }
                            else {
                                this.events.invokeCancelEvent(error_5.error(error_5.Errors.acceptNotSupported));
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
            exports_11("AppNextMediaPicker", AppNextMediaPicker);
        }
    };
});
System.register("setup", ["elements/file-saver", "elements/media-picker"], function (exports_12, context_12) {
    "use strict";
    var file_saver_1, media_picker_1, AppNextCustomElementsRegistry, AppNextRenderer, AppNextSetup;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (file_saver_1_1) {
                file_saver_1 = file_saver_1_1;
            },
            function (media_picker_1_1) {
                media_picker_1 = media_picker_1_1;
            }
        ],
        execute: function () {
            AppNextCustomElementsRegistry = class AppNextCustomElementsRegistry {
                constructor() {
                    this.registry = {};
                    this.register('file-saver', file_saver_1.AppNextFileSaver);
                    this.register('media-picker', media_picker_1.AppNextMediaPicker);
                }
                register(name, ctor) {
                    if (!customElements || this.registry[name])
                        return;
                    customElements.define(name, ctor);
                    this.registry[name] = ctor;
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
                    const elements = new AppNextCustomElementsRegistry();
                    this.renderer = new AppNextRenderer();
                    addEventListener('load', () => {
                        this.renderer.custom(Object.keys(elements.registry));
                    });
                }
                render(elements) {
                    this.renderer.render(elements);
                }
            };
            exports_12("AppNextSetup", AppNextSetup);
        }
    };
});
