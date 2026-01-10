
# Docker Remote Access with TLS Security

## Overview

This guide explains how to securely expose the Docker daemon over the network using TLS (Transport Layer Security) for encrypted communication. By default, Docker only listens on a local Unix socket, which is secure but limits access to the same machine. To control Docker remotely, we need to expose it over TCP with TLS encryption.

## Why We Need TLS

Without TLS, exposing Docker over TCP would mean:
- **Unencrypted communication**: Anyone on the network could intercept Docker commands and see container configurations, environment variables, and sensitive data
- **No authentication**: Anyone who can reach the port could control your Docker daemon, create/destroy containers, and potentially gain root access to your server
- **Man-in-the-middle attacks**: Attackers could intercept and modify Docker commands in transit

TLS provides:
- **Encryption**: All communication is encrypted, preventing eavesdropping
- **Authentication**: Both client and server verify each other's identity using certificates
- **Integrity**: Data cannot be modified in transit without detection

## The TLS Certificate Chain

We'll create three types of certificates:

1. **Certificate Authority (CA)**: The root of trust that signs other certificates
2. **Server Certificate**: Identifies the Docker daemon (EC2 instance)
3. **Client Certificate**: Identifies the client application (your local machine)

This is called **mutual TLS (mTLS)** because both parties authenticate each other.

---

## Step 1: Generate the Certificate Authority (CA)

The CA is the foundation of your certificate infrastructure. It's used to sign and validate both server and client certificates.

### Create CA Private Key

```bash
mkdir -p ~/docker-certs
cd ~/docker-certs

openssl genrsa -out ca-key.pem 4096
```

**Command breakdown:**
- `openssl genrsa`: Generates an RSA private key
- `-out ca-key.pem`: Saves the key to this file
- `4096`: Key size in bits (larger = more secure, but slower)

**Why RSA?** RSA is a widely-supported asymmetric encryption algorithm. The private key stays secret, while the public key (embedded in certificates) can be shared.

**Why 4096 bits?** 
- 2048 bits is the current minimum standard
- 4096 bits provides extra security margin for long-lived CA certificates
- The CA key is rarely used (only for signing), so performance impact is minimal

### Create CA Certificate

```bash
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem -subj "/CN=docker-ca"
```

**Command breakdown:**
- `openssl req`: Certificate request and generation tool
- `-new`: Create a new certificate request
- `-x509`: Output a self-signed certificate instead of a request (this makes it a CA)
- `-days 365`: Certificate valid for 1 year
- `-key ca-key.pem`: Use this private key
- `-sha256`: Use SHA-256 hashing algorithm
- `-out ca.pem`: Save certificate to this file
- `-subj "/CN=docker-ca"`: Certificate subject (Common Name)

**Why SHA-256?**
- SHA-256 is a cryptographic hash function from the SHA-2 family
- It creates a unique 256-bit "fingerprint" of data
- Used here to create the certificate's digital signature
- SHA-1 is deprecated due to collision vulnerabilities
- SHA-256 is the current industry standard for certificate signatures

**Why self-signed?**
- We're creating our own CA instead of using a public one (like Let's Encrypt)
- This CA is only trusted by systems we explicitly configure
- Perfect for private infrastructure where you control both client and server

**What is CN (Common Name)?**
- Identifies the certificate holder
- For CAs, it's just a descriptive name
- For server certs, it must match the hostname/IP
- For client certs, it identifies the client

---

## Step 2: Generate Server Certificates

The server certificate identifies your Docker daemon. Clients will verify this certificate to ensure they're connecting to the legitimate server.

### Create Server Private Key

```bash
openssl genrsa -out server-key.pem 4096
```

Same as CA key generation, but this key is specifically for the server.

### Create Certificate Signing Request (CSR)

```bash
openssl req -subj "/CN=YOUR_EC2_PUBLIC_IP" -sha256 -new -key server-key.pem -out server.csr
```

**Replace `YOUR_EC2_PUBLIC_IP`** with your actual EC2 instance's public IP address.

