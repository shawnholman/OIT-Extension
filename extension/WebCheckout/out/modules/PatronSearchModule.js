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
Object.defineProperty(exports, "__esModule", { value: true });
const util_js_1 = require("../util.js");
const requests_js_1 = require("../requests.js");
// patron timer in order to verify a scan
let patronTimer;
/**
 * The PatronSearchModule improves the experience of searching for a patron by linking the search with the OITLogging
 */
class PatronSearchModule {
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
            return util_js_1.Utility.pullResource('WebCheckout/templates/new_person/index.html', persondata);
        });
    }
    _findPatronWebCheckout(patronid, found, notfound) {
        return __awaiter(this, void 0, void 0, function* () {
            let persons = yield requests_js_1.Requests.autocomplete.person(patronid);
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
        return requests_js_1.Requests.setPatron(id).then(function (patron) {
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
                    let oitperson = yield requests_js_1.Requests.CoeOitApi.findUser(patron);
                    let parsedPerson = util_js_1.Utility.parseToDataString(oitperson.wcoCode);
                    $("#input-patron").css("color", "black");
                    util_js_1.Utility.openLightBox(yield this._createPersonWell(parsedPerson), () => {
                        // add the user
                        let req = requests_js_1.Requests.addPerson(parsedPerson).then(() => {
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
            util_js_1.Utility.openLightBox(yield this._createPersonWell({
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
exports.PatronSearchModule = PatronSearchModule;
