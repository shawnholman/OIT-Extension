setTimeout(function() {
    if (WCOForm) {
        WCOForm.prototype._addBarcodeResource =  function(resources) {
            var t = this;
            resources = resources || [],
            (resources.length < 1 ? (t.showTemporaryMessage("No resources match the ID or barcode '" + $("input#input-barcode", t.wrapper).val() + "'", "error"),
            t.soundAbort()) : 1 == resources.length ? (t.datasource.exec("add-resource", "fillAllocation", resources[0].oid),
            t.soundBeep()) : t.showTemporaryMessage("Multiple resources match the ID or barcode '" + $("input#input-barcode", t.wrapper).val() + "'; Use the 'Find Resources' screen instead.", "error"),
            $("input#input-barcode", t.wrapper).val(""))
        }
    }
}, 500);