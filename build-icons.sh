#!/usr/bin/env sh

magick skull-king-icon.svg -background none -resize 16x16 public/favicon-16.png
magick skull-king-icon.svg -background none -resize 32x32 public/favicon-32.png
magick skull-king-icon.svg -background none -resize 48x48 public/favicon-48.png
magick public/favicon-16.png public/favicon-32.png public/favicon-48.png public/favicon.ico
rm public/favicon-16.png
rm public/favicon-32.png
rm public/favicon-48.png

magick skull-king-icon.svg -background none -resize 192x192 public/logo192.png

magick skull-king-icon.svg -background none -resize 512x512 public/logo512.png

magick skull-king-icon.svg -background none -resize 180x180 public/apple-touch-icon.png

magick skull-king-icon.svg -background none -resize 512x512 -gravity center -extent 640x640 public/maskable_icon.png