**Command breakdown:**
- `req -new`: Create a new certificate signing request
- `-subj "/CN=YOUR_EC2_PUBLIC_IP"`: The server's identifier (MUST match how clients connect)
- `-key server-key.pem`: Use this private key
- `-out server.csr`: Output the CSR file

**What is a CSR?**
- A Certificate Signing Request is submitted to a CA for signing
- Contains the server's public key and identifying information
- The CA validates and signs it to create the final certificate

**Why use IP as CN?**
- Clients will connect using this IP address
- The CN must match the connection address for TLS validation
- If you use a domain name, put the domain in CN instead

### Configure Certificate Extensions

```bash
echo "subjectAltName = IP:YOUR_EC2_PUBLIC_IP,IP:127.0.0.1" >> extfile.cnf
echo "extendedKeyUsage = serverAuth" >> extfile.cnf
```

**Replace `YOUR_EC2_PUBLIC_IP`** with your actual IP.

**What is subjectAltName (SAN)?**
- Modern TLS requires SANs for identifying servers
- Allows multiple valid names/IPs for one certificate
- `IP:YOUR_EC2_PUBLIC_IP`: External access address
- `IP:127.0.0.1`: Local access (for testing on the server itself)

**What is extendedKeyUsage?**
- Specifies what the certificate can be used for
- `serverAuth`: This certificate is for server authentication
- Prevents misuse (e.g., using a server cert as a client cert)
- Critical for security: limits certificate scope

### Sign the Server Certificate

```bash
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out server-cert.pem -extfile extfile.cnf
```

**Command breakdown:**
- `openssl x509`: Certificate display and signing tool
- `-req`: Input is a CSR
- `-days 365`: Certificate valid for 1 year
- `-sha256`: Use SHA-256 for signature
- `-in server.csr`: The CSR to sign
- `-CA ca.pem`: Use this CA certificate
- `-CAkey ca-key.pem`: Use this CA private key to sign
- `-CAcreateserial`: Create a serial number file (tracks issued certificates)
- `-out server-cert.pem`: Output signed certificate
- `-extfile extfile.cnf`: Apply the extensions we configured

**The signing process:**
1. CA verifies the CSR's signature (proves requester has the private key)
2. CA adds its own signature using the CA private key
3. Anyone with the CA certificate (public key) can verify the signature
4. This creates a chain of trust: "CA trusts server"

---

## Step 3: Generate Client Certificates

Client certificates allow your local machine to authenticate to the Docker daemon.

### Create Client Private Key

```bash
openssl genrsa -out key.pem 4096
```

This is your client's private key. Keep it secret!

### Create Client CSR

```bash
openssl req -subj '/CN=client' -new -key key.pem -out client.csr
```

**Command breakdown:**
- `-subj '/CN=client'`: Identifies this as a client certificate
- The CN can be anything descriptive (e.g., "laptop", "ci-server")

### Configure Client Extensions

```bash
echo "extendedKeyUsage = clientAuth" > extfile-client.cnf
```

**extendedKeyUsage = clientAuth:**
- Specifies this certificate is for client authentication
- The server will verify this certificate when a client connects
- Prevents using this certificate as a server certificate

### Sign the Client Certificate

```bash
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out cert.pem -extfile extfile-client.cnf
```

Same signing process as the server certificate, but creates a client certificate with `clientAuth` usage.

---

## Step 4: Set Proper Permissions

```bash
chmod 0400 ca-key.pem key.pem server-key.pem
chmod 0444 ca.pem server-cert.pem cert.pem
```

**Permission explanation:**
- `0400` (r--------): Owner can read, nobody else can access
  - Private keys must be protected from unauthorized access
  - If someone gets your private key, they can impersonate you
- `0444` (r--r--r--): Everyone can read, nobody can write
  - Certificates are public information
  - They only contain public keys, so they're safe to share

**Security principle:** Private keys are secrets, certificates are not.

---

## Step 5: Clean Up Temporary Files

```bash
rm -v client.csr server.csr extfile.cnf extfile-client.cnf
```

