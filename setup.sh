#!/bin/bash

# Install Node Version Manager
echo "Installing Node Version Manager (NVM)"
touch ~/.bash_profile
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
source ~/.bashrc
echo "Bashrc sourced"

# Install the latest version of node
echo "Installing node"
nvm install 10.15.3

# Install all of the necessary packages
echo "Installing packages"
npm install
npm install --global gulp-cli

# Installs web-ext command for firefox. We use this to sign the extension.
echo "Install firefox web extensions cli"
npm install --global web-ext

# Configure git for use inside of the terminal
echo "Running 'git config'"
git config --global user.email "mediadsk@uga.edu"
git config --global user.name "Media Desk"

#AMO_JWT_ISSUER="user:14651378:248"
#AMO_JWT_SECRET="0df6cb3711c7616291583b0cfb90bc0a9e81eafa01fb6df6738970ae2957b89f"
#web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET 