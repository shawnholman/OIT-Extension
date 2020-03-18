import {Utility} from './util.js';
import {IS_CHROME, HOST} from './constants.js';
    
/** Holds different requests that can be made. */
export let Requests = {
    /**
     * All of these requests should be done here through the COE OIT System
     */
    CoeOitApi: {
        findUser: function (userid) {
            //userid = "6235678118879000";
            return  new Promise(function (resolve, reject) {
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
                    "new-userid-form.other-name":  '',
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
     * Commit and confirm an allocation
     */
    completeCheckout: function (allocationNumber) {
        return Utility.makeFrameRequest([
            { url: "?method=timeline-confirm-allocation"},
            { url: "?method=cf-confirm-allocation&allocation=" + allocationNumber },
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
            return new Promise (function (resolve) {
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
            return new Promise (function (resolve) {
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
        return new Promise (function (resolve) {
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
        return Utility.makeFrameRequest(masterFrame);
    }
}