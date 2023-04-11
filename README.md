<!--
  Title: Kaleidoscopify
  Description: Draw something and instantly turn it into a kaleidoscope.
  Author: Moenen Erbuer (shapish)
	Contact: moenen@shapish.com
  -->

# Kaleidoscopify

_Note: This script is something I wrote back in 2016. It's a little outdated, please don't judge my code. One day I'll re-write this to be fully canvas based but hey. I have [other stuff](https://arthur.io) on my mind. <3_

## What

Draw something and instantly turn it into a kaleidoscope. A settings panel allows you to adjust the number of segments, rotation speed and a few other factors.

## Preview

This repo is also my personal website.
http://shapish.com

## How

-   kaleidoscope.js renders a kaleidoscope based on an image or div content. In this case, no image is used, instead the content of a master canvas element is replicated into every segment of the kaleidoscope after you draw (mouseup event).
-   smooth_draw.js allows for smooth-curve drawing, creating more pleasing shapes for the kaleidoscope.
-   kaleidoscopify.js bring the two together including the pulleys and levers in the settings panel.

Written in jQuery.
