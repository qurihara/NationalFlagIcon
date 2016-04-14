#!/bin/sh

# get public domain flag images from wilipedia
mkdir flags_raw
cd flags_raw
wget -l 1 -r -Apng -H  "https://en.wikipedia.org/wiki/Gallery_of_sovereign_state_flags"

#フォルダ構造ができちゃったので、画像だけまとめて抽出。
mkdir ../flags
find . -name \*Flag_of_\*.png -exec cp {} ../flags/ \;
cd ..
rm -rf flags_raw

exit 0
