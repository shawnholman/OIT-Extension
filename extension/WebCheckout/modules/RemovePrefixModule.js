/**
 * This module removes the OIT- prefix from any barcode that has it. Etc. "OIT-4455" => "4455"
 */
export class RemovePrefixModule {
    _removePrefix () {
        $(this).val($(this).val().trim().replace(/^OIT-/, ''));
    }  
    
    install() {
        $(".autocomplete-input").on("input", this._removePrefix);
    }
}
