(function() {
    'use strict';

    // Id's of various elements needed to manipulate
    const TIME_REPORTING_OPENER = "TL_LBL_WRK_TIME_RPTG_LBL$0"; // arrow next to "Time Reporting Elements"
    const TIME_REPORTING_INPUT = "TL_RPTD_TIME_TRC$0"; // select input next to "Time Reporting Code" under "Time Reporting Elements"
    const PUNCH_BUTTON = "TL_LINK_WRK_TL_SAVE_PB$0"; // punch button element
    const SIGNOUT = "pthdr2signout"; // signout button in the dropdown menue

    /**
     * Quick and easy watch method that used a rapid interval to check for a condition and perform an action
     * @param {func} This is the watch condition function that should return either true for conditon has been met or false if the condition has not been met. Conditions should be kept pretty simple.
     * @param {func} This is the action function that should be fired if the watch condition function's condition has been met. In other words, when condition.call() === true ? action.call() : try again;
     * @return {func} The interval method which will allow you to prematurely stop the loop
     */
    function watch (condition, action) {
        let int = setInterval(function () {
            if (condition.call()) {
                action.call();
                clearInterval(int);
            }
        }, 10);
        return int;
    }
    let iframe = document.getElementById("ptifrmtgtframe");

    // wait for the iFrame before we can mess with it
    iframe.onload = function () {
        let frameWindow = iframe.contentWindow;
        let doc = frameWindow.document;

        // open the time reporting element
        doc.getElementById(TIME_REPORTING_OPENER).click();

        // correct the time reporting
        watch(() => doc.getElementById(TIME_REPORTING_INPUT) != null, () => {
            /**
             * Opening the time reporting element recreates the punch in box so we need to attach the event
             * after the time reporting has been opened.
             */
            doc.getElementById(PUNCH_BUTTON).parentNode.onmousedown = function () {
                /**
                 * We are just watching for an alert box (currently with id: alertmsg) that contains a message with "In punch" or "Out punch" to know that the user has punched in.
                 */
                watch (() => {
                    let alertbox = document.getElementById("alertmsg");
                    if (alertbox == null) return false;
                    let message = alertbox.getElementsByClassName("popupText")[0].innerText;

                    return message.includes("In punch") || message.includes("Out punch");
                }, () => {
                    document.getElementById(SIGNOUT).click()
                });
            };

            // set the time reporting code to regular
            doc.getElementById(TIME_REPORTING_INPUT).value = "00REG";
        });
    };
})();