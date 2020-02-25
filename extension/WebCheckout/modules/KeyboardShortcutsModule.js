/**
 * The ShortCutModule implements several useful shortcuts to be used across WebCheckout
 */
export class KeyboardShortcutsModule { 
    constructor() {
        this.activeKeyList = {};

        this.keyToSymbol = {
            "command": "⌘",
            "shift": "⇧",
            "option": "⌥",
            "alt": "⌥"
        }  
    }
    
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
        let key;
        
        if (Array.isArray(keys)) {
            let combos = keys.reduce((accum, curr) => {
                    return accum + prefix + curr + ","; 
            }, "").slice(0, -1);
            
            key = keys[0];
            key(combos, event.func);
        } else if (typeof keys === "string") {
            key = keys;
            key(prefix + key, event.func);
        }
        
        // Create a shortcut name for the activeKeyList entry. It will replace the word of the key with their symbol.
        // For example, command+shirt+A would turn into ⌘+⇧+A
        let shortcutName = (prefix + key).replace(new RegExp(Object.keys(this.keyToSymbol).join("|"), "g"), function (m) {
            return this.keyToSymbol[m];
        });
        activeKeyList[shortcutName] = event.label;
    }

    _createMeta(label, func) {
        return { label, func };
    }
    /**
     * Creates the event listener that will take a user to a new link
     * @param href Link to go to
     */
    _goTo(href, label) {
        return this._createMeta(label, () => {
            window.location.href = href;
        });
    }
    
    /**
     * Creates the event listener that will click on elements
     * @param element The id that unique identifies the clickable element..if more than one element are found an error will be thrown
     * @param dynamic specifies whether the element should be regiester on page load (non-dynamic) or should be checked for when the
     * event it triggered (dynamic)
     */
    _clickOn(element, label, dynamic) {
        if (dynamic == undefined || dynamic == false) {
            let el = $(element);
            if (el.length == 1) {
                return this.createMeta(label, () => el[0].click());
            } else {
                if (el.length > 1) {
                    throw new Error("Can not identify a unique clickable element.");
                }
                return this.createMeta(label, () => {});
            }
        }
        
        return this.createMeta(label, () => {
            let el = $(element);
            if (el.length == 1) {
               el[0].click(); 
            }
            if (el.length > 1) {
                throw new Error("Can not identify a unique clickable element.");
            }
        });
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
        this._key("c", this._goTo("?method=checkout-jump", "Checkout"));
        // New Reservation Page
        this._key("r", this._goTo("?method=reservation-jump", "Reservation"));
        // Reservation Pickup Page
        this._key("p", this._goTo("?method=find-reservations", "Pickup"));
        // Find Checkouts Page (aka Rapid Return)
        this._key("f", this._goTo("?method=find-checkouts", "Find Checkouts"));
        // Quick Return Page (aka Rapid Return)
        this._key("q", this._goTo("?method=rapid-return", "Quick Return"));
    }
    
    _installClicks() {
        this._setPrefix("ctrl");
        // Commit Button
        this._key("c", this._clickOn("#commit-button .submit-all", "Checkout")) 
        // Confirm Checkout Button
        this._key("c", this._clickOn("button:contains('Confirm Checkout')", "Confirm Checkout", true));
        // Timeline Scheduler Button (aka. Back to Checkout Button)
        this._key(["t", "b"], this._clickOn("button:contains('Timeline Scheduler')", "Back to Checkout", true));
        // Confirm Checkout Button
        this._key("r", this._clickOn("button:contains('Reset')", "Reset Checkout"));
    }
    
    install() {
        /**<div class="rightSessionContent"><div class="rightSessionName">
    Keyboard Shortcuts: ⌘⇧R - Go to Checkout
</div></div>*/
        localStorage.setItem("list", JSON.stringify(this.activeKeyList));
        $("#statusBar .rightStatusBar").append("SOMETHING NEW");
        this._removeFilter();
        this._installRedirects();
        this._installClicks();
    }
}