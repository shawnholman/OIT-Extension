curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

echo "export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion" >> ~/.bash_profile

echo "export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion" >> ~/.bashrc

source ~/.bashrc
source ~/.bash_profile

nvm install node
nvm install-latest-npm

npm install

git config --global user.email "mediadsk@uga.edu"
git config --global user.name "Media Desk"