# OIT-Extension
This extension serves to provide helper functionalities to our services. Specifically, it helps connect OITLogging to WebCheckout and improves the experience with OneSource by automatically logging you out.

## Support
This extension has been testing and used for Chrome and Firefox but should work in Opera and Safari likewise.

## First-time Instructions
Before you clone this repository, make sure that the computer that you intend to clone the repository is has an SSH Key associated with the account. Go ahead and set this up if you sure that you do not have this setup or if you are unsure if it already is or not. You can find instructions below under the section called "SSH Authentication".

The first time that you clone this repository you are going to need to setup the environment. This is an easy process as a bash script already exists for you. 
Run the command below to setup your environments inside of the terminal. Make sure you are inside of the OIT-Extension folder.
```
$ ./setup.sh
```
## Pushing the Next Version Live
After you make changes to the extension, you will likely want to push it live to both Chrome and Firefox. This process is very easy! The first step is to advance the version number
inside of the manifest.json file. This is very important as you can not upload duplicate version numbers. See the version numbering section below for more information.

Creating the necessary ZIP and XPI files for publishing the extension has been automated by a bash script. In order to create these files, run the script below from the OIT-Extension folder.
```
$ ./compress_extension.sh
```
This will generate two files:
1. oitlogging-${version}.zip
2. oitlogging-${version}.xpi

where ${version} is replaced with the version number that is inside of the manifest.json file. The zip file will be used for Chrome, while the xpi file will be used by Firefox.

### Pushing to Chrome
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

### Pushing to Firefox
Firefox does not allow our extension to be on their store so we are self-distributing the extension. The steps below will need to be done
on every computer that you want to update as there is no way of pushing this to every computer.

1. Go to about:addons on firefox
2. Click on the extensions tab on the sidebar
3. Remove the current extension
4. There should be a gear icon someone on the page. Clicking this will make a dropdown appear with an option to "Install Add-on From File..". Click on this and select the xpi file.
5. Restart firefox.

## Testing Locally
In order to test the extensions, upload a local copy of the extension to your browser.  

### Chrome
1. Go to chrome://extensions/
2. In header, select the option that says "Developer Mode". This will open up the developers options which should now be visible.
3. Click on the button that says "Load unpacked" 
4. Select the "extension" folder inside of OIT-Extension (OIT-Extension/extension)
5. Click "Open"

The local copy will be added and any future changes can be reflect by hitting the "Update" button. This means that you do not have to continuously add and remove the extension for testing.

### Firefox
1. Go to about:debugging
2. Click on Load Temporary Add-on
3. Select the manifest.json file inside of the "extension" folder (OIT-Extension/extension/manifest.json)
4. Click "Open"

The local copy will be added and any future changes can be reflect by hitting the "Reload" button. This means that you do not have to continuously add and remove the extension for testing.

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
    i. You will be asked what location to store the key. Press ENTER to accept the default location.
    ii. You will be asked for a secret key. This is your password to this repository and any future repositories that you want to use from this computer. *NOTE: If you have never entered passwords into a terminal before, you will notice that it does not show what you are actually typing for security purposes so be carful when entering in the password.*
    iii. You will be asked to confirm your key.
4. Run "pbcopy < ~/.ssh/id_rsa.pub" to copy the generate key into your clipboard.

Step 2: Add key to github
1. Login into github on mediadsk
2. Go to Account Settings (NOT repository settings)
3. Inside Account Settings go to "SSH and GPG Keys"
4. Add a new key, give it a name, and paste the key that you go from running the "pbcopy" command in step 1.4

The next step will be adding the key into