import hashlib
import sys

string_to_hashed = (
    "server123",
    "password123",
    "letmein"
)


def hashString():
    h1 = hashlib.md5()
    h1.update(string_to_hashed[0].encode())
    hashed1 = h1.hexdigest()
    h2 = hashlib.sha1()
    h2.update(string_to_hashed[1].encode())
    hashed2 = h2.hexdigest()
    h3 = hashlib.sha256()
    h3.update(string_to_hashed[2].encode())
    hashed3 = h3.hexdigest()
    return hashed1, hashed2, hashed3

def main():
    h1 , h2 , h3 = hashString()
    print(h1 , h2 , h3)
    sys.exit(0)
if __name__ == "__main__":
    main()