These files were only needed during certificate generation and can be safely deleted.

---

## Step 6: Configure Docker Daemon

### Copy Certificates to Docker Directory

```bash
sudo mkdir -p /etc/docker/certs
sudo cp ~/docker-certs/ca.pem /etc/docker/certs/
sudo cp ~/docker-certs/server-cert.pem /etc/docker/certs/
sudo cp ~/docker-certs/server-key.pem /etc/docker/certs/
```

Docker will look in this location for its certificates.

### Create Docker Service Override

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo nano /etc/systemd/system/docker.service.d/override.conf
```

Add this configuration:

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2376 \
  --tlsverify \
  --tlscacert=/etc/docker/certs/ca.pem \
  --tlscert=/etc/docker/certs/server-cert.pem \
  --tlskey=/etc/docker/certs/server-key.pem
```

**Configuration breakdown:**
- `ExecStart=`: Clears the default ExecStart
- `ExecStart=/usr/bin/dockerd`: Starts Docker daemon
- `-H fd://`: Listen on systemd socket (for local Docker CLI)
- `-H tcp://0.0.0.0:2376`: Listen on all network interfaces, port 2376
  - `0.0.0.0` means "all IP addresses on this machine"
  - Port `2376` is the standard Docker TLS port (2375 is non-TLS)
- `--tlsverify`: Require and verify client certificates
  - Without this, TLS is used but clients aren't authenticated
  - With this, both server AND client must have valid certificates
- `--tlscacert`: CA certificate to verify client certificates against
- `--tlscert`: Server's certificate (sent to clients)
- `--tlskey`: Server's private key (kept secret, used for TLS handshake)

### Reload and Restart Docker

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**Why daemon-reload?**
- systemd caches service configurations
- `daemon-reload` tells systemd to re-read configuration files
- Required after modifying service files

### Verify Docker is Running

```bash
sudo systemctl status docker
```

Should show "active (running)" in green.

---

## Step 7: Test Connection from Server

Test the TLS connection locally on the server first:

```bash
docker --tlsverify \
  --tlscacert=~/docker-certs/ca.pem \
  --tlscert=~/docker-certs/cert.pem \
  --tlskey=~/docker-certs/key.pem \
  -H tcp://127.0.0.1:2376 ps
```

**Command breakdown:**
- `--tlsverify`: Enable TLS verification
- `--tlscacert`: CA to verify the server's certificate
- `--tlscert`: Client certificate to send to server
- `--tlskey`: Client private key
- `-H tcp://127.0.0.1:2376`: Connect to Docker on this address
- `ps`: Docker command to list containers

If this works, you should see a list of containers (or an empty list).

---

## Step 8: Configure AWS Security Group

In the AWS Console:

1. Navigate to EC2 → Security Groups
2. Select your instance's security group
3. Add inbound rule:
   - **Type**: Custom TCP
   - **Port**: 2376
   - **Source**: Your local machine's IP address (recommended) or 0.0.0.0/0 (less secure)

**Security note:** Restrict the source IP to only trusted machines. Even with TLS, limiting network access adds another security layer.

---

## Step 9: Transfer Client Certificates to Local Machine

On your EC2 instance, display the certificate contents:

```bash
cat ~/docker-certs/ca.pem
cat ~/docker-certs/cert.pem
cat ~/docker-certs/key.pem
```

Copy these to your local machine at:
- `~/.docker/ec2-certs/ca.pem`
- `~/.docker/ec2-certs/cert.pem`
- `~/.docker/ec2-certs/key.pem`

