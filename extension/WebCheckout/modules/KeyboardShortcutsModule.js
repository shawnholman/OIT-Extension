/* global key */
import {Utility} from '../util.js';

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
        if (event == false) {
            return;
        }
        
        const prefix = this.keyPrefix || "";
        let keyPressed;
        
        if (Array.isArray(keys)) {
            let combos = keys.reduce((accum, curr) => {
                    return accum + prefix + curr + ","; 
            }, "").slice(0, -1);
            
            keyPressed = keys[0];
            key(combos, event.func);
        } else if (typeof keys === "string") {
            keyPressed = keys;
            key(prefix + keyPressed, event.func);
        }
        
        // Create a shortcut name for the activeKeyList entry. 
        let shortcutName = (prefix + keyPressed);
        this.activeKeyList[shortcutName] = event.label;
    }

    _createMeta(label, func) {
        return { label, func };
    }
    /**
     * Creates the event listener that will take a user to a new link
     * @param href Link to go to
     */
    _goTo(href, label) {
        return this._createMeta("Go to " + label, () => {
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
                return this._createMeta(label, () => el[0].click());
            } else {
                if (el.length > 1) {
                    throw new Error("Can not identify a unique clickable element.");
                }
                return false;
            }
        }
        
        return this._createMeta(label, () => {
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
        this._setPrefix("ctrl+option");
        // Confirm Checkout Button
        this._key("c", this._clickOn("button:contains('Confirm Checkout')", "Confirm Checkout", true));
        
        this._setPrefix("ctrl");
        // Commit Button
        this._key("c", this._clickOn("#commit-button .submit-all", "Checkout")); 
        // Timeline Scheduler Button (aka. Back to Checkout Button)
        this._key(["b", "t"], this._clickOn("button:contains('Timeline Scheduler')", "Back to Checkout", true));
        // Confirm Checkout Button
        this._key("r", this._clickOn("a:contains('Reset')", "Reset Checkout"));
        // Return Resource Button
        this._key("q", this._clickOn("input[value='Return Resource']", "Return Resource", true));
    }
    
    _openShortCutMenu() {
        let shortcuts = "";
        
        for (let shortcut in this.activeKeyList) {
            shortcuts += "<pre style='border-radius: 0;margin: 0;border: none;background: white;padding: 5px 20px;'>" + shortcut +  "<span style='float:right'>" + this.activeKeyList[shortcut] + "</span></pre>";
        }
        
        Utility.pullResource('WebCheckout/templates/keyboard_shortcuts/index.html', { shortcuts }, true).then(function (content) {
            Utility.openLightBox(content, function () {});
        });
    }
    
    install() {
        this._removeFilter();
        this._installRedirects();
        this._installClicks();
        
        localStorage.setItem("list", JSON.stringify(this.activeKeyList));
        $("#statusbar .rightStatusBar").prepend(`<div style="float:left;"><button class="btn font-weight-bold margin-bottom-5" id="openShortcuts" style="box-shadow: none;border: 1px solid white;">Shortcuts</button></div>`);
        $("#openShortcuts").on('click', () => {
            this._openShortCutMenu();
        })
    }
}
