import {GLOBAL_RUNTIME} from './constants.js';
import {RemovePrefixModule, ResourceAdderModule, PatronSearchModule, KeyboardShortcutsModule, WhatsNewModule, CommitModule} from './modules';

(function main($) {
    function installModule (module) {
        const createdModule = new module();
        if (Object.prototype.hasOwnProperty.call(module, "install")) {
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
        installModule(WhatsNewModule);
        installModule(KeyboardShortcutsModule);
        installModule(CommitModule);
    });
    
    // Appends the inject.js script to webpage so that it receives full access to the page.
    let s = document.createElement('script');
    s.src = GLOBAL_RUNTIME.getURL('WebCheckout/inject.js');
    (document.head || document.documentElement).appendChild(s);
})(jQuery);