**Security reminder:** The `key.pem` file is your private key. Transfer it securely (don't paste it in Slack, email, etc.). Use SCP or secure copy-paste over SSH.

---

## Step 10: Configure Dockerode Client
```typescript
import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docker = new Docker({
  host: 'YOUR_EC2_PUBLIC_IP',  // Replace with actual IP // will be passed in env not hardcoded
  port: 2376,
  protocol: 'https',  // Important: use HTTPS for TLS
  ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
  key: fs.readFileSync(path.join(__dirname, 'key.pem'))
});

export default docker;
```

**Configuration breakdown:**
- `host`: Your EC2 instance's public IP
- `port`: 2376 (Docker TLS standard port)
- `protocol`: Must be 'https' for TLS
- `ca`: CA certificate to verify the server
- `cert`: Client certificate to send to server
- `key`: Client private key for TLS handshake

---

## The TLS Handshake Flow

When your machine connects to the remote Docker daemon, here's what happens:

### 1. TCP Connection Established
Client connects to server on port 2376.

### 2. TLS Handshake Begins

**Client Hello:**
- Client sends: supported TLS versions, cipher suites, random data
- "Hello server, I speak TLS 1.2/1.3, here are the encryption methods I support"

**Server Hello:**
- Server responds: chosen TLS version, chosen cipher suite, random data
- Sends its server certificate (signed by our CA)
- "Hello client, let's use TLS 1.3 with this cipher, here's my certificate"

### 3. Certificate Verification (Server → Client)

**Client verifies server:**
- Client checks: Is the certificate signed by a trusted CA? (our ca.pem)
- Client checks: Does the CN or SAN match the connection address?
- Client checks: Is the certificate still valid (not expired)?
- Client checks: Is the certificate intended for server authentication?

If any check fails, connection is rejected.

### 4. Certificate Verification (Client → Server)

**Client sends its certificate:**
- Client sends: client certificate and proves it has the private key
- "Here's my certificate, and here's proof I own the corresponding private key"

**Server verifies client:**
- Server checks: Is the certificate signed by the trusted CA?
- Server checks: Is the certificate still valid?
- Server checks: Is the certificate intended for client authentication?

This is the "mutual" part of mutual TLS - both sides verify each other.

### 5. Key Exchange

- Client and server use their private keys and the random data exchanged earlier
- They derive a shared "session key" using Diffie-Hellman or similar
- This session key is used for symmetric encryption (faster than asymmetric)
- Neither side can decrypt without the session key

**Why symmetric encryption for data?**
- Asymmetric encryption (RSA) is slow for large amounts of data
- After authenticating with certificates (asymmetric), they switch to symmetric
- AES or ChaCha20 encryption protects the actual data

### 6. Encrypted Communication

All Docker commands and responses are now encrypted with the session key:
- Client sends: `{"method": "POST", "path": "/containers/create", ...}`
- Encrypted with session key, sent over network
- Server decrypts with session key, processes command
- Server encrypts response, sends back
- Client decrypts response

**What attackers see:**
- Encrypted gibberish, impossible to read without the session key
- Cannot inject commands (integrity checking detects modifications)
- Cannot impersonate client or server (no valid certificates)

---

## Security Best Practices

### Certificate Rotation
- Regenerate certificates annually (or more frequently for high-security environments)
- Keep the CA private key extremely secure (consider offline storage)
- If a private key is compromised, regenerate all certificates immediately

### Network Security
- Restrict Security Group to specific IP addresses
- Consider using a VPN for additional network-level security
- Monitor Docker daemon logs for suspicious activity

### File Permissions
- Keep private keys readable only by owner (chmod 400)
- Store certificates in secure locations
- Never commit private keys to version control

### Monitoring
```bash
# Monitor Docker daemon logs
sudo journalctl -u docker.service -f

# Check active connections
sudo ss -tnp | grep 2376
```

---

## Troubleshooting

### "Connection refused"
- Check Docker is running: `sudo systemctl status docker`
- Verify port 2376 is open: `sudo netstat -tulpn | grep 2376`
- Check Security Group allows traffic

### "Certificate verification failed"
- Ensure CN/SAN matches the connection address
- Check certificates aren't expired
- Verify CA certificate matches on both sides

### "TLS handshake timeout"
- Network connectivity issue
- Firewall blocking port 2376
- Check AWS Security Group rules

### "Permission denied"
- Check file permissions on private keys (should be 400 or 600)
- Ensure Docker daemon can read certificate files

---
