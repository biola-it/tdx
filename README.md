This repo contains javascript and css files used for our TDX environment. When referenced, these files load Biola's custom CSS and the search bar styling.

Adam Snell created this GitHub repo to replace the jasonbiola repo that Jason Witt created (under his own name, rather than a generic one). This ReadMe file last updated: March 6, 2025, by Adam Snell

## Custom CSS
We have created two stylesheets for customizing element styling:
- biola-stylesheet.css contains the "production" version of the stylesheet.
- biola-sandbox-stylesheet.css contains sandbox styling for testing.

## Using these JavaScript files
To add these files to TeamDynamix, use the GitHub Pages urls for the files. These URLs start with https://biola-it.github.io/TDX/, with the name of the file appended. You can copy/paste the following code into TDx:
`<script src="https://biola-id.github.io/TDX/biola-scripts.js"></script>`

### Search Bar styling
A request was made to make the in-page TDx search bar "more shiny". As a result, the `fixSearchBars()` function was added to the javascript file, which does things like make the search bars full-width, adds a highlight/frame around them, etc.
### Get Help buttons
We were asked to add a button into the top nav bar that would link to the Get Help form(s). This is handled by the `loadGetHelpButton()` function, which relies on the `buildPublicGHB()` and `buildSsoGHB()` functions.
