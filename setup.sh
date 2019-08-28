#!/bin/bash

# Install Node Version Manager
echo "Installing Node Version Manager (NVM)"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

# Node Version Manager Environment Scripts for Bashrc
NVM_SETUP="export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This load\
s nvm bash_completion"

# Check to see if the bashrc file has the NVM_SETUP script already
echo "Chaecking NVM setup"l
if grep -Fxq "$NVM_SETUP" ~/.bashrc
then
    # If so, do nothing
    echo "NVM already setup"
else
    # Make the above bash script availiable to the current shell session
    echo "$NVM_SETUP" >> ~/.bashrc
    source ~/.bashrc
    echo "NVM setup complete"
fi

# Install the latest version of node
echo "Installing node"
nvm install 10.15.3

# Install all of the necessary packages
echo "Installing packages"
npm install
npm install --global gulp-cli

# Configure git for use inside of the terminal
echo "Running 'git config'"
git config --global user.email "mediadsk@uga.edu"
git config --global user.name "Media Desk"