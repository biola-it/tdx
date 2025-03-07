This repo contains javascript and css files used for our TDX environment. When referenced, these files load Biola's custom CSS and the search bar styling.

Jason Witt created this GitHub repo to house customization scripts and content. This ReadMe file last updated: August 17, 2023 by Adam Snell

## Custom CSS
We have created two stylesheets for customizing element styling:
- biola-stylesheet.css contains the "production" version of the stylesheet.
- biola-sandbox-stylesheet.css contains sandbox styling for testing.

## Using these JavaScript files
To add these files to TeamDynamix, use the GitHub Pages urls for the files. These URLs start with https://biola-it.github.io/TDX/, with the name of the file appended. You can copy/paste the following code into TDx:

`<script src="https://biola-id.github.io/TDX/biola-scripts.js"></script>

## Search Bar styling
A request was made to make the in-page TDx search bar "more shiny". As a result, the fixSearchBars () function was added to the javascript file, which does things like make the search bars full-width, adds a highlight/frame around them, etc.
