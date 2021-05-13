import {Utility} from '../util.js';
import {SEEN_LIST, VERSION} from '../constants.js';

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
        return $("#show-last-detail-page").text().substr(7);
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
        $("#statusbar .rightStatusBar").prepend(`<div style="float:left;"><button class="btn font-weight-bold margin-bottom-5" style="box-shadow: none;border: 1px solid white;" id="openWhatsNew">What's New?</button></div>`);
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
