RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
LINT=$(./node_modules/.bin/eslint extension/)

#if [ -z "$LINT" ]; then
 #   printf "${GREEN} Passed Lint${NC}\n"
#else
#    ./node_modules/.bin/eslint extension/
#fi

    
    
createModule() {
    MODULE_NAME=$1
    #printf "\nexport * from './$MODULE_NAME.js';" >> extension/WebCheckout/modules/index.js
    #touch extension/WebCheckout/modules/${MODULE_NAME}Module.js
    #printf "/**
    # * This module...describe the module
    # */
    #export class ${MODULE_NAME}Module {
    #    install() {
    #        // Do something here to the DOM
    #    }
    #}" >> extension/WebCheckout/modules/${MODULE_NAME}Module.js
    sed -ie $"/\$(document)\.ready/a\ 
    installModule(${MODULE_NAME}Module);
    " extension/WebCheckout/main.js
}

createModule Test
