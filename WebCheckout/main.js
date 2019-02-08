(function($) {
    // detect if we are using chrome
    const globalRuntime = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime) ? chrome.runtime : browser.runtime;


    let cache = {};

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
        pullResource:  function pullResource (address, templater, cachable) {
            return new Promise(function (resolve, reject) {
                if (cachable) {
                    if (cache.hasOwnProperty(address)) {
                        resolve(cache[address]);
                    }
                }
                $.get(globalRuntime.getURL(address)).then(function (content) {
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
        openLightBox: function openLightBox (content, afterOpen) {
            return $.featherlight(null, {html:content, afterOpen});
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
            return sum/len;
        }
    };

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
     *
     *      The only required property is url
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
     *              stop: true // we can access this inside of the progress function when we get to this particular frame
     *          }
     *      ]);
     *      request.progress(function (progressData, currentFrame) {
     *          console.log("Completed: ", progressData.completed);
     *          console.log("Total: ", progressData.total);
     *          console.log("Percent: ", progressData.percent, "%");
     *          console.log("Remaining: ", progressData.remaining, "s");
     *
     *          // Note current frame equals the object defined within the makeFrameRequest array
     *          if (currentFrame.hasOwnProperty('stop') && currentFrame.stop == true) {
     *              request.cancel();
     *          }
     *      });
     */
    function makeFrameRequest(frames) {
        let cancelled = false;
        let totalFrames = frames.length;
        let framesCompleted = 1;
        let progress = null;
        let globalTimes = []; // keep track of all of the times
        let avgTime = Utility.average(globalTimes); // keep track of the average execution time

        let startTime = performance.now();
        let promise = new Promise(function(resolve, reject) {
            let frame = frames[0]; // get the first frame
            if (frames.length == 0) { // resolve when all frames have been used
                resolve();
            } else {
                let additionalData = frame.other == undefined || frame.other == null ? {} : frame.other;
                let feeder = frame.feed == undefined || frame.feed == null ? $.noop : frame.feed;
                return $.ajax({
                    method: 'POST',
                    url: frame.url,
                    data: frame.hasOwnProperty('data') ? frame.data : null,
                    ...additionalData
                }).done((resp) => { // run the request
                    feeder(resp);
                    frames.shift(); // shift the frames

                    // if the user has cancelled and we aren't on the last frame
                    if (cancelled && frames.length != 0) reject('cancelled');
                    else { // else continue making frame requests
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
                        return makeFrameRequest(frames).then(resolve, reject).progress(progress, totalFrames, ++framesCompleted, globalTimes); // we run the requests
                    }
                }).error(function () { // if something goes wrong then we will default back to the checkout page
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
    }


    // holds different types of requests that we will be pulling
    let Requests = {
        /**
         * Adds a person the WebCheckout database
         * @param {Array} data A set of data of the person
         */
        addPerson: function (data) {
            return makeFrameRequest([
                { url: '?method=new-person-wizard' },
                { url: '?method=new-userid-forward',
                    data: {
                        "new-userid-form.userid": data.ugaid,
                        "new-userid-form.first-name": data.firstname,
                        "new-userid-form.other-name":  '',
                        "new-userid-form.last-name": data.lastname,
                        "new-userid-form.patron-class": data.class,
                        "new-userid-form.department": data.department
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
                { url: '?method=new-person-create-finish', finishing: true }
            ]);
        },

        /**
         * Find the autocomplete resources
         * @param  {String} string String to search for an autocompletion
         * @return {Promise}
         */
        autocomplete: {
            resource: function (string) {
                return new Promise (function (resolve, reject) {
                    $.ajax({
                        url: '/webcheckout/rest/resourceType/autocomplete',
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
                            if (d == null || d.payload == null) resolve([]);
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
                return new Promise (function (resolve, reject) {
                    $.ajax({
                        url: '/webcheckout/rest/person/Autocomplete',
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
                            if (d == null || d.payload == null) resolve([]);
                            else {
                                let userIdPayload = d.payload[1];

                                resolve(d.payload[1].values);
                            }
                        }
                    });
                });
            }
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
                                    url: '/webcheckout/rest/resource/update',
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
                            } catch (e) {
                                console.error(e);
                                alert("Oops, Something Went Wrong:" + e);
                            }
                        }
                    }
                ]
            }
            for (let resource of resources) {
                masterFrame = masterFrame.concat(frameSet(resource.id, resource.type, resource.description));
            }
            return makeFrameRequest(masterFrame);
        }
    }

    function modifiedNewPerson () {
        let createPersonWell = async function (persondata) {
            // skip a spot here since the values start at 1
            let classes = ['Other', 'Continuing education', 'Undergraduate freshman', 'Undergraduate sophomore', 'Undergraduate junior', 'Undergraduate senior', 'Graduate 1', 'Graduate 2', 'Employee', 'Faculty'];
            let formatedNumber = persondata.phone.replace(/([0-9]{3})([0-9]{3})([0-9]{4})/, function (full, $1, $2, $3) {
                return "(" + $1 + ") " + $2 + "-" + $3;
            });

            persondata.class = classes[persondata.class - 1];
            persondata.formatedNumber = formatedNumber;
            return Utility.pullResource('WebCheckout/html/newPerson/newPersonWell.html', persondata);
        };

        Utility.pullResource('WebCheckout/html/newPerson/newPerson.html', {}, true).then(function (content) {
            Utility.openLightBox(content, async function () {
                let person = null;

                $(document).on('change paste keyup', '#persondata', function (e) {
                    setTimeout(async () => { // add a timeout here so that we can get the proper value of the paste event
                        person = Utility.parseToDataString($(this).val());

                        $('.error-message').remove();
                        // if the person contains all of the correct data
                        if (person && Utility.objectContainsAll(person, ['ugaid', 'firstname', 'lastname', 'class', 'department', 'email', 'phone'])) {
                            $(this).parent().html(await createPersonWell(person));

                            $('#addperson').attr('disabled', false);
                            $('#cancel').attr('disabled', false).off('click').on('click', function () {
                                $(this).attr('disabled', true).parent().prev().html('<textarea id="persondata" placeholder="Enter unique user code.."></textarea>');
                            });
                        } else { // if not we will give an error
                            person = null;
                            $(this).addClass('error').before('<div class="error-message" style="margin-bottom: 4px;text-align: center;color: #e00000;">Incorrect Code</div>')
                        }
                    }, 5);
                });

                $('#originalform').on('click', function () {
                    document.location = '?method=new-person-wizard';
                });

                $('#addperson').on('click', function () { // when we add the person
                    if (person != null) { // if we have a person then..
                        $('#cancel').attr('disabled', false); // open up the cancel button
                        $('#person-ticket .progress').show();
                        $(this).val("Adding...").add('#originalform').attr('disabled', true);

                        let req = Requests.addPerson(person).then(() => { // create the request
                            $(this).val("Added").removeClass('btn-primary').addClass('btn-success').parent().prev().prepend('<div class="alert alert-success"><strong>Success!</strong> User has been added!</div>');
                            $('#person-ticket .progress').hide();
                            setTimeout(() => {
                                $.featherlight.close();
                            }, 2000);
                        });
                        req.progress(function (prog, frame) {
                            let cantCancel = (frame != null && frame.hasOwnProperty('finishing') && frame.finishing == true) || prog.total - prog.completed == 1;
                            $('#cancel').attr('disabled', cantCancel);
                            $('#person-ticket .progress-bar').attr('aria-valuenow', prog.percent*100).width(prog.percent*100 + '%');
                        });

                        $("#cancel").off('click').on('click', () => {
                            req.cancel();
                            $(this).val("Add Person").add('#originalform').attr('disabled', false);
                            $('#cancel').attr('disabled', true);
                            $('#person-ticket .progress').hide();
                        });
                    }
                });
            });
        });
    }

    async function modifiedResourceAdder () {
        let inputRow = await Utility.pullResource('WebCheckout/html/newResource/inputRow.html', {}, true);

        Utility.pullResource('WebCheckout/html/newResource/newResource.html', { inputRow }, true).then(function (content) {
            Utility.openLightBox(content, function () {
                function console(mess, type) {
                    let classes = type || 'default';
                    document.getElementById('progress-prompt').innerHTML += `<div class='${classes}'>${mess}</div>`;
                    document.getElementById('progress-prompt').scrollTop = document.getElementById('progress-prompt').scrollHeight;
                }

                /**
                 * Verifies that all fields have been properly filled out and the finish button can or cant be enabled
                 */
                function checkFinishDisability() {
                    let numberOfInputs = $('.featherlight-inner .content .well .row .form-control').length;
                    let numberOfCompletedInputs = $('.featherlight-inner .content .well .row .form-control').filter(function () {
                        return ($(this).hasClass('type') && $(this).hasClass('autocompleted')) || // type field needs to be autocompleted
                            ($(this).hasClass('numbers') && $(this).val().match(/[0-9]{1,}/)) || // numbers field should have at least 1 number
                            ($(this).hasClass('description')) // the description field can optionally be blank
                    }).length;

                    $("#finishadding").attr("disabled", !(numberOfInputs == numberOfCompletedInputs));
                }

                $('#originalform').on('click', function () {
                    document.location = '?method=new-resource-wizard'
                });

                $('.featherlight-inner').on('click', '.remove-row', function () { // remove a resource row
                    if ($(this).find('.row').length > 1) { // ensure that we can not remove the last remaining row
                        $(this).closest('.row').slideUp(200, function () {
                            $(this).remove();
                            checkFinishDisability();
                        });
                    }
                }).on('click', function (e) { // clear the autocomplete when you click somewhere on the inner
                    $('.featherlight-inner .autocomplete').empty();
                }).on('click', '.autocomplete li', function () { // assign the autocompleted item to an input
                    let oid = $(this).data('oid');
                    let value = $(this).text();

                    $(this).parent().prev().data('oid', oid).val(value).addClass('autocompleted');
                    $(this).parent().empty();
                    checkFinishDisability();
                }).on('keyup', '.type.form-control', function () { // look up auto complete values
                    let value = $(this).val();
                    $(this).removeClass('autocompleted');
                    Requests.autocomplete.resource(value).then((results) => {
                        if ($(this).is(':focus')) { // only show the results if we are still focuses on the input
                            let list = '';
                            for (let result of results) {
                                list += `<li data-oid="${result.oid}">${result.name}</li>`;
                            }
                            $(this).next().html(list); // add the list of items
                        }
                    });
                }).on('blur', '.type.form-control', function () { // if we click off the input and have no auto completed
                    if (!$(this).hasClass('autocompleted')) {
                        let value = $(this).val();
                        Requests.autocomplete.resource(value).then((results) => { // check the current value of the input and see if we can derive an auto completed value anyways
                            if (results.length == 1) { // if the input only gives one autocorrected result then we can use that result to finish the completion
                                let result = results[0];
                                $(this).data('oid', result.oid).val(result.name).addClass('autocompleted');
                            } else {
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
                }).on('keyup change', '.form-control', checkFinishDisability);

                $("#addresource").on('click', function () { // adds a new input row
                    $('.featherlight-inner .content .well').append(inputRow);
                    checkFinishDisability();
                });

                $("#finishadding").on('click', async function () { // Add Resources
                    // collect together all of the resources from the input
                    let allResources = [];

                    $('#finishadding, #addresource').attr('disabled', true);
                    // collect the information from each inputRow
                    $('.featherlight-inner .content .row').each(function () {
                        let row =  $(this);
                        let type = row.find('.type').data('oid') + '|' + row.find('.type').val();
                        let resourceIds = row.find('.numbers').val().split(/\s*,\s*/);
                        let description = row.find('.description').val();

                        for (let resourceId of resourceIds) {
                            allResources.push({"id": resourceId, type, description});
                        }
                        row.remove();
                    });
                    $('.featherlight-inner .content .well').html(await Utility.pullResource('WebCheckout/html/newResource/console.html', {}, true));

                    // add the resources
                    let req = Requests.addResources(allResources).then(function () {
                        $('#cancel, #finishadding, #addresource').attr('disabled', true);
                        console('All Resources have been added.', 'success');
                    });

                    req.progress(function (prog, frame) { // progress as the resources are added
                        let cantCancel = (frame != null && frame.hasOwnProperty('finishing') && frame.finishing == true) || prog.total - prog.completed == 1;

                        $('#cancel').attr('disabled', cantCancel);

                        switch (prog.completed % 4) {
                            case 0:
                                console('Resetting resource creator..');
                                break;
                            case 1:
                                let id = frame.data["choose-resource-id-form.resource-id"];
                                console(`Creating resource  ${id} ..`);
                                break;
                            case 2:
                                let type = frame.data["choose-resource-type-form.search-field"];
                                console(`Connecting type ${type} ..`);
                                break;
                            case 3:
                                console('Finishing Resource Creation..');
                                break;
                        }

                        let progressBar = $('.featherlight-inner .content .progress-bar');

                        if (prog.remaining == 0) {
                            progressBar.parent().prev().hide()
                        } else {
                            progressBar.parent().prev().show().find('strong').text(Math.round(prog.remaining) + ' seconds');
                        }
                        progressBar.attr('aria-valuenow', prog.percent * 100).width(prog.percent * 100 + '%');
                    });

                    $("#cancel").off('click').on('click', () => {
                        req.cancel();
                        $('#cancel, #finishadding, #addresource').attr('disabled', true);
                        $('.featherlight-inner .content .progress').hide().parent().prev().hide();
                        cons('Cancelled. Current Resource will be revoked and any pending resources will be ignored.', 'error');
                    });
                });
            });
        });
    }

    function removePrefix () {
        $(this).val($(this).val().replace(/OIT-/, ''));
    }

    let patronTimer;
    function searchPatron() {
        let patronId = $(this).val();
        console.log(patronId)
        clearTimeout(patronTimer);
        patronTimer = setTimeout(function () {
            Requests.autocomplete.person(patronId).then(function (results) {
                if (results.length == 1) {
                    console.log("WE FOUND A MATCH");
                }
            });
            console.log("SCAN HAS COMPLETED", patronId);
        }, 50);
    }

    (function main () {
        $('#new-person-wizard').removeAttr('href').on('click',  modifiedNewPerson);
        $('#new-resource-wizard').removeAttr('href').on('click', modifiedResourceAdder);
        $("#input-barcode").on("keydown", removePrefix);

        $("#input-patron").on("keydown", searchPatron);
    })();

})(jQuery);