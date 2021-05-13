import {GLOBAL_RUNTIME} from './constants.js';
/** Utilities */

// cache resources
const cache = {};
    
export const Utility = {
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
    pullResource:  function pullResource (address, templater, cachable) {
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
    openLightBox: function openLightBox (content, afterOpen, otherOptions = {}) {
        return $.featherlight(null, {html:content, afterOpen, fadeInOnly: true, openSpeed: 100, ...otherOptions});
    },

    /**
     * Checks if an object contains all of the provided key's
     * @param obj Object to search
     * @param contains A list of key's to look for
     * @returns {boolean} true if all of the keys inside of param "contains" is found in param "obj"
     */
    objectContainsAll: function objectContainsAll (obj, contains) {
        for (let contain of contains) {
            if (!(contain in obj)) return false;
        }
        return true;
    },

    /**
     * Parses the data string
     * @param {String:encoded in base64} data An base64 encoded string which when decoded has the format (spaces do not matter): name:value,name2:value2 ....etc
     * @returns {Object|boolean} object if could be parsed and false if not
     */
    parseToDataString: function parseToDataString (data) {
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
        } catch (e) {
            return false;
        }
    },

    /**
     * Find the average of an array of numbers
     * @param numbers
     * @returns {number}
     */
    average: function average (numbers) {
        if (numbers == null || numbers.length == 0) return 0;
        let sum = 0;
        for (let number of numbers) {
            sum += number;
        }
        return sum/numbers.length;
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
        let promise = new Promise(function(resolve, reject) {
            if (frames.length == 0) { // resolve when all frames have been used
                resolve();
            } else {
                let frame = frames[0]; // get the first frame
                let additionalData = frame.other || {};
                let feeder = frame.feed || $.noop;
                let conditional = frame.stop || (function () {return false;});
                let conditionalMessage = null;
                
                return $.ajax({
                    method: 'POST',
                    url: frame.url,
                    data: Object.prototype.hasOwnProperty.call(frame, 'data') ? frame.data : null,
                    ...additionalData
                }).done((resp) => { // run the request
                    feeder(resp); // feed in the response to another function
                    
                    // based on the response of the request we can decide to continue or stop the frames
                    if (!(conditionalMessage = conditional(resp))) {
                        frames.shift(); // shift the frames

                        // if the user has cancelled and we aren't on the last frame
                        if (cancelled && frames.length != 0) {
                            reject('cancelled');
                        } else { // else continue making frame requests
                            if (progress != null && typeof progress == "function") {
                                let progressData = { // set progress data
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
                    } else {
                        reject(conditionalMessage);
                    }
                }).fail(function () { // if something goes wrong then we will default back to the checkout page
                    $.post('?method=checkout-jump');
                    reject('error');
                });
            }
        });
        
        Promise.prototype.progress = function (progressFunction, total, completed, times) { // keep track of progress
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
        return parseInt($("[allocation-oid]").attr("allocation-oid"));
    }
};
