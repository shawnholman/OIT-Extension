# Get the current version of the extension inside of the manifest file
CURRENT_EXTENSION_VERSION=$(cat ./extension/manifest.json | python -c 'import json,sys;obj=json.load(sys.stdin);print obj["version"]')
RED='\033[0;31m'
NC='\033[0m' # No Color

rm ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip

# Check to see if both files already exist. Chances are, this means that the developer has not updated the verson inside the manifest
if [[ -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip && -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ]]; then
     echo "ZIP and XPI Files for version $CURRENT_EXTENSION_VERSION already exists."
     printf "${RED} Did you forget to update the manifest.json file with the newest version?${NC}"
     echo ""
     exit 1
fi

# Create the necessary zip file for Chrome if it does not exist.
if [ ! -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip ]; then
    echo "Creating ZIP file for Chrome extension.."
    zip -rq ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.zip extension
    echo "SUCCESS"
else
    echo "ZIP File for version $CURRENT_EXTENSION_VERSION already exists."
fi

# Create the necessary xpi file for Firefox if it does not exist.
if [ ! -f ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ]; then
    echo "Creating XPI file for Firefox extension.."
    cd extension 

    AMO_JWT_ISSUER="user:14651378:248"
    AMO_JWT_SECRET="0df6cb3711c7616291583b0cfb90bc0a9e81eafa01fb6df6738970ae2957b89f"
    web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET 

    cd ..
    mv ./extension/web-ext-artifacts/oitlogging-$CURRENT_EXTENSION_VERSION-an+fx.xpi ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi
    cp -r ./prod/oitlogging-$CURRENT_EXTENSION_VERSION.xpi ./firefox/oitlogging-$CURRENT_EXTENSION_VERSION.xpi
    rm -rf ./extension/web-ext-artifacts 
    
    rm ./extension/.web-extension-id
    
    echo "Updated git"
    git add ./firefox/oitlogging-$CURRENT_EXTENSION_VERSION.xpi
    git commit -am "Upgraded to version $CURRENT_EXTENSION_VERSION"
    git push
    echo "SUCCESS"
else 
    echo "XPI File for version $CURRENT_EXTENSION_VERSION already exists."
fi