# The Universal Background Filter for SNS Profile Picture

A web app that creates your SNS profile picture that contains ALL the national flags in the world. No terrorism, and pray for peace.

SNSのプロフィール写真の背景に世界中のすべての国の国旗をアニメーションさせる画像を生成する、平和のためのサービス。

![example](https://github.com/qurihara/NationalFlagIcon/blob/master/example/resize_movie_icon.gif?raw=true)

ベルギーとかフランスとか特定の国に限定せず、世界中のすべての国の平和を思っているけど、それはつまりどの国もたいして思っていないのと同じである。でもテロは我々の過剰反応を得るのが目的の一つであるから、予めすべての国への配慮を表明していれば、テロに与しないという意思は表明できる・・かも。

#How to use

##Install imagemagick, wget, ffmpeg

brew install imagemagick

brew install wget

brew install ffmpeg

##Start server

npm install

node app

And access the app with your browser (default: http://localhost:3000 ).

#For your info: Download public domain flag pictures from wikipedia

sh get_flags.sh
