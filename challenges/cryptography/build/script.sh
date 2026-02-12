#!/bin/bash

path="${PWD}/text.txt"

if [[ ! -f "$path" ]]; then
    echo "Error: file does not exist at $path" >&2
    exit 1
fi

FIRST_HASH=$(cut -d " " -f1 "$path")
SECOND_HASH=$(cut -d " " -f2 "$path")
THIRD_HASH=$(cut -d " " -f3 "$path")
echo "this hash for a  weak password can you figure it out $FIRST_HASH : "
read FIRST_ANSWER
FIRST_HASH_ANSWER=$(echo -n ${FIRST_ANSWER} | openssl dgst -md5 -hex | cut -d " " -f2 )
while [[ ! "$FIRST_HASH_ANSWER" == "$FIRST_HASH" ]]; do
  echo "Wrong try again :"
  read FIRST_ANSWER
FIRST_HASH_ANSWER=$(echo -n ${FIRST_ANSWER} | openssl dgst -md5 -hex | cut -d " " -f2 )
done
echo "Good job you did it, there is  another password can you find it $SECOND_HASH :"
read SECOND_ANSWER
SECOND_HASH_ANSWER=$(echo -n ${SECOND_ANSWER} | openssl dgst -sha1 -hex | cut -d " " -f2 )
while [[ ! "$SECOND_HASH_ANSWER" == "$SECOND_HASH" ]]; do
  echo "Wrong try again :"
  read SECOND_ANSWER
SECOND_HASH_ANSWER=$(echo -n ${SECOND_ANSWER} | openssl dgst -sha1 -hex | cut -d " " -f2 )
done

echo  "Almost there last password $THIRD_HASH"
read THIRD_ANSWER
THIRD_HASH_ANSWER=$(echo -n ${THIRD_ANSWER} | openssl dgst -sha256 -hex | cut -d " " -f2 )
while [[ ! "$THIRD_HASH_ANSWER" == "$THIRD_HASH" ]]; do
  echo "Wrong try again :"
  read THIRD_ANSWER
THIRD_HASH_ANSWER=$(echo -n ${THIRD_ANSWER} | openssl dgst -sha256 -hex | cut -d " " -f2 )
done
echo "Congratulation , you made it :${FLAG:-flag{test}}"

