import sys
import random
import os
import hashlib


def main():
    curr_path = os.path.dirname(__file__)
    # put wordlist in the same place with this script
    # change the name file if needed
    path_file = os.path.join(curr_path, '100k-most-used-passwords-NCSC.txt')
    hash_to_find = input('give the hash')
    print(path_file)
    with open('100k-most-used-passwords-NCSC.txt') as f:
        data = f.read()
        for line in data.split():
            # you can change algorithm  of hashing
            h = hashlib.sha256()
            hash = h.update(line.encode('utf-8'))
            found_hash = h.hexdigest()
            if found_hash == hash_to_find:
                print('found:', line)
                break


if __name__ == '__main__':
    main()
