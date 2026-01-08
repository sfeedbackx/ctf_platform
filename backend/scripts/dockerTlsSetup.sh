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
    elif command_exists brew; then
        brew install "$package"
    else
        echo "❌ Unsupported package manager. Please install $package manually."
    fi
}

if [ $# -ne 2 ] ; then
    echo "usage $0 CA-IP EXT-IP"
    exit 1
fi

CA_IP=$1
EXT_IP=$2

echo "checking prerequisite"

#check docker
if ! command -v docker >/dev/null 2>&1
then
    echo "docker not found installing it"
    install_package docker
    sudo systemctl start docker 
    sudo usermod -aG docker $USER

fi

#check openssl
if ! command -v openssl >/dev/null 2>&1
then
    echo "openssl not found plz installing it"
    install_package openssl
fi

echo "starting setup the certificate"

CERT_PATH="$HOME/docker-certs"
if [ ! -d "$CERT_PATH" ]; then
    echo "creating certif dir"
    mkdir -p "$CERT_PATH"
else
    echo "certif folder exists, performing cleansing"
    find "$CERT_PATH" -mindepth 1 -exec rm -rf {} +
fi

cd "$CERT_PATH"

echo "generating CA key"
openssl genrsa -out ca-key.pem 4096

echo "generating CA certificate"
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem -subj "/CN=docker-ca"

echo "generating Server certificate"
echo "Create Server Private Key"
openssl genrsa -out server-key.pem 4096

echo "Create Certificate Signing Request"
openssl req -subj "/CN=$CA_IP" -sha256 -new -key server-key.pem -out server.csr

echo "Configure Certificate Extensions"
echo "subjectAltName = IP:$EXT_IP,IP:127.0.0.1" >> extfile.cnf
echo "extendedKeyUsage = serverAuth" >> extfile.cnf

echo "Sign the Server Certificate"
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \
    -CAcreateserial -out server-cert.pem -extfile extfile.cnf

echo "Generate Client Certificates"
echo "Create Client Private Key"
openssl genrsa -out key.pem 4096

echo "Create Client CSR"
openssl req -subj '/CN=client' -new -key key.pem -out client.csr

echo "Configure Client Extensions"
echo "extendedKeyUsage = clientAuth" > extfile-client.cnf

echo "Sign the Client Certificate"
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \
    -CAcreateserial -out cert.pem -extfile extfile-client.cnf

echo "Set Proper Permissions"
chmod 0400 ca-key.pem key.pem server-key.pem
chmod 0444 ca.pem server-cert.pem cert.pem

echo "Clean Up Temporary Files"
rm -v client.csr server.csr extfile.cnf extfile-client.cnf

DOCKER_PATH=/etc/docker/certs

echo "Configure Docker Daemon"
if [ ! -d "$DOCKER_PATH" ]; then
    echo "creating docker remote dir"
    sudo mkdir -p "$DOCKER_PATH"
else
    echo "Docker remote folder exists, performing cleansing"
    sudo find "$DOCKER_PATH" -mindepth 1 -exec rm -rf {} +
fi

sudo cp "$CERT_PATH/ca.pem" "$DOCKER_PATH"
sudo cp "$CERT_PATH/server-cert.pem" "$DOCKER_PATH"
sudo cp "$CERT_PATH/server-key.pem" "$DOCKER_PATH"

echo "Create Docker Service Override"
DOCKER_OVERRIDE_PATH="/etc/systemd/system/docker.service.d"
if [ ! -d "$DOCKER_OVERRIDE_PATH" ]; then
    echo "creating docker override dir"
    sudo mkdir -p "$DOCKER_OVERRIDE_PATH"
else
    echo "Docker override folder exists, performing cleansing"
    sudo find "$DOCKER_OVERRIDE_PATH" -mindepth 1 -exec rm -rf {} +
fi

sudo tee "$DOCKER_OVERRIDE_PATH/override.conf" > /dev/null << 'EOF'
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2376 \
    --tlsverify \
    --tlscacert=/etc/docker/certs/ca.pem \
    --tlscert=/etc/docker/certs/server-cert.pem \
    --tlskey=/etc/docker/certs/server-key.pem
EOF

echo "Reload and Restart Docker"
sudo systemctl daemon-reload
sudo systemctl restart docker

echo "Please copy the ca.pem, key.pem and cert.pem to the client to use it thanks"
sleep 5

echo "printing docker status"
sudo systemctl status docker
