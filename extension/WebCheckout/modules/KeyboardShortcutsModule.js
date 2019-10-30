/**
 * The ShortCutModule implements several useful shortcuts to be used across WebCheckout
 */
export class ShortCutModule { 
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
        const prefix = this.keyPrefix || "";
        
        if (Array.isArray(keys)) {
            let combos = keys.reduce((accum, curr) => {
                    return accum + prefix + curr + ","; 
            }, "").slice(0, -1);
            
            key(combos, event);
        } else if (typeof keys === "string") {
            key(prefix + keys, event);
        }
    }
    /**
     * Creates the event listener that will take a user to a new link
     * @param href Link to go to
     */
    _goTo(href) {
        return () => {
            window.location.href = href;
        };
    }
    
    /**
     * Creates the event listener that will click on elements
     * @param element The id that unique identifies the clickable element..if more than one element are found an error will be thrown
     * @param dynamic specifies whether the element should be regiester on page load (non-dynamic) or should be checked for when the
     * event it triggered (dynamic)
     */
    _clickOn(element, dynamic) {
        if (dynamic == undefined || dynamic == false) {
            let el = $(element);
            if (el.length == 1) {
                return () => el[0].click();
            } else {
                if (el.length > 1) {
                    throw new Error("Can not identify a unique clickable element.");
                }
                return () => {}
            }
        }
        
        return () => {
            let el = $(element);
            if (el.length == 1) {
               el[0].click(); 
            }
            if (el.length > 1) {
                throw new Error("Can not identify a unique clickable element.");
            }
        }
    }
    
    _removeFilter() {
        // See: https://github.com/madrobby/keymaster#filter-key-presses
        key.filter = function () {
            return true;
        }
    }
    
    _installRedirects() {
        this._setPrefix("ctrl+shift");
        
        // Checkout Page
        this._key("c", this._goTo("?method=checkout-jump"));
        // New Reservation Page
        this._key("r", this._goTo("?method=reservation-jump"));
        // Reservation Pickup Page
        this._key("p", this._goTo("?method=find-reservations"));
        // Find Checkouts Page (aka Rapid Return)
        this._key("f", this._goTo("?method=find-checkouts"));
        // Quick Return Page (aka Rapid Return)
        this._key("q", this._goTo("?method=rapid-return"));
    }
    
    _installClicks() {
        this._setPrefix("ctrl");
        // Commit Button
        this._key("c", this._clickOn("#commit-button .submit-all")) 
        // Confirm Checkout Button
        this._key("c", this._clickOn("button:contains('Confirm Checkout')", true));
        // Timeline Scheduler Button (aka. Back to Checkout Button)
        this._key(["t", "b"], this._clickOn("button:contains('Timeline Scheduler')", true));
        // Confirm Checkout Button
        this._key("r", this._clickOn("button:contains('Reset')"));
    }
    
    install() {
        this._removeFilter();
        this._installRedirects();
        this._installClicks();
    }
}