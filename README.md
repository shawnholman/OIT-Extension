# OIT-Extension
This extension serves to provide helper functionalities to our services. Specifically, it helps connect OITLogging to WebCheckout and improves the experience with OneSource by automatically logging you out after you clock in or out. This extension is, thus, divided into a "OneSource" section and a "WebCheckout" section. The WebCheckout part of the extension is much larger and will get most of the focus in this read me. The OneSource extension consists of a single JavaScript file while the WebCheckout extension requires special attention to compiling instructions and overall structure of the code. This will all be explained below.

## Support
This extension has been testing and used for Chrome and Firefox but should work in Opera and Safari likewise.

## Prerequisites 
In order to develop this extension, you should have some previous knowledge with following this:

- HTML
- CSS (including bootstrap)
- JavaScript (version: es6, libraries: jQuery) 
- Webpack
- Node.js 
    - Node Package Manager
    - package.json
    - node_nodes
- Developing Extensions
- Bash Files (.sh)

If you are not familiar with these, you can still develop this extension! Just know, that there w

## First-time Instructions
Before you clone this repository, make sure that the computer that you intend to clone the repository is has an SSH Key associated with the account. Go ahead and set this up if you sure that you do not have this setup or if you are unsure if it already is or not. You can find instructions below under the section called "SSH Authentication".

The first time that you clone this repository you are going to need to setup the environment. This is an easy process as a bash script already exists for you. 
Run the command below to setup your environments inside of the terminal. Make sure you are inside of the OIT-Extension folder.
```
$ ./setup.sh
```

## Developing Locally
Maintaining and improving this extension is really easy once you understand what each part of the extension does. This section will hopefully guide you through this making it easier to get started. This section will focus on the "WebCheckout" part of this extension. The OneSource part of this extension consists of only a single file while "WebCheckout" consists of several interconnected files.

### Compilation using WebPack
Since version 2.0.0, webpack is used to compile the WebCheckout (extension/WebCheckout) part of the extension down to a single JavaScript file (excluding libraries). Webpacking allows you to use "import" statements to fetch the needed variables, classes, methods, or objects from other files. This enables code reuse and reduced redundancy. An easy to understand example is the "WebCheckout/constant.js" file which contains constants used throughout this part of the extension. For example, if we wanted to create a file called "hello.js" which prints the version of the extension the console, we could write it like this:

```javascript
import {VERSION} from '../constants.js';

console.log(VERSION);
```

In the terminal, run the 'webpack' command from the home directory. This is the directory that contains the 'webpack.config.js' file, so check the contents of the folder using 'ls' if you are not sure if you are in the correct folder. Once the command is running, you can work on the extension. Any changes will be picked up and the extension will be recompiled so that you can pick up the changes in your browser (See "Testing Locally"). If you would like to just compile once without watching for changes, run 'webpack --config webpack-once.config.js'.

### Modules
Each feature of the WebCheckout extension is broken down into modules that are installed inside of 'main.js'. Modules are added using the "WebCheckout/module" folder and represents a single feature. A Module is a class that is named "{NAME-OF-FEATURE}Module.js" and put into the module folder and also added into the index.js file inside of that folder. {NAME-OF-FEATURE} should concisely identify your feature. The module file should contain this minimum class structure:

```javascript
/**
 * This module ...{explain what the module does here}
 */
export class {NAME-OF-FEATURE}Module {
    install() {
        // Entry point into your module
        // Anything your module actually does. You should do all DOM manipulation here
    }
}
```

Once the module has been added to module folder, and it has been added to the index.js entry, you can install the module into the extension inside of the main.js. Import the module (on line 1) and add a new "installModule" statement with the name of your new module. In order to see your feature in effect, you will need to compile the extension (See "Compilation using WebPack"), and reload it into your browser (See "Testing Locally").

A good example to look at would be the RemovePrefixModule. The module is defined in the "module" folder as "RemovePrefixModule.js", has an entry in the index.js file, follows the minimum class structure, and is also installed into the extension inside of main.js

**Note: The reason why we include each module into the index.js file that resides in the module folder has to do with the way WebPack does importing and exporting. By exporting each module inside of this index file, we are able to import all modules at once by just using the address to the module folder. You can see this being used inside of the main.js**

An additional thing to note is that you should only have one public method. All methods that you wan't to specify as private should be preceeded by an underscore. Though, JavaScript does not have a notion of public/private variables, this will help keep the API clear.

### Libraries
All external libraries should be added into the "lib" folder and then included into the manifest.js file with the other library files. The library file should be listed before "WebCheckout/main.build.js" in this manifest file. No other steps are required to get the library working and can not be used within the WebCheckout section of the extension. Add it into the OneSource part of the manifest file if you need it there as well.

### CSS
All CSS should be put into the "css" folder and then included into the manifest.js file with the other CSS files. 

### Other files
All files outside of a sub-folder within WebCheckout/ are still compiled by webpack. This currently include "constants.js", "requests.js", "util.js" and a special file called "inject.js". The first three files were created to reduce the amount of code inside of a module. Each export a number of variables, functions, or objects that can be used throughout the extension. There are no guidelines on creating these files as long as it is logical, increases code reuse without sacrificing readability, and simply makes sense to do so.

#### inject.js
This JavaScript file is special and necessary for some of the features that were created using this extension. While inject.js is included in the webpack compilation, and can be imported by other files, inject.js should NEVER import other files. This is because inject.js actually gets injected into the source code of the webpage. To understand how this is different from the rest of the extension, it is important to understand that extensions typically run in a separate background process from the WebPage that it is running on top of. That means that the Website data is separate from the extensions data. For example, if the extension needs to access a variable that the website created, it would not be able to.

