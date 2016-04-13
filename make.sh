#!/bin/sh

dir=$2
img=$1

# create a directory
mkdir $dir

# resize the flag images and rename them in order
mkdir $dir/flags_resized
convert flags/*.png -resize 400x400! $dir/flags_resized/resize_%04d.png

# make it an animated gif
#convert -delay 5 -loop 0 $dir/flags_resized/resize_*.png movie.gif

# resize the icon
convert $img -resize 400x400! $dir/resize_icon.png

# mix the icon and the flags
mkdir $dir/flags_resized_mixed
cd $dir/flags_resized
find . -name \*.png -exec composite -dissolve 10%x100% {} ../resize_icon.png ../flags_resized_mixed/{}  \;
cd ../..

# make it an animated gif
convert -delay 1 -loop 0 $dir/flags_resized_mixed/resize_*.png $dir/icon_movie.gif

# make it an movie
ffmpeg -r 30 -i $dir/flags_resized_mixed/resize_%4d.png -c:v libx264 -pix_fmt yuv420p -s 400x400 $dir/icon_movie.mp4

exit 0
