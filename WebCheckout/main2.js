(function($) {
    /*function pullResource (address) {
        return new Promise(function (resolve, reject) {
            $.get(chrome.runtime.getURL(address), function (data) {
                resolve(data);
            }, reject);
        });
    }*/

    function objectContainsAll (obj, contains) {
        for (let contain of contains) {
            if (!(contain in obj)) return false;
        }
        return true;
    }

    /**
     * Parses the data string
     * @param {String:encoded in base64} data An encoded string which when decoded has the format: name:value,name2:value2 ....etc
     */
    function parseToDataString (data) {
        try {
            let unencode = window.atob(data); // parse string
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
    }

    function average (numbers) {
        if (numbers == null || numbers.length == 0) return 0;
        let sum = 0;
        let len = numbers.length;
        for (let i = 0; i < len; i++) {
            sum += numbers[i];
        }
        return sum/len;
    }

    /**
     * Allows us to create a timeline of requests which contains many frames. For the case of webcheckout, this is nice way
     * of getting an action done since they require frames of requests
     * @param  {Array} frames The frames that will be executed through a post request
     * @return {Promise}
     */
    function makeFrameRequest(frames) {
        let cancelled = false;
        let totalFrames = frames.length;
        let framesCompleted = 1;
        let progress = null;
        let globalTimes = []; // keep track of all of the times
        let avgTime = average(globalTimes); // keep track of the average execution time

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
            avgTime = average(times);
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
        autocomplete: function (string) {
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

        /**
         * Adds a set of resources to WebCheckout
         * @param {Array} resources An array of resources with formate [{ id: 12, type: "oid|type"}, ...]
         */
        addResources: function (resources) {
            // remove 123456,
            let masterFrame = [];
            let ajaxSet = function (id, type, description) {
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
                masterFrame = masterFrame.concat(ajaxSet(resource.id, resource.type, resource.description));
            }
            console.log(masterFrame);
            return makeFrameRequest(masterFrame);
        }
    }

    function modifiedNewPerson () {
        let createPersonWell = function (persondata) {
            // skip a spot here since the values start at 1
            let classes = [null, 'Other', 'Continuing education', 'Undergraduate freshman', 'Undergraduate sophomore', 'Undergraduate junior', 'Undergraduate senior', 'Graduate 1', 'Graduate 2', 'Employee', 'Faculty'];
            let formatedNumber = persondata.phone.replace(/([0-9]{3})([0-9]{3})([0-9]{4})/, function (full, $1, $2, $3) {
                return "(" + $1 + ") " + $2 + "-" + $3;
            });
            return `<div id='person-ticket' class="well person-verification">
                <ul class="list-group list-group-flush">
                      <li class="list-group-item">UGA ID: <strong>${persondata.ugaid}</strong></li>
                      <li class="list-group-item">Name: <strong>${persondata.firstname} ${persondata.lastname}</strong></li>
                      <li class="list-group-item">Class: <strong>${classes[persondata.class]}</strong></li>
                    <li class="list-group-item">Department: <strong>${persondata.department}</strong></li>
                    <li class="list-group-item">Email: <strong>${persondata.email}</strong></li>
                      <li class="list-group-item">Phone: <strong>${formatedNumber}</strong></li>
                </ul>
                <div class="progress" style="margin-bottom: 0;margin-top: 10px;display:none">
                  <div class="progress-bar" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" style="width:10%"></div>
                </div>
            </div>`
        };

        //pullResource('/html/resourceAdded').then(function (content) {
            $.featherlight(null, {
                html: '',//content,
                afterOpen: function ()  {
                    let person = null;

                    $(document).on('change paste keyup', '#persondata', function (e) {
                        setTimeout(() => { // add a timeout here so that we can get the proper value of the paste event
                            person = parseToDataString($(this).val());

                            $('.error-message').remove();
                            // if the person contains all of the correct data
                            if (person && objectContainsAll(person, ['ugaid', 'firstname', 'lastname', 'class', 'department', 'email', 'phone'])) {
                                $(this).parent().html(createPersonWell(person));
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
                }
            });
        //});
    }

    function modifiedResourceAdder () {
        let inputRow = `<div class='row'>
                            <div class='col-sm-3' style='padding: 0;'>
                                <input type="text" class='numbers form-control' placeholder="11111, 22222, 33333,..." />
                            </div>
                            <div class='col-sm-3' style='padding: 0 5px 0 5px;'>
                                <input type="text" class='type form-control' placeholder='Resource Type' />
                                <ul class='autocomplete'></ul>
                            </div>
                            <div class='col-sm-4' style='padding: 0;'>
                                <input type="text" class='description form-control' placeholder="Resource Description (opt.)" />
                            </div>
                            <div class='col-sm-2' style='padding: 0 0 0 5px;'>
                                <div class='remove-row'>Remove</div>
                            </div>
                        </div>`;

        $.featherlight(null, {
            html: `
                 <div>
                     <h1>Add Resources</h1>
                     <div class="content">
                        <div class='well' style='margin-bottom:0'>
                            ${inputRow}
                        </div>
                    </div>
                    <div class="footer-area row">
                        <input id='finishadding' type="button" class="col-sm-3 btn btn-success" value="Finish" disabled>
                        <input id='addresource' type="button" class="col-sm-4 btn btn-primary" value="New Resource">
                        <input id='cancel' type="button" class="col-sm-2 btn btn-danger" value="Cancel" disabled>
                        <input id='originalform' type="button" class="col-sm-3 btn btn-info" value="Original Form">
                    </div>
                </div>`,

            afterOpen: function () {
                function console (mess, type) {
                    let classes = type || 'default';
                    document.getElementById('progress-prompt').innerHTML += `<div class='${classes}'>${mess}</div>`;
                    document.getElementById('progress-prompt').scrollTop = document.getElementById('progress-prompt').scrollHeight;
                }

                /**
                 * Verifies that all fields have been properly filled out and the finish button can or cant be enabled
                 */
                function checkFinishDisability () {
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
                    $(this).closest('.row').slideUp(600, function () {
                        $(this).remove();
                        checkFinishDisability ();
                    });
                }).on('click', function (e) { // clear the autocomplete when you click somewhere on the inner
                    $('.featherlight-inner .autocomplete').empty();
                }).on('click', '.autocomplete li', function () { // assign the autocompleted item to an input
                    let oid = $(this).data('oid');
                    let value = $(this).text();
                    $(this).parent().prev().data('oid', oid).val(value).addClass('autocompleted');
                    $(this).parent().empty();
                    checkFinishDisability ();
                }).on('keyup', '.type.form-control', function () { // look up auto complete values
                    let value = $(this).val();
                    $(this).removeClass('autocompleted');
                    Requests.autocomplete(value).then((results) => {
                        if ($(this).is(':focus')) { // only show the results if we are still focuses on the input
                            let list = '';
                            for (let result of results) {
                                list += `<li data-oid="${result.oid}">${result.name}</li>`;
                            }
                            $(this).next().html(list); // add the list of items
                        }
                    });
                }).on('blur', '.type.form-control', function (){ // if we click off the input and have no auto completed
                    if (!$(this).hasClass('autocompleted')) {
                        let value = $(this).val();
                        Requests.autocomplete(value).then((results) => { // check the current value of the input and see if we can derivate an auto completed value anyways
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
                            checkFinishDisability ();
                        });
                    }
                }).on('keyup change', '.form-control', checkFinishDisability);

                $("#addresource").on('click', function () {
                    $('.featherlight-inner .content .well').append(inputRow);
                    checkFinishDisability ();
                });

                $("#finishadding").on('click', function () { // Add Resources
                    // collect together all of the resources from the input
                    let allResources = [];

                    $('#finishadding, #addresource').attr('disabled', true);
                    $('.featherlight-inner .content .row').each(function () {
                        let type = $(this).find('.type').data('oid') + '|' + $(this).find('.type').val();
                        let resources = $(this).find('.numbers').val().split(/\s*,\s*/);
                        let description = $(this).find('.description').val();
                        for (let resource of resources) {
                            allResources.push({"id": resource, type, description });
                        }
                        $(this).remove();
                    });
                    $('.featherlight-inner .content .well').html(`<div id='progress-prompt'><div>Opening resource creator</div></div><div style="
                        margin-top: 2px;margin-bottom: -6px;display:none;">Time Remaining: <strong>0 seconds</strong></div><div class="progress" style="margin-bottom: 0;margin-top: 10px;">
                         <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%"></div>
                    </div>`);

                    // add the resources
                    let req = Requests.addResources(allResources).then(function () {
                        $('#cancel, #finishadding, #addresource').attr('disabled', true);
                        console('All Resources have been added.', 'success');
                    });
                    req.progress(function (prog, frame) { // progress as the resources are added
                        let cantCancel = (frame != null && frame.hasOwnProperty('finishing') && frame.finishing == true) || prog.total - prog.completed == 1;
                        let progressBar = $('.featherlight-inner .content .progress-bar');
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
                        if (prog.remaining == 0) {
                            progressBar.parent().prev().hide()
                        } else {
                            progressBar.parent().prev().show().find('strong').text(Math.round(prog.remaining) + ' seconds');
                        }
                        progressBar.attr('aria-valuenow', prog.percent*100).width(prog.percent*100 + '%');
                    });

                    $("#cancel").off('click').on('click', () => {
                        req.cancel();
                        $('#cancel, #finishadding, #addresource').attr('disabled', true);
                        $('.featherlight-inner .content .progress').hide().parent().prev().hide();
                        cons('Cancelled. Current Resource will be revoked and any pending resources will be ignored.', 'error');
                    });
                });
            }
        });
    }

    function removePrefix () {
        $(this).val($(this).val().replace(/OIT-/, ''));
    }

    (function main () {
        $('#new-person-wizard').removeAttr('href').on('click',  modifiedNewPerson);
        $('#new-resource-wizard').removeAttr('href').on('click', modifiedResourceAdder);
        $("#input-barcode").on("keydown", removePrefix);
    })();

})(jQuery);