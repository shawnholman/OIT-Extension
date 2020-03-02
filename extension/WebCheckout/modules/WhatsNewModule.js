import {Utility} from '../util.js';
import {VERSION} from '../constants.js';

/** Version of the most up to date version that should be in the what's new */
const SEEN_LIST = "webcheckout_seen_list";
/**
 * The ShortCutModule implements several useful shortcuts to be used across WebCheckout
 */
export class WhatsNewModule { 
    async _openWhatsNew() {
        const content = await Utility.pullResource(`WebCheckout/templates/whats_new/${VERSION}.html`);
        
        Utility.pullResource('WebCheckout/templates/whats_new/index.html', {
            version: VERSION,
            text: content
        }, true).then(function (content) {
            Utility.openLightBox(content, function () {
                
            });
        });
    }
    
    /** Identifies a logged in user by name (not 100% unique) */
    _getCurrentUser() {
        return document.querySelector("#statusbar .rightStatusBar a.sessionContent").innerText.replace(" (operator)", "");
    }
    
    /** Updates the seen list */
    _setSeenList(to) {
        localStorage.setItem(SEEN_LIST, JSON.stringify(to));
    }
    
    /** Gets the seen list accounting for if the list is empty */
    _getSeenList() {
        const list = localStorage.getItem(SEEN_LIST);
        if (list == null) {
            this._setSeenList([]);
            return [];
        }
        return JSON.parse(list);
    }
    
    /** See if a user has seen a version previously */
    _userHasSeenVersion(check_user, version) {
        let list = this._getSeenList();
        
        for (let user of list) {
            if (user.name == check_user && user.versionsSeen.includes(version)) {
                return true;
            }
        }
        return false;
    }
    
    /** Set a user to have seen a version */
    _setSeen(check_user, version) {
        let list = this._getSeenList();
        for (let user of list) {
            if (user.name == check_user) {
                user.versionsSeen.push(version);
                this._setSeenList(list);
                return true;
            }
        }
        
        list.push({
            name: check_user,
            versionsSeen: [version]
        });
        this._setSeenList(list);
    }
    
    /** Checks to see if the current user should be shown the whats new box */
    _userNotSeen() {
        let user = this._getCurrentUser();
        
        if (user != " ()") {
            return !this._userHasSeenVersion(user, VERSION)
        }
        return false;
    }
    
    install() {
        $("#statusbar .rightStatusBar").append(`<div class="rightSessionContent" style="margin-right: 10px;"><button class="button" id="openWhatsNew">What's New?</button></div>`);
        $("#openWhatsNew").on('click', () => {
            this._openWhatsNew();
            
            if (this._userNotSeen()) {
                this._setSeen(this._getCurrentUser(), VERSION);
                $("#openWhatsNew").removeClass("flash");
            }
        });
        
        if (this._userNotSeen()) {
            $("#openWhatsNew").addClass("flash");
        }
    }
}