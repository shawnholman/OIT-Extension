/**
 * This file gets directly injected into WebCheckout. This means that it lives in the same scope as the actual website. 
 * To contrast how this is different from the other files in the extension, is that we can think main.js and jquery.js
 * as background processes while inject.js works directly with the page. This means that we have more access to page
 * level details here. However, this should be used sparingly and should be very well document as changes could here 
 * can potentially break WebCheckout.
 */

setTimeout(function() {
    /** Utility functions */
    const Utility = {
        /**
         * Extends the return by the given number of weeks with the reutrn time set to 7 Mon-Thurs and 5 on Fridays
         * @param weeks The number of weeks to the extend the time
         */
        extendDate: function (weeks) {
            // We are the checkout page if this element is availiable.
            if ($("#reservation-page").length) {
                const returnDate = new Date();
                const isFriday = returnDate.getDay() === 5; // getDay returns 1-7 corresponding to Mon-Sun
                
                // time is in military (24 hr) time
                const time = isFriday ? 17 : 19; // 1700 == 5P.M. ; 1900 == 7P.M;
                
                returnDate.setDate(returnDate.getDate() + weeks * 7);
                returnDate.setHours(time, 0, 0, 0);

                $("#reservation-page").trigger("changeDateTime", {
                    from: moment(new Date()),
                    to: moment(returnDate)
                });
            }
        }    
    }
    
    /** Called once the document is ready */
    const ready = function () {
        // Extend the resource return time by 1 week
        Utility.extendDate(1);
    };
    
    // Everything inside of this if statement will be used to motify the prototype of WCOForm.
    // You do not really need to understand what a prototype is, however, you need to understand
    // how to do the modificatiosn. You find all of the methods that you can modify inside of
    // the chrome developers tool under sources. (right click on WebCheckout and hit "inspect" then click on the "sources tab".
    //
    // Under the sources tab, you need to find the "timeine-scheduler.js" file which is uninder webcheckout/common/js. Once
    // you open this file, you will realize that it has been compressed. Lucky for us, the DevTools gives us an easy way
    // to uncompress (pretty print) the code. You can find the button to do that right next to the Line and Column count
    // under the code. The button should have an icon of two brackets like: {}.
    //
    // Once you have open the file in a readable format, you will need to search for "WCOForm.prototype". All of the methods
    // inside of this object (hint: they all start with an underscore) can be modified so that when they are called inside
    // of webcheckout, that your version is called. You do this like the "_addBarcodeResource".
    //
    // Whenever you override a method you need to include the following information:
    //  - What does the method do
    //  - What page is the method called on
    //  - What changes are you making? 
    //  - Why are you making these changes? 
    //  - What modifications did you have to make
    if (WCOForm) {
        /**
         * Overrides the _addBarcodeResource method. 
         * 
         * Function: This method is called when we click on the "Add Resource" button or hit enter when adding items. 
         * Pages: Checkout and Reservation
         *
         * --CHANGE 1--
         * Change: Allow items to be added to a checkout before the person has been selected.
         * Why: Entering items before a user even has an account saves time.
         * How: Removed a condition inside of the original code that blocked the addition of resources if t.patron was null.
         *
         * --CHANGE 2--
         * Change: Adding EdTPA Resource will extend the return date by 2 weeks from the current date.
         * Why: Since the return time is automatically set to 1 week, I wanted tje automation to be reflected 
         * in this scenario as well.
         * How: Added a condition to check the resource description. If it contains the word "edtpa" then we will call
         * the extendDate utility to extend the date by two weeks.
         */
        WCOForm.prototype._addBarcodeResource =  function(resources) {
            var t = this;
            resources = resources || [],
            (resources.length < 1 ? (t.showTemporaryMessage("No resources match the ID or barcode '" + $("input#input-barcode", t.wrapper).val() + "'", "error"),
            t.soundAbort()) : 1 == resources.length ? (t.datasource.exec("add-resource", "fillAllocation", resources[0].oid),
            t.soundBeep()) : t.showTemporaryMessage("Multiple resources match the ID or barcode '" + $("input#input-barcode", t.wrapper).val() + "'; Use the 'Find Resources' screen instead.", "error"),
            $("input#input-barcode", t.wrapper).val(""));
            
            // If the resource is an edtpa kit
            if (resources.length > 0 && resources[0].description.toLowerCase().includes("edtpa")) {
                // Then, we need to extend the date by two weeks.
                Utility.extendDate(2);
            }
        }
    }
    
    $(document).ready(ready);
}, 500);