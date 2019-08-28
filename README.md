# OIT-Extension
This extension serves to provide helper functionalities to our services. Specifically, it helps connect OITLogging to WebCheckout and improves the experience with OneSource by automatically logging you out.

## First-time Instructions
If this is the first time pulling this extension, then open up the terminal and run the following command in the extensions folder:
```
$ ./setup.sh
```
## Creating the next extension version
In order to zip up the extension, make sure that you advance the version number in the "manifest.json" file. Then, inside of the terminal, go to the extensions folder, and run "gulp compress". This will put a zip file with the extension inside of the prod folder.

## Adding the extension to chrome
The zip file can directly be uploaded to the chrome developers dashboard at https://chrome.google.com/webstore/developer/dashboard. Login using mediadsk. Find the OITLogging listing and click on "Edit". Find the button that says "Upload Updated Package" and use the zip file given here.

## Adding the extension to firefox
Firefox does not allow our extension to be on their store so we are self-distributing the extension. Firefox extensions have to be signed by Mozilla. This is done at https://addons.mozilla.org/en-US/firefox/. Sign in using mediadsk and
then go to the "Developer Hub".  Click on "Product Page" and find "Upload New Version" on the side. You will upload the zip file there and receive an xpi file back from them. Put this file in the "firefox" folder on this extension and push an update to git that way all the other computers can have a copy of the xpi file.

In order to update the extension, follow the following steps for **each** computer:

1. Go to about:addons on firefox
2. Click on the extensions tab on the sidebar
3. Remove the current extension
4. There should be a gear icon someone on the page. Clicking this will make a dropdown appear with an option to "Install Add-on From File..". Click on this and select the xpi file.
5. Restart firefox.