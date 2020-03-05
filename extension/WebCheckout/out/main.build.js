"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/******/ (function (modules) {
    /******/ // The module cache
    /******/ var installedModules = {};
    /******/
    /******/ // The require function
    /******/ function __webpack_require__(moduleId) {
        /******/
        /******/ // Check if module is in cache
        /******/ if (installedModules[moduleId]) {
            /******/ return installedModules[moduleId].exports;
            /******/ }
        /******/ // Create a new module (and put it into the cache)
        /******/ var module = installedModules[moduleId] = {
            /******/ i: moduleId,
            /******/ l: false,
            /******/ exports: {}
            /******/ 
        };
        /******/
        /******/ // Execute the module function
        /******/ modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ // Flag the module as loaded
        /******/ module.l = true;
        /******/
        /******/ // Return the exports of the module
        /******/ return module.exports;
        /******/ 
    }
    /******/
    /******/
    /******/ // expose the modules object (__webpack_modules__)
    /******/ __webpack_require__.m = modules;
    /******/
    /******/ // expose the module cache
    /******/ __webpack_require__.c = installedModules;
    /******/
    /******/ // define getter function for harmony exports
    /******/ __webpack_require__.d = function (exports, name, getter) {
        /******/ if (!__webpack_require__.o(exports, name)) {
            /******/ Object.defineProperty(exports, name, { enumerable: true, get: getter });
            /******/ }
        /******/ 
    };
    /******/
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = function (exports) {
        /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            /******/ Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
            /******/ }
        /******/ Object.defineProperty(exports, '__esModule', { value: true });
        /******/ 
    };
    /******/
    /******/ // create a fake namespace object
    /******/ // mode & 1: value is a module id, require it
    /******/ // mode & 2: merge all properties of value into the ns
    /******/ // mode & 4: return value when already ns object
    /******/ // mode & 8|1: behave like require
    /******/ __webpack_require__.t = function (value, mode) {
        /******/ if (mode & 1)
            value = __webpack_require__(value);
        /******/ if (mode & 8)
            return value;
        /******/ if ((mode & 4) && typeof value === 'object' && value && value.__esModule)
            return value;
        /******/ var ns = Object.create(null);
        /******/ __webpack_require__.r(ns);
        /******/ Object.defineProperty(ns, 'default', { enumerable: true, value: value });
        /******/ if (mode & 2 && typeof value != 'string')
            for (var key in value)
                __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));
        /******/ return ns;
        /******/ 
    };
    /******/
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = function (module) {
        /******/ var getter = module && module.__esModule ?
            /******/ function getDefault() { return module['default']; } :
            /******/ function getModuleExports() { return module; };
        /******/ __webpack_require__.d(getter, 'a', getter);
        /******/ return getter;
        /******/ 
    };
    /******/
    /******/ // Object.prototype.hasOwnProperty.call
    /******/ __webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ // __webpack_public_path__
    /******/ __webpack_require__.p = "";
    /******/
    /******/
    /******/ // Load entry module and return exports
    /******/ return __webpack_require__(__webpack_require__.s = 1);
    /******/ 
})([
    /* 0 */
    /***/ (function (module) {
        module.exports = JSON.parse("{\"content_scripts\":[{\"js\":[\"OneSource/main.js\"],\"matches\":[\"https://selfservice.hprod.onehcm.usg.edu/psp/hprodsssso/HCMSS/HRMS/c/ROLE_EMPLOYEE.TL_WEB_CLOCK.GBL?Page=TL_WEB_CLOCK&Action=U\"],\"run_at\":\"document_end\"},{\"css\":[\"WebCheckout/css/featherlight.css\",\"WebCheckout/css/main.css\"],\"js\":[\"WebCheckout/lib/jquery.js\",\"WebCheckout/lib/featherlight.js\",\"WebCheckout/lib/keymaster.js\",\"WebCheckout/main.build.js\"],\"matches\":[\"https://webcheckout2.coe.uga.edu/webcheckout/wco*\"],\"run_at\":\"document_end\"}],\"description\":\"This extension was built to modify OIT Systems that we do not have direct access to.\",\"manifest_version\":2,\"name\":\"OITLogging\",\"permissions\":[\"https://webcheckout2.coe.uga.edu/webcheckout/wco/\",\"https://coeoit.coe.uga.edu:47715/*\"],\"version\":\"2.1.0\",\"web_accessible_resources\":[\"*\"],\"applications\":{\"gecko\":{\"id\":\"oitloggin@uga.edu\"}}}");
        /***/ 
    }),
    /* 1 */
    /***/ (function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        // EXTERNAL MODULE: ./extension/manifest.json
        var manifest = __webpack_require__(0);
        // CONCATENATED MODULE: ./extension/WebCheckout/constants.js
        /* global chrome, browser */
        /** Detect which runtime variable to use so that this extension is compatible with chrome, firefox, opera, and safari */
        const IS_CHROME = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
        /** Selects a runtime variable based on the browser */
        const GLOBAL_RUNTIME = IS_CHROME ? chrome.runtime : browser.runtime;
        /**
         * The host of the webcheckout system. Needed on requestions in firefox due to
         * https://github.com/greasemonkey/greasemonkey/issues/2680
         */
        const HOST = "https://webcheckout2.coe.uga.edu";
        /** Version of the extension pulled from the manifest */
        const VERSION = manifest.version;
        /** Name of the localStorage list used to hold information about when the user has seen */
        const SEEN_LIST = "webcheckout_seen_list";
        // CONCATENATED MODULE: ./extension/WebCheckout/modules/RemovePrefixModule.js
        /**
         * This module removes the OIT- prefix from any barcode that has it. Etc. "OIT-4455" => "4455"
         */
        class RemovePrefixModule {
            _removePrefix() {
                $(this).val($(this).val().replace(/OIT-/, ''));
            }
            install() {
                $("#input-barcode, textarea[id^='rapid']").on("keydown", this._removePrefix);
            }
        }
        // CONCATENATED MODULE: ./extension/WebCheckout/util.js
        /** Utilities */
        // cache resources
        const cache = {};
        const Utility = {
            /**
             * Pulls a resource from the local extension.
             * @param address location of the file to pull
             * @param templater An object of key value pairs that should correspond to templating tags inside of the resource. This will replace the tag will the value in this templater
             *          template: <div>${name}</div>
             *          templater: { "name": "Shawn" }
             *          results: <div>Shawn</div>
             * @param cachable Set to true if the resource should only be pulled once and read through a cache all of the other times. This is useful if the resource is static and has no templates.
             * @returns {Promise<any>}
             */
            pullResource: function pullResource(address, templater, cachable) {
                return new Promise(function (resolve) {
                    if (cachable) {
                        if (Object.prototype.hasOwnProperty.call(cache, address)) {
                            resolve(cache[address]);
                        }
                    }
                    $.get(GLOBAL_RUNTIME.getURL(address)).then(function (content) {
                        if (templater) {
                            for (let el in templater) {
                                content = content.replace('${' + el + '}', templater[el]);
                            }
                        }
                        if (cachable) {
                            cache[address] = content;
                        }
                        resolve(content);
                    });
                });
            },
            /**
             * Opens the featherlight lightbox
             * @param content the html of the box
             * @param afterOpen when should happen after the box is opened...this is a good place to attach events within the box
             * @returns {*|jQuery}
             */
            openLightBox: function openLightBox(content, afterOpen) {
                return $.featherlight(null, { html: content, afterOpen, openSpeed: -200 });
            },
            /**
             * Checks if an object contains all of the provided key's
             * @param obj Object to search
             * @param contains A list of key's to look for
             * @returns {boolean} true if all of the keys inside of param "contains" is found in param "obj"
             */
            objectContainsAll: function objectContainsAll(obj, contains) {
                for (let contain of contains) {
                    if (!(contain in obj))
                        return false;
                }
                return true;
            },
            /**
             * Parses the data string
             * @param {String:encoded in base64} data An base64 encoded string which when decoded has the format (spaces do not matter): name:value,name2:value2 ....etc
             * @returns {Object|boolean} object if could be parsed and false if not
             */
            parseToDataString: function parseToDataString(data) {
                try {
                    let unencode = window.atob(data); // decode string
                    let dataPoints = unencode.split(/\s*,\s*/); //split into data points
                    let parsedData = {};
                    for (let dataPoint of dataPoints) { // run through each datapoint
                        let dataComponents = dataPoint.split(/\s*:\s*/); // and split into its components
                        let dataName = dataComponents[0];
                        let dataValue = dataComponents[1];
                        parsedData[dataName] = dataValue;
                    }
                    return parsedData;
                }
                catch (e) {
                    return false;
                }
            },
            /**
             * Find the average of an array of numbers
             * @param numbers
             * @returns {number}
             */
            average: function average(numbers) {
                if (numbers == null || numbers.length == 0)
                    return 0;
                let sum = 0;
                for (let number of numbers) {
                    sum += number;
                }
                return sum / numbers.length;
            },
            /**
             * Allows us to create a timeline of requests which contain many frames. For the case of webcheckout, this is nice way
             * of getting an action done since they require frames of requests
             * @param  {Array of Objects} frames The frames that will be executed through a post request
             *      The Objects in the array have the following properties:
             *          url (String): the request url
             *          data (Object): the data sent with the url
             *          feed (Function): a function that has its first parameter set to the results of the current frame. This allows you to further process the results of a frame (see addResources for an example)
             *          other (Object): any $.ajax properties that you would like to include in this request.
             *              In order to override being limited to a post request, you must include: other: { method: 'YOUR_DESIRED_METHOD_HERE'}
             *          stop (Function): Allows you to stop a frame requrest given a certain condition. Return false to continue otherwise return an error message
             *
             *      The only required property is url. Any other parameter is added to the frame request and can be accessed inside of the progress method.
             *
             * @return {Promise}
             *
             *
             * Special Methods have been attached to the prototype of the Promise that gets returned:
             *      .progress(function): tracks the progress of the whole frame request..evokes 1 time per frame
             *          passed to the function will the following variables in parameter order:
             *              progressData: contains the properties: completed (number of frames done), total (total number of frames), percent (% completed), remaining (time remaining in seconds)
             *              currentFrame: the data associated with the current frame (this will just be object that you used to define the frame)
             *      .cancel(): cancels whole frame request
             *
             *
             *
             * Example:
             *
             *      let request = makeFrameRequest([
             *          {
             *              url: "/example/request",
             *              data: {
             *                  "canDo": true
             *              },
             *              other: {
             *                  method: "GET" // this overrides the nature of using a post request which is the default
             *              }
             *              skip: true // we can access this inside of the progress function when we get to this particular frame
             *          }
             *      ]);
             *      request.progress(function (progressData, currentFrame) {
             *          console.log("Completed: ", progressData.completed);
             *          console.log("Total: ", progressData.total);
             *          console.log("Percent: ", progressData.percent, "%");
             *          console.log("Remaining: ", progressData.remaining, "s");
             *
             *          // Note current frame equals the object defined within the makeFrameRequest array
             *          if (currentFrame.hasOwnProperty('skip') && currentFrame.skip == true) {
             *              request.cancel();
             *          }
             *      });
             */
            makeFrameRequest: function makeFrameRequest(frames) {
                const Utility = this;
                let cancelled = false;
                let totalFrames = frames.length;
                let framesCompleted = 1;
                let progress = null;
                let globalTimes = []; // keep track of all of the times
                let avgTime = Utility.average(globalTimes); // keep track of the average execution time
                let startTime = performance.now();
                let promise = new Promise(function (resolve, reject) {
                    if (frames.length == 0) { // resolve when all frames have been used
                        resolve();
                    }
                    else {
                        let frame = frames[0]; // get the first frame
                        let additionalData = frame.other || {};
                        let feeder = frame.feed || $.noop;
                        let conditional = frame.stop || (function () { return false; });
                        let conditionalMessage = null;
                        return $.ajax(Object.assign({ method: 'POST', url: frame.url, data: Object.prototype.hasOwnProperty.call(frame, 'data') ? frame.data : null }, additionalData)).done((resp) => {
                            feeder(resp); // feed in the response to another function
                            // based on the response of the request we can decide to continue or stop the frames
                            if (!(conditionalMessage = conditional(resp))) {
                                frames.shift(); // shift the frames
                                // if the user has cancelled and we aren't on the last frame
                                if (cancelled && frames.length != 0) {
                                    reject('cancelled');
                                }
                                else { // else continue making frame requests
                                    if (progress != null && typeof progress == "function") {
                                        let progressData = {
                                            completed: framesCompleted + 1,
                                            total: totalFrames,
                                            percent: (framesCompleted + 1) / totalFrames,
                                            // calculate the time remaining by multiplying the frames left by the average execution time
                                            remaining: (totalFrames - (framesCompleted + 1)) * avgTime / 1000
                                        };
                                        progress.call(this, progressData, frames[0] != undefined ? frames[0] : null);
                                    }
                                    //push the execution time for the purpose of generating an average
                                    globalTimes.push(performance.now() - startTime);
                                    return Utility.makeFrameRequest(frames)
                                        .then(resolve, reject)
                                        .progress(progress, totalFrames, ++framesCompleted, globalTimes); // we run the requests
                                }
                            }
                            else {
                                reject(conditionalMessage);
                            }
                        }).fail(function () {
                            $.post('?method=checkout-jump');
                            reject('error');
                        });
                    }
                });
                Promise.prototype.progress = function (progressFunction, total, completed, times) {
                    totalFrames = total || frames.length;
                    framesCompleted = completed || 0;
                    progress = progressFunction || $.noop;
                    globalTimes = times || [];
                    avgTime = Utility.average(times);
                };
                Promise.prototype.cancel = function () {
                    cancelled = true;
                    $.post('?method=checkout-jump');
                };
                return promise;
            },
            /**
             * Looks for the allocation ID on the page. In particular, there is an element with id: allocation that has
             * a link with this allocation number. In case this link changes, this method will need to be updated.
             */
            getAllocationId: function () {
                if (document.getElementById("allocation") == null)
                    return;
                let allocationLink = document.getElementById("allocation").getAttribute("href");
                return allocationLink.match(/allocation=([0-9]+)/)[1];
            }
        };
        // CONCATENATED MODULE: ./extension/WebCheckout/requests.js
        /** Holds different requests that can be made. */
        let Requests = {
            /**
             * All of these requests should be done here through the COE OIT System
             */
            CoeOitApi: {
                findUser: function (userid) {
                    //userid = "6235678118879000";
                    return new Promise(function (resolve, reject) {
                        $.ajax({
                            url: "https://coeoit.coe.uga.edu:47715/api/v1/webcheckout/user/" + userid,
                            type: "GET",
                            crossDomain: true,
                            success: function (person) {
                                resolve(person);
                            },
                            error: function () {
                                const errorMsg = IS_CHROME ? "User does not exist in either systems." :
                                    "Adding Users is Temporarily Disabled on Firefox";
                                reject(errorMsg);
                            }
                        });
                    });
                }
            },
            /**
             * Adds a person the WebCheckout database
             * @param {Array} data A set of data of the person
             */
            addPerson: function (data) {
                return Utility.makeFrameRequest([
                    { url: '?method=new-person-wizard' },
                    { url: '?method=new-userid-forward',
                        data: {
                            "new-userid-form.userid": data.ugaid,
                            "new-userid-form.first-name": data.firstname,
                            "new-userid-form.other-name": '',
                            "new-userid-form.last-name": data.lastname,
                            "new-userid-form.patron-class": data.class,
                            "new-userid-form.department": data.department
                        },
                        stop: function (resp) {
                            let foundBar = resp.match(/NOTIFICATION-BAR="" STUFFED-NOTIFICATIONS="(.*)"/);
                            // At this point, if there is something wrong with adding the user, an error bar will be
                            // added to the page. The error bar has a parameter in the HTML called "STUFFED-NOTIFICATIONS"
                            // which contains a status message in the form on JSON. We will get that JSON, parse it, and
                            // see if an error has occured. If an error has occured, we will return that message which 
                            // can then be picked up in the error function parameter of the promise.
                            if (foundBar) {
                                try {
                                    let message = foundBar[1].replace(/&quot;/g, '"');
                                    let parsedMessage = JSON.parse(message)[0];
                                    if (parsedMessage.type == "error") {
                                        return parsedMessage.message;
                                    }
                                }
                                catch (e) {
                                    return false;
                                }
                            }
                            return false;
                        }
                    },
                    { url: '?method=new-person-contact-forward',
                        data: {
                            "new-person-contact-form.street": '',
                            "new-person-contact-form.street2": '',
                            "new-person-contact-form.city": '',
                            "new-person-contact-form.state": '',
                            "new-person-contact-form.postal-code": '',
                            "new-person-contact-form.country": '',
                            "new-person-contact-form.telephone": data.phone,
                            "new-person-contact-form.email": data.email
                        }
                    },
                    { url: '?method=new-person-create-finish' },
                    { url: '?method=checkout-jump', finishing: true },
                ]);
            },
            /**
             * Find the autocomplete resources
             * @param  {String} string String to search for an autocompletion
             * @return {Promise}
             */
            autocomplete: {
                resource: function (string) {
                    return new Promise(function (resolve) {
                        $.ajax({
                            url: HOST + '/webcheckout/rest/resourceType/autocomplete',
                            type: "POST",
                            dataType: "json",
                            data: `{"string": "${string}", "properties": ["name", "description"]}`,
                            contentType: "application/json",
                            headers: {
                                Accept: "application/json, text/plain, */*"
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function (d) {
                                if (d == null || d.payload == null)
                                    resolve([]);
                                else {
                                    let resources = [];
                                    let results = d.payload;
                                    for (let result of results) {
                                        if (result.label == "OIT") {
                                            for (let value of result.values) {
                                                resources.push({
                                                    oid: value.oid,
                                                    name: value.name
                                                });
                                            }
                                        }
                                    }
                                    resolve(resources);
                                }
                            }
                        });
                    });
                },
                person: function (id) {
                    return new Promise(function (resolve) {
                        $.ajax({
                            url: HOST + '/webcheckout/rest/person/Autocomplete',
                            type: "POST",
                            dataType: "json",
                            data: `{"string": "${id}", "limit": 30}`,
                            contentType: "application/json",
                            headers: {
                                Accept: "application/json, text/plain, */*"
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function (d) {
                                if (d == null || d.payload == null)
                                    resolve([]);
                                else {
                                    for (let payload of d.payload) {
                                        if (payload.values != null) {
                                            resolve(payload.values);
                                            return;
                                        }
                                    }
                                    resolve([]);
                                }
                            },
                            error: function (d) {
                                console.error("FAIL", d);
                            }
                        });
                    });
                }
            },
            setPatron: function (oid) {
                return new Promise(function (resolve) {
                    $.ajax({
                        url: HOST + '/webcheckout/wco/api/set-patron',
                        type: "POST",
                        data: {
                            oid: oid,
                            timeline: true,
                            allocation: Utility.getAllocationId()
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (d) {
                            resolve(d.patron);
                        }
                    });
                });
            },
            /**
             * Adds a set of resources to WebCheckout
             * @param {Array} resources An array of resources with formate [{ id: 12, type: "oid|type"}, ...]
             */
            addResources: function (resources) {
                // remove 123456,
                let masterFrame = [];
                let frameSet = function (id, type, description) {
                    return [
                        { url: '?method=new-resource-wizard' },
                        { url: '?method=choose-resource-id-forward',
                            data: {
                                "choose-resource-id-form.resource-id": id,
                                "choose-resource-id-form.circulating": true
                            }
                        },
                        { url: '?method=choose-resource-type-forward',
                            data: {
                                "choose-resource-type-form.search-field": type
                            }
                        },
                        { url: '?method=new-resource-wizard-finish',
                            finishing: true,
                            feed: function (resp) {
                                try {
                                    let reg = /\?method=resource&caller=new-resource-wizard-done&resource=([0-9]*)/;
                                    let oid = resp.match(reg)[1];
                                    $.ajax({
                                        url: HOST + '/webcheckout/rest/resource/update',
                                        type: "POST",
                                        dataType: "json",
                                        data: '{"oid": ' + oid + ', "values": {"description": "' + description + '"}}',
                                        contentType: "application/json",
                                        headers: {
                                            Accept: "application/json, text/plain, */*"
                                        },
                                        xhrFields: {
                                            withCredentials: true
                                        },
                                        success: $.noop
                                    });
                                }
                                catch (e) {
                                    console.error(e);
                                    alert("Oops, Something Went Wrong:" + e);
                                }
                            }
                        }
                    ];
                };
                for (let resource of resources) {
                    masterFrame = masterFrame.concat(frameSet(resource.id, resource.type, resource.description));
                }
                return Utility.makeFrameRequest(masterFrame);
            }
        };
        // CONCATENATED MODULE: ./extension/WebCheckout/modules/ResourceAdderModule.js
        function ResourceAdderModule_console(mess, type) {
            let classes = type || 'default';
            document.getElementById('progress-prompt').innerHTML += `<div class='${classes}'>${mess}</div>`;
            document.getElementById('progress-prompt').scrollTop = document.getElementById('progress-prompt').scrollHeight;
        }
        /**
         * Verifies that all fields have been properly filled out and the finish button can or cant be enabled
         */
        function checkFinishDisability() {
            let numberOfInputs = $('.featherlight-inner .content .row .form-control').length;
            let numberOfCompletedInputs = $('.featherlight-inner .content .row .form-control').filter(function () {
                return ($(this).hasClass('type') && $(this).hasClass('autocompleted')) || // type field needs to be autocompleted
                    ($(this).hasClass('numbers') && $(this).val().match(/[0-9]{1,}/)) || // numbers field should have at least 1 number
                    ($(this).hasClass('description')); // the description field can optionally be blank
            }).length;
            $("#finishadding").attr("disabled", !(numberOfInputs == numberOfCompletedInputs));
        }
        function redirectToOriginalForm() {
            document.location = '?method=new-resource-wizard';
        }
        function removeResourceRow() {
            if ($(".featherlight-inner .content").find('.row').length > 1) { // ensure that we can not remove the last remaining row
                $(this).closest('.row').slideUp(200, function () {
                    $(this).remove();
                    checkFinishDisability();
                });
            }
        }
        function addResourceRow(inputRow) {
            $('.featherlight-inner .content').append(inputRow);
            checkFinishDisability();
        }
        function assignAutoCompletedValue() {
            let oid = $(this).data('oid');
            let value = $(this).text();
            $(this).parent().prev().data('oid', oid).val(value).addClass('autocompleted');
            $(this).parent().empty().hide();
            checkFinishDisability();
        }
        function emptyAutoCompleted() {
            $('.featherlight-inner .autocomplete').empty().hide();
        }
        function loadUpAutoCompletedValues() {
            let value = $(this).val();
            $(this).removeClass('autocompleted');
            Requests.autocomplete.resource(value).then((results) => {
                if ($(this).is(':focus')) { // only show the results if we are still focuses on the input
                    let list = '';
                    for (let result of results) {
                        list += `<li data-oid="${result.oid}">${result.name}</li>`;
                    }
                    $(this).next().html(list);
                    if (list != '') { // if list is not empty
                        $(this).next().show(); // add the list of items
                    }
                    else {
                        $(this).next()
                            .hide();
                    }
                }
            });
        }
        function tryAndCompleteAutoCompleteAssignment() {
            if (!$(this).hasClass('autocompleted')) {
                let value = $(this).val();
                Requests.autocomplete.resource(value).then((results) => {
                    if (results.length == 1) { // if the input only gives one autocorrected result then we can use that result to finish the completion
                        let result = results[0];
                        $(this).data('oid', result.oid).val(result.name).addClass('autocompleted');
                    }
                    else {
                        // however, even if we get multiple results, if the input value matches one of the autocompleted ones exactly,
                        // we can choose that one as the autocorrect
                        for (let result of results) {
                            if (result.name == value) {
                                $(this).data('oid', result.oid).addClass('autocompleted');
                                break;
                            }
                        }
                    }
                    checkFinishDisability();
                });
            }
        }
        function addAllResources() {
            return __awaiter(this, void 0, void 0, function* () {
                // collect together all of the resources from the input
                let allResources = [];
                $('#finishadding, #addresource').attr('disabled', true);
                // collect the information from each inputRow
                $('.featherlight-inner .content .row').each(function () {
                    const row = $(this);
                    const type = row.find('.type').data('oid') + '|' + row.find('.type').val();
                    const resourceIds = row.find('.numbers').val().split(/\s*,\s*/);
                    const description = row.find('.description').val();
                    for (let resourceId of resourceIds) {
                        allResources.push({ "id": resourceId, type, description });
                    }
                    row.remove();
                });
                // Get the console
                $('.featherlight-inner .content').html(yield Utility.pullResource('WebCheckout/templates/resource_adder/console.html', {}, true));
                // add the resources
                let req = Requests.addResources(allResources).then(function () {
                    $('#cancel, #finishadding, #addresource').attr('disabled', true);
                    ResourceAdderModule_console('All Resources have been added.', 'success');
                });
                req.progress(function (prog, frame) {
                    const frameHasFinishingProperty = Object.prototype.hasOwnProperty.call(frame, 'finishing');
                    const cantCancel = (frame != null && frameHasFinishingProperty && frame.finishing == true) || prog.total - prog.completed == 1;
                    $('#cancel').attr('disabled', cantCancel);
                    switch (prog.completed % 4) {
                        // brackets for each case will prevent the "Unexpected lexical declaration in case block" given 
                        // by eslint. More on that here: https://eslint.org/docs/rules/no-case-declarations
                        case 0: {
                            ResourceAdderModule_console('Resetting resource creator..');
                            break;
                        }
                        case 1: {
                            const id = frame.data["choose-resource-id-form.resource-id"];
                            ResourceAdderModule_console(`Creating resource  ${id} ..`);
                            break;
                        }
                        case 2: {
                            const type = frame.data["choose-resource-type-form.search-field"];
                            ResourceAdderModule_console(`Connecting type ${type} ..`);
                            break;
                        }
                        case 3: {
                            ResourceAdderModule_console('Finishing Resource Creation..');
                            break;
                        }
                    }
                    let progressBar = $('.featherlight-inner .content .progress-bar');
                    if (prog.remaining == 0) {
                        progressBar.parent().prev().hide();
                    }
                    else {
                        progressBar.parent().prev().show().find('strong').text(Math.round(prog.remaining) + ' seconds');
                    }
                    progressBar.attr('aria-valuenow', prog.percent * 100).width(prog.percent * 100 + '%');
                });
                $("#cancel").off('click').on('click', () => {
                    req.cancel();
                    $('#cancel, #finishadding, #addresource').attr('disabled', true);
                    $('.featherlight-inner .content .progress').hide().parent().prev().hide();
                    ResourceAdderModule_console('Cancelled. Current Resource will be revoked and any pending resources will be ignored.', 'error');
                });
            });
        }
        /**
         * The ResourceAdderModule modernizes the way that new resources are added into the system. This module is put into
         * action when clicking the "New Resource" button under resources.
         */
        class ResourceAdderModule_ResourceAdderModule {
            _openResourceAdder() {
                return __awaiter(this, void 0, void 0, function* () {
                    const inputRow = yield Utility.pullResource('WebCheckout/templates/resource_adder/inputRow.html', {}, true);
                    Utility.pullResource('WebCheckout/templates/resource_adder/index.html', { inputRow }, true).then(function (content) {
                        Utility.openLightBox(content, function () {
                            $('#originalform').on('click', redirectToOriginalForm);
                            $('.featherlight-inner')
                                .on('click', emptyAutoCompleted)
                                .on('click', '.remove-row', removeResourceRow)
                                .on('click', '.autocomplete li', assignAutoCompletedValue)
                                .on('keyup', '.type.form-control', loadUpAutoCompletedValues)
                                .on('blur', '.type.form-control', tryAndCompleteAutoCompleteAssignment)
                                .on('keyup change', '.form-control', checkFinishDisability);
                            // We are passing the input row in so that we do not need to make new
                            // resource calls for each added resource
                            $("#addresource").on('click', addResourceRow.bind(this, inputRow));
                            $("#finishadding").on('click', addAllResources);
                        });
                    });
                });
            }
            install() {
                $('#new-resource-wizard').removeAttr('href').on('click', this._openResourceAdder);
            }
        }
        // CONCATENATED MODULE: ./extension/WebCheckout/modules/PatronSearchModule.js
        // patron timer in order to verify a scan
        let patronTimer;
        /**
         * The PatronSearchModule improves the experience of searching for a patron by linking the search with the OITLogging
         */
        class PatronSearchModule_PatronSearchModule {
            _createPersonWell(persondata) {
                return __awaiter(this, void 0, void 0, function* () {
                    // skip a spot here since the values start at 1
                    let classes = [
                        'Other',
                        'Continuing education',
                        'Undergraduate freshman',
                        'Undergraduate sophomore',
                        'Undergraduate junior',
                        'Undergraduate senior',
                        'Graduate 1',
                        'Graduate 2',
                        'Employee',
                        'Faculty',
                    ];
                    let formatedNumber = persondata.phone.replace(/([0-9]{3})([0-9]{3})([0-9]{4})/, function (full, $1, $2, $3) {
                        return "(" + $1 + ") " + $2 + "-" + $3;
                    });
                    persondata.class = !isNaN(persondata.class) ? classes[persondata.class - 1] : persondata.class;
                    persondata.formatedNumber = formatedNumber;
                    return Utility.pullResource('WebCheckout/templates/new_person/index.html', persondata);
                });
            }
            _findPatronWebCheckout(patronid, found, notfound) {
                return __awaiter(this, void 0, void 0, function* () {
                    let persons = yield Requests.autocomplete.person(patronid);
                    if (persons != null && persons.length == 1) {
                        found(persons[0]);
                    }
                    else {
                        let multipleEntries = persons != null ? persons.length > 1 : false;
                        notfound(multipleEntries);
                    }
                });
            }
            _setWebCheckoutPatron(id) {
                return Requests.setPatron(id).then(function (patron) {
                    $("#input-patron").css('color', 'black').blur().val(patron.name);
                    $('.patron-info').removeClass('hidden');
                    $(".patron-info-id").text(patron.userid);
                    $(".patron-info-dept").text(" Dept: " + patron.department);
                    $("#input-barcode").focus(); // add focus to input where you scan barcodes so that you do not have to click it 
                    $.featherlight.close();
                });
            }
            _searchPatron(immediate) {
                let patron = $("#input-patron").val();
                clearTimeout(patronTimer);
                if (patron.length <= 2) { // we do not need to attempt a search until there is at least three characters
                    $('.patron-info').addClass('hidden');
                    $("#input-patron").css('color', 'black');
                    return;
                }
                // if the patron we are searching is being search by number then we need to do a few things
                if (!isNaN(Number(patron)) && patron.length == 16) {
                    // Historic Context for this line of code:
                    // At the beginning of using the OITLogging System, the number on the back of UGA ID's contained 16 digits. 
                    // This was 6 digits in front and 1 digit after the uga 81#. For example, 1234568111234560 (notice the 81# inside of this)
                    // Any UGA ID Printed after April of 2019, now only displays the 81# while the barcode still scans all 16.
                    // For this reason, we decided to move OITLogging to using only the 9-digit 81# as well. This means that
                    // when scanning id's inside of WebCheckout, we have to only look for this ID number, hence the change you see below.
                    patron = patron.substring(6, 15); // trim the full 16 digit UGA Id and just get the 81#
                }
                patronTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    this._findPatronWebCheckout(patron, (person) => {
                        this._setWebCheckoutPatron(person.oid);
                    }, (multipleEntries) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            if (multipleEntries) {
                                throw "Unique identity was unable to be found";
                            }
                            let oitperson = yield Requests.CoeOitApi.findUser(patron);
                            let parsedPerson = Utility.parseToDataString(oitperson.wcoCode);
                            $("#input-patron").css("color", "black");
                            Utility.openLightBox(yield this._createPersonWell(parsedPerson), () => {
                                // add the user
                                let req = Requests.addPerson(parsedPerson).then(() => {
                                    $("#person-ticket").parent().prepend('<div class="alert alert-success"><strong>Success!</strong> User has been added!</div>');
                                    $('#person-ticket .progress').hide();
                                    this._findPatronWebCheckout(patron, function (person) {
                                        this._setWebCheckoutPatron(person.oid);
                                    });
                                }, (err) => {
                                    $("#person-ticket").parent().prepend(`<div class="alert alert-danger"><strong>Error!</strong> ${err}</div>`);
                                });
                                req.progress(function (prog) {
                                    $('#person-ticket .progress-bar').attr('aria-valuenow', prog.percent * 100).width(prog.percent * 100 + '%');
                                });
                            });
                        }
                        catch (message) {
                            $("#input-patron").css('color', 'red');
                            $('.patron-info').removeClass('hidden').find('.patron-info-id').text(message);
                        }
                    }));
                }), immediate === true ? 0 : 50);
            }
            _test() {
                return __awaiter(this, void 0, void 0, function* () {
                    Utility.openLightBox(yield this._createPersonWell({
                        ugaid: '811673611',
                        firstname: 'Shawn',
                        lastname: 'Holman',
                        class: 3,
                        department: 'EDPA',
                        phone: '9129771472',
                        email: 'smh27299@uga.edu'
                    }), function () { });
                });
            }
            install() {
                $("#input-patron").on("keyup", this._searchPatron.bind(this));
                // Whenever the operator types in a patron, they can hit enter before this script can have a chance
                // to autocomplete. When this happens, you are prompted with a box to select a user. Once you select
                // a user, the follow piece of code just makes the patron name turn back from red to black.
                $(document).on("click", ".ui-dialog-buttonset .ui-button-text", function () {
                    $("#input-patron").css("color", "black");
                });
            }
        }
        // CONCATENATED MODULE: ./extension/WebCheckout/modules/KeyboardShortcutsModule.js
        /* global key */
        /**
         * The ShortCutModule implements several useful shortcuts to be used across WebCheckout
         */
        class KeyboardShortcutsModule_KeyboardShortcutsModule {
            constructor() {
                this.activeKeyList = {};
                this.keyToSymbol = {
                    "command": "⌘",
                    "shift": "⇧",
                    "option": "⌥",
                    "alt": "⌥"
                };
            }
            /**
             * Sets the prefix to be used inside of the _key method.
             * @param prefix which should be in the format of "key1+key2+....KeyN" (Note: no + at the end)
             */
            _setPrefix(prefix) {
                this.keyPrefix = prefix + "+";
            }
            /**
             * This method attaches a key to an event by utilizing the keymaster.js library included in the lib folder.
             * @param keys Either a single key character ("a") or an array of characters ["a", "b"] to attach a single event
             * to multiple keys
             * @param event The event to be triggered on key press
             *
             * Note, it is recommended to set the prefix using _setPrefix(), before you attach a set of keys. See: _installRedirects method
             * for an example.
             */
            _key(keys, event) {
                if (event == false) {
                    return;
                }
                const prefix = this.keyPrefix || "";
                let keyPressed;
                if (Array.isArray(keys)) {
                    let combos = keys.reduce((accum, curr) => {
                        return accum + prefix + curr + ",";
                    }, "").slice(0, -1);
                    keyPressed = keys[0];
                    key(combos, event.func);
                }
                else if (typeof keys === "string") {
                    keyPressed = keys;
                    key(prefix + keyPressed, event.func);
                }
                // Create a shortcut name for the activeKeyList entry. It will replace the word of the key with their symbol.
                // For example, command+shirt+A would turn into ⌘+⇧+A
                let shortcutName = (prefix + keyPressed); /*.replace(new RegExp(Object.keys(this.keyToSymbol).join("|"), "g"), (m) => {
                    return this.keyToSymbol[m];
                });*/
                this.activeKeyList[shortcutName] = event.label;
            }
            _createMeta(label, func) {
                return { label, func };
            }
            /**
             * Creates the event listener that will take a user to a new link
             * @param href Link to go to
             */
            _goTo(href, label) {
                return this._createMeta("Go to " + label, () => {
                    window.location.href = href;
                });
            }
            /**
             * Creates the event listener that will click on elements
             * @param element The id that unique identifies the clickable element..if more than one element are found an error will be thrown
             * @param dynamic specifies whether the element should be regiester on page load (non-dynamic) or should be checked for when the
             * event it triggered (dynamic)
             */
            _clickOn(element, label, dynamic) {
                if (dynamic == undefined || dynamic == false) {
                    let el = $(element);
                    if (el.length == 1) {
                        return this._createMeta(label, () => el[0].click());
                    }
                    else {
                        if (el.length > 1) {
                            throw new Error("Can not identify a unique clickable element.");
                        }
                        return false;
                    }
                }
                return this._createMeta(label, () => {
                    let el = $(element);
                    if (el.length == 1) {
                        el[0].click();
                    }
                    if (el.length > 1) {
                        throw new Error("Can not identify a unique clickable element.");
                    }
                });
            }
            _removeFilter() {
                // See: https://github.com/madrobby/keymaster#filter-key-presses
                key.filter = function () {
                    return true;
                };
            }
            _installRedirects() {
                this._setPrefix("ctrl+shift");
                // Checkout Page
                this._key("c", this._goTo("?method=checkout-jump", "Checkout"));
                // New Reservation Page
                this._key("r", this._goTo("?method=reservation-jump", "Reservation"));
                // Reservation Pickup Page
                this._key("p", this._goTo("?method=find-reservations", "Pickup"));
                // Find Checkouts Page (aka Rapid Return)
                this._key("f", this._goTo("?method=find-checkouts", "Find Checkouts"));
                // Quick Return Page (aka Rapid Return)
                this._key("q", this._goTo("?method=rapid-return", "Quick Return"));
            }
            _installClicks() {
                this._setPrefix("ctrl+option");
                // Confirm Checkout Button
                this._key("c", this._clickOn("button:contains('Confirm Checkout')", "Confirm Checkout", true));
                this._setPrefix("ctrl");
                // Commit Button
                this._key("c", this._clickOn("#commit-button .submit-all", "Checkout"));
                // Timeline Scheduler Button (aka. Back to Checkout Button)
                this._key(["b", "t"], this._clickOn("button:contains('Timeline Scheduler')", "Back to Checkout", true));
                // Confirm Checkout Button
                this._key("r", this._clickOn("a:contains('Reset')", "Reset Checkout"));
                // Return Resource Button
                this._key("q", this._clickOn("input[value='Return Resource']", "Return Resource", true));
            }
            _openShortCutMenu() {
                let shortcuts = "";
                for (let shortcut in this.activeKeyList) {
                    shortcuts += "<pre style='border-radius: 0;margin: 0;border: none;background: white;padding: 5px 20px;'>" + shortcut + "<span style='float:right'>" + this.activeKeyList[shortcut] + "</span></pre>";
                }
                Utility.pullResource('WebCheckout/templates/keyboard_shortcuts/index.html', { shortcuts }, true).then(function (content) {
                    Utility.openLightBox(content, function () { });
                });
            }
            install() {
                this._removeFilter();
                this._installRedirects();
                this._installClicks();
                localStorage.setItem("list", JSON.stringify(this.activeKeyList));
                $("#statusbar .rightStatusBar").append(`<div class="rightSessionContent" style="margin-right: 5px;"><button class="button" id="openShortcuts">Shortcuts</button></div>`);
                $("#openShortcuts").on('click', () => {
                    this._openShortCutMenu();
                });
            }
        }
        // CONCATENATED MODULE: ./extension/WebCheckout/modules/WhatsNewModule.js
        /**
         * The ShortCutModule implements several useful shortcuts to be used across WebCheckout
         */
        class WhatsNewModule_WhatsNewModule {
            _openWhatsNew() {
                return __awaiter(this, void 0, void 0, function* () {
                    const content = yield Utility.pullResource(`WebCheckout/templates/whats_new/${VERSION}.html`);
                    Utility.pullResource('WebCheckout/templates/whats_new/index.html', {
                        version: VERSION,
                        text: content
                    }, true).then(function (content) {
                        Utility.openLightBox(content, function () {
                        });
                    });
                });
            }
            /** Identifies a logged in user by name (not 100% unique) */
            _getCurrentUser() {
                return document.querySelector("#statusbar .rightStatusBar a.sessionContent").innerText.replace(" (operator)", "");
            }
            /** Updates the seen list */
            _setSeenList(to) {
                localStorage.setItem(SEEN_LIST, JSON.stringify(to));
            }
            /** Gets the seen list accounting for if the list is empty */
            _getSeenList() {
                const list = localStorage.getItem(SEEN_LIST);
                if (list == null) {
                    this._setSeenList([]);
                    return [];
                }
                return JSON.parse(list);
            }
            /** See if a user has seen a version previously */
            _userHasSeenVersion(check_user, version) {
                let list = this._getSeenList();
                for (let user of list) {
                    if (user.name == check_user && user.versionsSeen.includes(version)) {
                        return true;
                    }
                }
                return false;
            }
            /** Set a user to have seen a version */
            _setSeen(check_user, version) {
                let list = this._getSeenList();
                for (let user of list) {
                    if (user.name == check_user) {
                        user.versionsSeen.push(version);
                        this._setSeenList(list);
                        return true;
                    }
                }
                list.push({
                    name: check_user,
                    versionsSeen: [version]
                });
                this._setSeenList(list);
            }
            /** Checks to see if the current user should be shown the whats new box */
            _userNotSeen() {
                let user = this._getCurrentUser();
                if (user != " ()") {
                    return !this._userHasSeenVersion(user, VERSION);
                }
                return false;
            }
            install() {
                $("#statusbar .rightStatusBar").append(`<div class="rightSessionContent" style="margin-right: 10px;"><button class="button" id="openWhatsNew">What's New?</button></div>`);
                $("#openWhatsNew").on('click', () => {
                    this._openWhatsNew();
                    if (this._userNotSeen()) {
                        this._setSeen(this._getCurrentUser(), VERSION);
                        $("#openWhatsNew").removeClass("flash");
                    }
                });
                if (this._userNotSeen()) {
                    $("#openWhatsNew").addClass("flash");
                }
            }
        }
        // CONCATENATED MODULE: ./extension/WebCheckout/modules/index.js
        // CONCATENATED MODULE: ./extension/WebCheckout/main.js
        (function main($) {
            function installModule(module) {
                const createdModule = new module();
                if (Object.prototype.hasOwnProperty.call(module, "install")) {
                    let moduleName = module.constructor.name;
                    console.error(`Module "${moduleName}": Could not be installed due to missing install method.`);
                }
                else {
                    createdModule.install();
                }
            }
            $(document).ready(function () {
                installModule(RemovePrefixModule);
                installModule(ResourceAdderModule_ResourceAdderModule);
                installModule(PatronSearchModule_PatronSearchModule);
                installModule(WhatsNewModule_WhatsNewModule);
                installModule(KeyboardShortcutsModule_KeyboardShortcutsModule);
            });
            // Appends the inject.js script to webpage so that it receives full access to the page.
            let s = document.createElement('script');
            s.src = GLOBAL_RUNTIME.getURL('WebCheckout/inject.js');
            (document.head || document.documentElement).appendChild(s);
        })(jQuery);
        /***/ 
    })
    /******/ 
]);
