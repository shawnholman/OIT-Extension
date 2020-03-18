import {Requests} from '../requests.js';
import {Utility} from '../util.js';

export class CommitModule {
    async _showErrorBox () {
        let errorList = "";
        $('.messages .message-error').each(function () {
            errorList += "<li>" + $(this).text() + "</li>";
        });
        let content = await Utility.pullResource('WebCheckout/templates/commit_confirm/commit-error.html', {errors: errorList});
        Utility.openLightBox(content, function () {}); 
    }
    async _checkout(allocationId) {
        if ($('.messages .message-error').length > 0) {
            this._showErrorBox();
            return;
        }
        
        let content = await Utility.pullResource('WebCheckout/templates/commit_confirm/index.html', {});
        Utility.openLightBox(content, function () {
            Requests.completeCheckout(allocationId).then(function () {
                $('#commitment-message').text("Done!");
                $('#committing-loader').toggleClass('load-complete');
                $('#committing-loader .checkmark').toggle();
                
                setTimeout(function () {
                    $(".reset-all")[0].click();
                    $(".resources-selected-list, .patron-info").empty();
                    $("#input-patron").val("").focus();
                    $.featherlight.close();
                    
                }, 500);
            });
        });   
    }
    
    install() {
        $(".rp-button.submit-all")
            .unwrap() // removes the parent "form" tag
            .on('click', () => {
            let allocationId = $("#allocation").text().match(/[0-9]+/)[0];
            this._checkout(allocationId);
        });
    }
}