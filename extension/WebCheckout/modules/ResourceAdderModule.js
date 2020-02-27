import {Utility} from '../util.js';
import {Requests} from '../requests.js';

function console(mess, type) {
    let classes = type || 'default';
    document.getElementById('progress-prompt').innerHTML += `<div class='${classes}'>${mess}</div>`;
    document.getElementById('progress-prompt').scrollTop = document.getElementById('progress-prompt').scrollHeight;
}

/**
 * Verifies that all fields have been properly filled out and the finish button can or cant be enabled
 */
function checkFinishDisability() {
    let numberOfInputs = $('.featherlight-inner .content .row .form-control').length;
    let numberOfCompletedInputs = $('.featherlight-inner .content .row .form-control').filter(function () {
        return ($(this).hasClass('type') && $(this).hasClass('autocompleted')) || // type field needs to be autocompleted
            ($(this).hasClass('numbers') && $(this).val().match(/[0-9]{1,}/)) || // numbers field should have at least 1 number
            ($(this).hasClass('description')) // the description field can optionally be blank
    }).length;

    $("#finishadding").attr("disabled", !(numberOfInputs == numberOfCompletedInputs));
}

function redirectToOriginalForm () {
     document.location = '?method=new-resource-wizard';
}

function removeResourceRow () {
    if ($(".featherlight-inner .content").find('.row').length > 1) { // ensure that we can not remove the last remaining row
        $(this).closest('.row').slideUp(200, function () {
            $(this).remove();
            checkFinishDisability();
        });
    }
}

function addResourceRow(inputRow) {
    $('.featherlight-inner .content').append(inputRow);
    checkFinishDisability();
}

function assignAutoCompletedValue () {
    let oid = $(this).data('oid');
    let value = $(this).text();

    $(this).parent().prev().data('oid', oid).val(value).addClass('autocompleted');
    $(this).parent().empty();
    checkFinishDisability();
}

function emptyAutoCompleted () {
    $('.featherlight-inner .autocomplete').empty();
}

function loopUpAutoCompletedValues () {
    let value = $(this).val();
    $(this).removeClass('autocompleted');
    Requests.autocomplete.resource(value).then((results) => {
        if ($(this).is(':focus')) { // only show the results if we are still focuses on the input
            let list = '';
            for (let result of results) {
                list += `<li data-oid="${result.oid}">${result.name}</li>`;
            }
            $(this).next().html(list); // add the list of items
        }
    });
}

function tryAndCompleteAutoCompleteAssignment () {
    if (!$(this).hasClass('autocompleted')) {
        let value = $(this).val();
        Requests.autocomplete.resource(value).then((results) => { // check the current value of the input and see if we can derive an auto completed value anyways
            if (results.length == 1) { // if the input only gives one autocorrected result then we can use that result to finish the completion
                let result = results[0];
                $(this).data('oid', result.oid).val(result.name).addClass('autocompleted');
            } else {
                // however, even if we get multiple results, if the input value matches one of the autocompleted ones exactly,
                // we can choose that one as the autocorrect
                for (let result of results) {
                    if (result.name == value) {
                        $(this).data('oid', result.oid).addClass('autocompleted');

                        break;
                    }
                }
            }
            checkFinishDisability();
        });
    }
}

async function addAllResources() { // Add Resources
    // collect together all of the resources from the input
    let allResources = [];

    $('#finishadding, #addresource').attr('disabled', true);
    
    // collect the information from each inputRow
    $('.featherlight-inner .content .row').each(function () {
        const row =  $(this);
        const type = row.find('.type').data('oid') + '|' + row.find('.type').val();
        const resourceIds = row.find('.numbers').val().split(/\s*,\s*/);
        const description = row.find('.description').val();

        for (let resourceId of resourceIds) {
            allResources.push({"id": resourceId, type, description});
        }
        row.remove();
    });
    
    // Get the console
    $('.featherlight-inner .content').html(await Utility.pullResource('WebCheckout/templates/resource_adder/console.html', {}, true));

    // add the resources
    let req = Requests.addResources(allResources).then(function () {
        $('#cancel, #finishadding, #addresource').attr('disabled', true);
        console('All Resources have been added.', 'success');
    });

    req.progress(function (prog, frame) { // progress as the resources are added
        const cantCancel = (frame != null && frame.hasOwnProperty('finishing') && frame.finishing == true) || prog.total - prog.completed == 1;

        $('#cancel').attr('disabled', cantCancel);

        switch (prog.completed % 4) {
            case 0:
                console('Resetting resource creator..');
                break;
            case 1:
                const id = frame.data["choose-resource-id-form.resource-id"];
                console(`Creating resource  ${id} ..`);
                break;
            case 2:
                const type = frame.data["choose-resource-type-form.search-field"];
                console(`Connecting type ${type} ..`);
                break;
            case 3:
                console('Finishing Resource Creation..');
                break;
        }

        let progressBar = $('.featherlight-inner .content .progress-bar');

        if (prog.remaining == 0) {
            progressBar.parent().prev().hide()
        } else {
            progressBar.parent().prev().show().find('strong').text(Math.round(prog.remaining) + ' seconds');
        }
        progressBar.attr('aria-valuenow', prog.percent * 100).width(prog.percent * 100 + '%');
    });

    $("#cancel").off('click').on('click', () => {
        req.cancel();
        $('#cancel, #finishadding, #addresource').attr('disabled', true);
        $('.featherlight-inner .content .progress').hide().parent().prev().hide();
        console('Cancelled. Current Resource will be revoked and any pending resources will be ignored.', 'error');
    });
}

/**
 * The ResourceAdderModule modernizes the way that new resources are added into the system. This module is put into 
 * action when clicking the "New Resource" button under resources.
 */
export class ResourceAdderModule {
    async _openResourceAdder () {
        const inputRow = await Utility.pullResource('WebCheckout/templates/resource_adder/inputRow.html', {}, true);

        Utility.pullResource('WebCheckout/templates/resource_adder/index.html', { inputRow }, true).then(function (content) {
            Utility.openLightBox(content, function () {
                $('#originalform').on('click',  redirectToOriginalForm);

                $('.featherlight-inner')
                    .on('click', emptyAutoCompleted)
                    .on('click', '.remove-row', removeResourceRow)
                    .on('click', '.autocomplete li', assignAutoCompletedValue)
                    .on('keyup', '.type.form-control', loopUpAutoCompletedValues)
                    .on('blur', '.type.form-control', tryAndCompleteAutoCompleteAssignment)
                    .on('keyup change', '.form-control', checkFinishDisability);
                        
                // We are passing the input row in so that we do not need to make new
                // resource calls for each added resource
                $("#addresource").on('click', addResourceRow.bind(this, inputRow));
                $("#finishadding").on('click', addAllResources);
            });
        });
    }
    
    install() {
        $('#new-resource-wizard').removeAttr('href').on('click', this._openResourceAdder);
    }
}