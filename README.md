# NationalFlagIcon
Animated national flag pictures for your SNS icon.

ベルギーとかフランスとか特定の国に限定せず、世界中のすべての国の平和を思っているけど、それはつまりどの国もたいして思っていないのと同じである。でもテロは我々の過剰反応を得るのが目的の一つであるから、予めすべての国への配慮を表明していれば、テロに与しないという意思は表明できる・・かも。

# ~/tmp/icon.jpg がアイコン
mkdir ~/tmp
cd tmp
cp [path_to_icon] ./icon.jpg

#imagemagickとwgetとffmpegをインストール
brew install imagemagick
brew install wget
brew install ffmpeg

#まずwikipediaから国旗画像をDLする。
mkdir flags
cd flags
wget -l 1 -r -Apng -H  "https://en.wikipedia.org/wiki/Gallery_of_sovereign_state_flags"

#フォルダ構造ができちゃったので、画像だけまとめて抽出。
mkdir ../flags2
find . -name \*Flag_of_\*.png -exec cp {} ../flags2/ \;

#画像をリサイズして連番をふる。
mkdir ../flags3
convert *.png -resize 400x400! ../flags3/resize_%04d.png

#gifアニメにする。
cd ../flags3
convert -delay 5 -loop 0 resize_*.png ../movie.gif

#アイコンをリサイズ
cd ~/tmp
convert icon.jpg -resize 400x400! resize_icon.png

#アイコンとブレンド
mkdir flags4
cd flags3
find . -name \*.png -exec composite -dissolve 10%x100% {} ../resize_icon.png ../flags4/{}  \;

#gifアニメにする。
cd ../flags4
convert -delay 1 -loop 0 resize_*.png ../icon_movie.gif

#動画にする。
ffmpeg -r 30 -i resize_%4d.png -c:v libx264 -pix_fmt yuv420p -s 400x400 ../icon_movie.mp4