/**
 * This module removes the OIT- prefix from any barcode that has it. Etc. "OIT-4455" => "4455"
 */
export class RemovePrefixModule {
    _removePrefix () {
        $(this).val($(this).val().replace(/OIT-/, ''));
    }  
    
    install() {
        $("#input-barcode, textarea[id^='rapid']").on("keydown", this._removePrefix);
    }
}