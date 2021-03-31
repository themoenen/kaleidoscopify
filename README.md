<!--
  Title: Kaleidoscopify
  Description: Draw something and instantly turn it into a kaleidoscope.
  Author: Moenen Erbuer (shapish)
	Contact: moenen@shapish.com
  -->

# Kaleidoscopify

## What
Draw something and instantly turn it into a kaleidoscope. A settings panel allows you to adjust the number of segments, rotation speed and a few other factors.

## How
- kaleidoscope.js renders a kaleidoscope based on an image or div content. In this case, no image is used, instead the content of a master canvas element is replicated into every segment of the kaleidoscope after you draw (mouseup event).
- smooth_draw.js allows for smooth-curve drawing, creating more pleasing shapes for the kaleidoscope.
- kaleidoscopify.js bring the two together including the pulleys and levers in the settings panel.

Written in jQuery.
