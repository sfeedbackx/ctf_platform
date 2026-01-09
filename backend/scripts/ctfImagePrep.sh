## this script is specific for our use case in future will be updated to be more dynamic
#!/bin/sh

command_exists() {
    command -v "$1" >/dev/null 2>&1
}
install_package() {
    local package=$1
    if command_exists apt; then
        sudo apt install -y "$package"
    elif command_exists pacman; then
        sudo pacman -S --noconfirm "$package"
    elif command_exists dnf; then
        sudo dnf install -y "$package"
    elif command_exists yum; then
        sudo yum install -y "$package"
    elif command_exists brew; then
        brew install "$package"
    else
        echo "❌ Unsupported package manager. Please install $package manually."
    fi
}
echo "checking prequisite"

#check docker 
if ! command -v docker >/dev/null 2>&1
then
    echo "docker not  found  installing it"
    install_package docker
    sudo systemctl start docker 
    sudo usermod -aG docker $USER
fi
# check git
if ! command -v git >/dev/null 2>&1
then
    echo "Git  not found  installing it"
    install_package git
fi

echo "Passed, checking does the Ctf challenge images/network exsits"
TMP_DIR_PATH="$HOME/ctf_prep_tmp"
BACKEND_IMAGE_NAME='ctf_ssrf_race_backend'
FRONTEND_IMAGE_NAME='ctf_ssrf_race_frontend'
SSRF_GITHUB_URL="https://github.com/sfeedbackx/ssrf-race.git"

if   docker network ls  | grep -q -w 'ctf_ssrf_race' ; then
  echo 'network exsist'
else
  echo  'creating network';
  docker network create ctf_ssrf_race
fi
docker image ls  | grep -q -w $FRONTEND_IMAGE_NAME
FRONTEND_IMAGE_FOUND=$?
docker image ls  | grep -q -w $BACKEND_IMAGE_NAME
BACKEND_IMAGE_FOUND=$?

if [ "$FRONTEND_IMAGE_FOUND" -ne 0 ] || [ "$BACKEND_IMAGE_FOUND" -ne 0 ]; then
  echo "frontent or backend image missing"
  ## first check if folder exsits
  if [ ! -d "$TMP_DIR_PATH" ]; then
    echo "creating tmp dir"
    mkdir $TMP_DIR_PATH
  else
    echo "tmp folder exsits , preforming cleansing"
    find $TMP_DIR_PATH -mindepth 1 -exec rm -rf {} +
  fi
  ## preforming clone of ssrf challenge to tmp dir
  echo "cloning ssrf_challenge"
  git clone $SSRF_GITHUB_URL $TMP_DIR_PATH
if   $BACKEND_IMAGE_FOUND; then
  echo 'backend image exsist'
else
  ## we will be putting thes github repo of ctf challenge in folder called ctf_prep_tmp
  echo  'creating backend image';
  ## now we go and build the image of the backend
  cd $TMP_DIR_PATH/backend
  echo "building backend image"
  docker build -t $BACKEND_IMAGE_NAME .
  echo "finished building backend image"
fi
if   $FRONTEND_IMAGE_FOUND; then
  echo 'backend image exsist'
else
  echo  'creating frontend image';
  ## now we go and build the image of the frontend
  cd $TMP_DIR_PATH/frontend
  echo "building frontend image"
  docker build -t $FRONTEND_IMAGE_NAME .
  echo "finished building frontend image"
fi
else
  echo "image are well defined , removing tmp folder"
  rm -rf $TMP_DIR_PATH
fi



