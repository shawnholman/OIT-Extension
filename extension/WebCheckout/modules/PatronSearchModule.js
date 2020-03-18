import {Utility} from '../util.js';
import {Requests} from '../requests.js';

// patron timer in order to verify a scan
let patronTimer;

/**
 * The PatronSearchModule improves the experience of searching for a patron by linking the search with the OITLogging
 */
export class PatronSearchModule {
    async _createPersonWell(persondata) {
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
    }
    
    async _findPatronWebCheckout (patronid, found, notfound) {
        let persons = await Requests.autocomplete.person(patronid);
        if (persons != null && persons.length == 1) { 
            found(persons[0]);
        } else {
            let multipleEntries = persons != null ? persons.length > 1 : false;
            notfound(multipleEntries);
        }
    }
    
    _setWebCheckoutPatron (id) {
        return Requests.setPatron(id).then(function (patron) {
            $("#input-patron").css('color', 'black').blur().val(patron.name);
            $('.patron-info').removeClass('hidden');
            $(".patron-info-id").text(patron.userid);
            $(".patron-info-dept").text(" Dept: " + patron.department);
            $("#input-barcode").focus(); // add focus to input where you scan barcodes so that you do not have to click it 
            $('.messages').html('<div class="message-error">No resources or resource types selected.</div>');
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
            
        patronTimer = setTimeout(async () => {
            this._findPatronWebCheckout(patron, (person) => {
                this._setWebCheckoutPatron(person.oid);
            }, async (multipleEntries) => {
                try {
                    if (multipleEntries) {
                        throw "Unique identity was unable to be found";
                    }
                        
                    let oitperson = await Requests.CoeOitApi.findUser(patron);
                    let parsedPerson = Utility.parseToDataString(oitperson.wcoCode);
                    
                    $("#input-patron").css("color", "black");
                
                    Utility.openLightBox(await this._createPersonWell(parsedPerson), () => {
                        // add the user
                        let req = Requests.addPerson(parsedPerson).then(() => { // create the request
                            $("#person-ticket").parent().prepend('<div class="alert alert-success"><strong>Success!</strong> User has been added!</div>');
                            $('#person-ticket .progress').hide();
                            
                            this._findPatronWebCheckout(patron, (person) => {
                                this._setWebCheckoutPatron(person.oid);
                            });
                        }, (err) => {
                            $("#person-ticket").parent().prepend(`<div class="alert alert-danger"><strong>Error!</strong> ${err}</div>`);
                        });
                        req.progress(function (prog) {
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
    
    async _test() {
        Utility.openLightBox(await this._createPersonWell({
            ugaid: '811673611',
            firstname:'Shawn',
            lastname: 'Holman',
            class: 3,
            department: 'EDPA',
            phone: '9129771472',
            email: 'smh27299@uga.edu'
        }), function () {});
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