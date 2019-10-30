import {RemovePrefixModule, ResourceAdderModule, PatronSearchModule, KeyboardShortcutsModule} from './modules';

(function main($) {
    function installModule (module) {
        const createdModule = new module();
        if (module.hasOwnProperty('install')) {
            let moduleName = module.constructor.name;
            console.error(`Module "${moduleName}": Could not be installed due to missing install method.`);
        } else {
            createdModule.install();  
        } 
    }

    $(document).ready(function () {
        installModule(RemovePrefixModule);
        installModule(ResourceAdderModule);
        installModule(PatronSearchModule);
        installModule(KeyboardShortcutsModule)
    });
    
    // Appends the inject.js script to webpage so that it receives full access to the page.
    let s = document.createElement('script');
    s.src = chrome.extension.getURL('WebCheckout/inject.js');
    (document.head || document.documentElement).appendChild(s);
})(jQuery);