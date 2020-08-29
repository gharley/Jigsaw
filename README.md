# Jigsaw
## A jigsaw pattern generator

This work is based on the excellent work of Manuel Kasten (Draradech), which is located here: https://gist.github.com/Draradech/35d36347312ca6d0887aa7d55f366e30

I did a huge amount of refactoring, initially to help me understand how to draw Bezier curves but then just because I couldn't resist. I would have been hard pressed and likely unmotivated to start from scratch on my own so, thanks again to Manuel. 
I have added a couple of features and changed a few things but the functionality is similar in most respects.

## New features

    Tab Offset - the default tab position is half way across the width or height of a tile, I added a slider to add an offset between 0% and 15% which is applied in a random direction.

    Randomized values for Tab Offset and Jitter. When selected the values will be randomely chosen between the minimum and maximum values.

## How to run

    The easiest way to run the app is to download all the files into a single directory and open index.html with your web browser.  Feel free to host on your own site if you like.

    Be sure to check your resulting pattern closely when applying values close to the extremes as tabs can overlap which is probably not what you want.
    