import {Requests} from '../requests.js';
import {Utility} from '../util.js';

export class CommitModule {
    async _showErrorBox (message) {
        let errorList = `
            <li>${message}</li>
        `;
        let content = await Utility.pullResource('WebCheckout/templates/commit_confirm/commit-error.html', {errors: errorList});
        Utility.openLightBox(content, function () {}); 
    }
    
    async _checkout(allocationId) {
        if ($(".item-unavailabe-icon").length > 0) {
            this._showErrorBox("One or more resources are not available.");
            return;
        }

        if ($('.selectedResourceItem').length == 0) {
            this._showErrorBox("No resources or resource types selected.");
            return;
        }
        
        let content = await Utility.pullResource('WebCheckout/templates/commit_confirm/index.html', {});
        Utility.openLightBox(content, function () {

            Requests.completeCheckout(allocationId).then(function () {
                $('#commitment-message').text("Done!");
                $('#committing-loader').toggleClass('load-complete');
                $('#committing-loader .checkmark').toggle();
                
                setTimeout(function () {
                    location.reload();
                }, 500);
            });
        });   
    }
    
    install() {
        $("#resourceInput").parent().append(`<button id="commitNow" class="btn font-weight-bold margin-bottom-5" type="button">Checkout!</button>`);
        $(document).on('click', '#commitNow', () => {
            let allocationId = Utility.getAllocationId();
            this._checkout(allocationId);
        });
    }
}