Certain features that the extension provides, requires the access of variables that are created by WebCheckout itself. The only way we can access them is by using a special script to inject one of our extensions JavaScript files directly into the Webpage enabling us to use the WebCheckout variables. As you can see, inside of the inject.js, the variable that we are currently interested in is called "WCOForm". inject.js is heavily commented to mitigate any confusion regarding the purpose of this file and the difference between it and the other stray JavaScript files. 

## Testing Locally 
In order to test the extensions, upload a local copy of the extension to your browser. 

### Chrome
1. Go to chrome://extensions/
2. In header, select the option that says "Developer Mode". This will open up the developers options which should now be visible.
3. Click on the button that says "Load unpacked" 
4. Select the "extension" folder inside of OIT-Extension (OIT-Extension/extension)
5. Click "Open"

The local copy will be added and any future changes can be reflect by hitting the "Update" button. This means that you do not have to continuously add and remove the extension for testing. However, if you want to make the process of refreshing the extension easier, make sure that you have "Extensions Reloader" downloaded. This is a chrome extension that you can find on the chrome store. 

### Firefox
1. Go to about:debugging
2. Click on Load Temporary Add-on
3. Select the manifest.json file inside of the "extension" folder (OIT-Extension/extension/manifest.json)
4. Click "Open"

The local copy will be added and any future changes can be reflect by hitting the "Reload" button. This means that you do not have to continuously add and remove the extension for testing.

## Pushing the Next Version Live
After you make changes to the extension, you will likely want to push it live to both Chrome and Firefox. This process is very easy! The first step is to advance the version number
inside of the manifest.json file. This is very important as you can not upload duplicate version numbers. See the version numbering section below for more information.

Next, you will need to pack the extension. In the terminal, call "webpack".

Creating the necessary ZIP and XPI files for publishing the extension has been automated by a bash script. In order to create these files, run the script below from the OIT-Extension folder.
```
$ ./compress_extension.sh
```
This will generate two files:
1. oitlogging-${version}.zip
2. oitlogging-${version}.xpi

where ${version} is replaced with the version number that is inside of the manifest.json file. The zip file will be used for Chrome, while the xpi file will be used by Firefox.

### Releasing to Chrome
1. Go to https://chrome.google.com/webstore/developer/dashboard. 
2. Login using mediadsk. 
3. Find the OITLogging listing and click on "Edit". 
4. Find the button that says "Upload Updated Package" 
5. Upload the **zip** file here.

The chrome extension should be pushed to each computer automatically after some time. If you do not want to wait for this to happen you can follow the steps below
to update manually.

1. Go to chrome://extensions
2. Click on Developer mode in the header bar
3. A bar should appear with an option to "Update"
4. Click on that.
5. Verify that the version is correct by clicking on "Details" by your extension.

### Releasing to Firefox
Firefox does not allow our extension to be on their store so we are self-distributing the extension. The steps below will need to be done
on every computer that you want to update as there is no way of pushing this to every computer.

1. Go to about:addons on firefox
2. Click on the extensions tab on the sidebar
3. Remove the current extension
4. There should be a gear icon someone on the page. Clicking this will make a dropdown appear with an option to "Install Add-on From File..". Click on this and select the xpi file.
5. Restart firefox.

## Version Numbering
This extension uses a three tier versioning system. Our versions look like: MAJOR.MINOR.BUGFIX (e.g., 1.3.0)

The meaning of each number are in the following order: Major Revision, Minor Revision, Bug Fix. 
The type of change(s) that you make to the code base will determine which number to advance. Advancing the major revision number
will reset both the minor revision number and bug fix version number to '0'. 
Advancing the minor revision number will reset only the bug fix version to '0'.

A logical version progression would look as follows.
```
1.0.0 => 1.0.1 => 1.1.0 => 1.2.0 => 1.2.1 => 1.2.2 => 1.3.0 => 2.0.0 => 2.0.1
```
### Major vs Minor vs Bug Fix
Determining which version number to advance should be determined based on the definitions below.

A major revision is one that adds/removes a lot of features or rewrites a large part of the code base. A minor revision
deals with small changes to the code base, one added feature, or a collection of bug fixes. A bug fix revision deals with just a single
bug being fixed. 


### SSH Authentication
Setting up SSH Authentication comes in two parts. Part one requires that you create a key on the computer that you want to access the repository from and the second step requires you to associate this key with your account.

Step 1: Create key
1. Open up terminal on your computer.
2. Run "cd ~" to make sure you are in the correct directory
3. Run "ssh-keygen -t rsa" to begin ssh key generation.
    - You will be asked what location to store the key. Press ENTER to accept the default location.
    - You will be asked for a secret key. This is your password to this repository and any future repositories that you want to use from this computer. **NOTE: If you have never entered a password into a terminal before, you will notice that it does not show what you are actually typing for security purposes. Be carful when entering in the password and make sure it is the intended value.**
    - You will be asked to confirm your key.
4. Run "pbcopy < ~/.ssh/id_rsa.pub" to copy the generate key into your clipboard.

Step 2: Add key to github
1. Login into github on mediadsk
2. Go to Account Settings (NOT repository settings)
3. Inside Account Settings go to "SSH and GPG Keys"
4. Add a new key, give it a name, and paste the key that you go from running the "pbcopy" command in step 1.4

The next step will be adding the key into