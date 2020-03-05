# Get the current version of the extension inside of the manifest file
CURRENT_EXTENSION_VERSION=$(cat ./extension/manifest.json | python -c 'import json,sys;obj=json.load(sys.stdin);print obj["version"]')
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
LINT=$(./node_modules/.bin/eslint extension/)

if [ -z "$LINT" ]; then
    printf "${GREEN} Passed Lint${NC}\n"
else
    ./node_modules/.bin/eslint extension/
    exit 1;

fi

#rm ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip
# See if there is a "What's New" file ready for this version
if [ ! -f ./extension/WebCheckout/templates/whats_new/$CURRENT_EXTENSION_VERSION.html ]; then
    echo "A 'What's New for version" $CURRENT_EXTENSION_VERSION " does not exist. Would you like to proceed (y/n)";
    read answer;
    
    if [ $answer = 'n' ]; then
        exit 1;
    fi
    echo "CONTINUE";
fi

# Check to see if both files already exist. Chances are, this means that the developer has not updated the verson inside the manifest
#if [[ -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip && -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ]]; then
if [[ -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip ]]; then
     echo "ZIP and XPI Files for version $CURRENT_EXTENSION_VERSION already exists."
     printf "${RED} Did you forget to update the manifest.json file with the newest version?${NC}"
     echo ""
     exit 1
fi

echo "Packing the extension.."
webpack --config webpack-once.config.js 

echo "Linting..."
./node_modules/.bin/eslint extension/

# Create the necessary zip file for Chrome if it does not exist.
if [ ! -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip ]; then
    echo "Creating ZIP file for Chrome extension.."
    cd extension; zip -rq ../prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip *
    cd -
    echo "SUCCESS"
else
    echo "ZIP File for version $CURRENT_EXTENSION_VERSION already exists."
fi

: '
Creating firefox extensions does not appear to work at the moment anymore

# Create the necessary xpi file for Firefox if it does not exist.
if [ ! -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ]; then
    echo "Creating XPI file for Firefox extension.."
    cd extension 

    AMO_JWT_ISSUER="user:14651378:752"
    AMO_JWT_SECRET="0e5b4e0849bc44068a1962b81642ef281341d59e245f7088e528f738ac1cf6f4"
    web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET 

    cd ..
    mv ./extension/web-ext-artifacts/oitlogging-$CURRENT_EXTENSION_VERSION-an+fx.xpi ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi
    rm -rf ./extension/web-ext-artifacts 
    
    rm ./extension/.web-extension-id
    
    echo "Updated git"
    echo "SUCCESS"
else 
    echo "XPI File for version $CURRENT_EXTENSION_VERSION already exists."
fi'

if [[ ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip && ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ]]; then
     git add prod/*
     git commit -am "Upgraded to version $CURRENT_EXTENSION_VERSION"
     git push
fi