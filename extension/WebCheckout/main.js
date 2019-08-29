(function($) {

    /** Detect which runtime variable to use so that this extension is compatible with chrome, firefox, opera, and safari */
    const globalRuntime = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime) ? chrome.runtime : browser.runtime;
    
    /**
     * The host of the webcheckout system. Needed for firefox due to https://github.com/greasemonkey/greasemonkey/issues/2680
     */
    const host = "https://webcheckout2.coe.uga.edu";
    
    // cache resources
    let cache = {};
    
    // patron timer in order to verify a scan
    let patronTimer;

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
            return $.featherlight(null, {html:content, afterOpen, openSpeed: -200});
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
                let conditional = frame.stop == undefined || frame.stop == null ? (function () {return false;}) : frame.stop;
                return $.ajax({
                    method: 'POST',
                    url: frame.url,
                    data: frame.hasOwnProperty('data') ? frame.data : null,
                    ...additionalData
                }).done((resp) => { // run the request
                    feeder(resp); // feed in the response to another function
                    
                    // based on the response of the request we can decide to continue or stop the frames
                    if (!(conditionalMessage = conditional(resp))) {
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
    }


    // holds different types of requests that we will be pulling
    let Requests = {
        /**
         * All of these requests should be done here through the COE OIT System
         */
        COEOITAPI: {
            findUser: function (userid) {
                //userid = "6235678118879000";
                return  new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "https://coeoit.coe.uga.edu:47715/api/v1/webcheckout/user/" + userid,
                        type: "GET",
                        success: function (person) {
                            resolve(person);
                        },
                        error: function (err) {
                            reject("User does not exist in either systems.");
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
                    },
                    stop: function (resp) {
                        let foundBar = resp.match(/NOTIFICATION-BAR="" STUFFED-NOTIFICATIONS\="(.*)"/);
                        
                        if (foundBar) {
                            try {
                                let message = foundBar[1].replace(/\&quot\;/g, '"');
                                let parsedMessage = JSON.parse(message)[0];
                                console.log(parsedMessage, "mess")
                                if (parsedMessage.type == "error") {
                                    return parsedMessage.message;
                                }
                            } catch (e) {
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
                return new Promise (function (resolve, reject) {
                    $.ajax({
                        url: host + '/webcheckout/rest/resourceType/autocomplete',
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
                    console.log("Find person ajax");
                    console.log(`{"string": "${id}", "limit": 30}`);
                    $.ajax({
                        url: host + '/webcheckout/rest/person/Autocomplete',
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
                            console.log("RESPONE", d)
                            if (d == null || d.payload == null) resolve([]);
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
            return new Promise (function (resolve, reject) {
                    $.ajax({
                        url: host + '/webcheckout/wco/api/set-patron',
                        type: "POST",
                        data: {
                            oid: oid,
                            timeline: true,
                            allocation: getAllocationId()
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
                                    url: host + '/webcheckout/rest/resource/update',
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
                        console('Cancelled. Current Resource will be revoked and any pending resources will be ignored.', 'error');
                    });
                });
            });
        });
    }

    function removePrefix () {
        $(this).val($(this).val().replace(/OIT-/, ''));
    }
    
     
    /**
     * Looks for the allocation ID on the page. In particular, there is an element with id: allocation that has 
     * a link with this allocation number. In case this link changes, this method will need to be updated.
     */
    function getAllocationId () {
        if (document.getElementById("allocation") == null) return;
        let allocationLink = document.getElementById("allocation").getAttribute("href");
        return allocationLink.match(/allocation\=([0-9]+)/)[1];
    }
    
    async function createPersonWell(persondata) {
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
            return Utility.pullResource('WebCheckout/html/newPerson/personInitializer.html', persondata);
    };
    
    async function findPatronWebCheckout (patronid, found, notfound) {
        console.log("TRY");
        let persons = await Requests.autocomplete.person(patronid);
        if (persons != null && persons.length == 1) { 
            found(persons[0]);
        } else {
            console.log(persons);
            let multipleEntries = persons != null ? persons.length > 1 : false;
            notfound(multipleEntries);
        }
    }
    
    function setWebCheckoutPatron (id) {
        return Requests.setPatron(id).then(function (patron) {
            $("#input-patron").css('color', 'black').blur().val(patron.name);
            $('.patron-info').removeClass('hidden');
            $(".patron-info-id").text(patron.userid);
            $(".patron-info-dept").text(" Dept: " + patron.department);
            $("#input-barcode").focus(); // add focus to input where you scan barcodes so that you do not have to click it 
 
            $.featherlight.close();
        });
    };

    function searchPatron(immediate) {
        console.log("SEARCH");
        let patron = $(this).val();
        
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
            
        patronTimer = setTimeout(async function () {
            console.log("Find person: ", patron)
            findPatronWebCheckout(patron, function (person) {
                console.log("SET", person.oid);
                setWebCheckoutPatron(person.oid);
            }, async function (multipleEntries) {
                try {
                    if (multipleEntries) {
                        throw "Unique identity was unable to be found";
                    }
                        
                    let oitperson = await Requests.COEOITAPI.findUser(patron);
                    let parsedPerson = Utility.parseToDataString(oitperson.wcoCode);
                    
                    $("#input-patron").css("color", "black");
                
                    Utility.openLightBox(await createPersonWell(parsedPerson), function () {
                        // add the user
                        let req = Requests.addPerson(parsedPerson).then(() => { // create the request
                            $("#person-ticket").parent().prepend('<div class="alert alert-success"><strong>Success!</strong> User has been added!</div>');
                            $('#person-ticket .progress').hide();
                            
                            findPatronWebCheckout(patron, function (person) {
                                setWebCheckoutPatron(person.oid);
                            });
                        }, (err) => {
                            $("#person-ticket").parent().prepend(`<div class="alert alert-danger"><strong>Error!</strong> ${err}</div>`);
                        });
                        req.progress(function (prog, frame) {
                            $('#person-ticket .progress-bar').attr('aria-valuenow', prog.percent*100).width(prog.percent*100 + '%');
                        });
                        
                    });
                } catch (message) {
                    $("#input-patron").css('color', 'red');
                    $('.patron-info').removeClass('hidden').find('.patron-info-id').text(message)
                }
            });
        }, immediate === true ? 0 : 50);
    }

    (function main () {
        $(document).ready(function () {
            $('#new-resource-wizard').removeAttr('href').on('click', modifiedResourceAdder);
            $("#input-barcode, textarea[id^='rapid']").on("keydown", removePrefix);

            $("#input-patron").on("keyup", searchPatron);
            $(document).on("click", ".ui-dialog-buttonset .ui-button-text", function () {
                $("#input-patron").css("color", "black");
            });
        });
    })();
    
    //Append your inject.js to "real" webpage. So will it can full access to webpate.
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('WebCheckout/inject.js');
    (document.head || document.documentElement).appendChild(s);

})(jQuery);