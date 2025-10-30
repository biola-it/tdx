var publicHelpFormLink = `https://my.biola.edu/go/it/sign-in-help-form`;
var ssoHelpFormLink = `https://my.biola.edu/go/it/request-help-form`;

function runDelayedFunctions ()
{
    fixSearchBars ();
    linkAccordions ();
}

function runSandboxFunctions ()
{
    addStatusMenuItem ();
    appendStylesheet ("biola-sandbox-stylesheet.css");
    loadFontAwesome6 ();
    setSearchbarPlaceholder ();
    window.setTimeout (loadGetHelpButton, 2000);
    //    This is just for visual confirmation of which version of the script is loading.
    console.log ("biola-scripts.js sb version 2025.03.07");
}

function runProductionFunctions ()
{
    appendStylesheet ("biola-stylesheet.css");
    loadFontAwesome6 ();
    setSearchbarPlaceholder ();
    window.setTimeout (loadGetHelpButton, 2000);
    //    This is just for visual confirmation of which version of the script is loading.
    console.log ("biola-scripts.js prod version 2025.03.26");
}

/**
* Added a link to Status.biola.edu in the main menu
**/
function addStatusMenuItem () {
    // Wait until the nav is loaded in the DOM
    const nav = document.getElementById('ctl00_mainNav');
    if (!nav) return; // Exit if nav not found

    const navContainer = nav.querySelector('#navContainer > .navbar-nav');
    if (!navContainer) return; // Exit if the inner nav list isn't found

    // Create a new <li> element with the same classes as other nav items
    const newNavItem = document.createElement('li');
    newNavItem.className = 'nav-item'; // Adjust to match existing classes if needed

    // Create the <a> link element
    const link = document.createElement('a');
    link.className = 'nav-link'; // Match existing nav link styles
    link.href = 'https://status.biola.edu/';
    link.target = '_blank'; // optional: open in new tab
    link.textContent = 'Biola IT Status';

    // Append the link to the <li>, then append <li> to the nav
    newNavItem.appendChild(link);
    navContainer.appendChild(newNavItem);
}

/**
* Appends the biola-stylesheet.css file to <head>
**/
function appendStylesheet (fileName)
{
  //  Define where the stylesheet is stored
  var stylesheetUrl = `https://biola-it.github.io/tdx/${fileName}`;
  
  //  Define a new "link" element to be appended to the document head
  var stylesheetLink = document.createElement('link');
  stylesheetLink.rel  = 'stylesheet';
  stylesheetLink.type = 'text/css';
  stylesheetLink.href = stylesheetUrl;
  stylesheetLink.media = 'all';
  
  //  Get a handle on the document's head
  var head = document.getElementsByTagName('head')[0];
  //  Append the stylesheet link to the head
  head.appendChild(stylesheetLink);
}

/**
* returns the HTML for the public/non-authenticated Get Help form
**/
function buildPublicGHB ()
{
  var buttonLink = publicHelpFormLink;
  var buttonText = `Get help signing in`;
  var button = `<button class="btn btn-light">
    <a href="${buttonLink}">
    	${buttonText}
    </a>
  </button>`;

  return button;
}

/**
* returns the HTML text for the authenticated Get Help form
**/
function buildSsoGHB ()
{
//    Get the current address for a backlink reference
  var backlinkUrl = encodeURI (window.location.href);
  var buttonLink = ssoHelpFormLink;
    
  var buttonText = `Request help`;
  var button = `<button class="btn btn-light">
    <a href="${buttonLink}">
    	${buttonText}
    </a>
  </button>`;

  return button;
}

/**
* Searches the #content div for any .site-search containers,
* and restyles them to make them "more shiny"
**/
function fixSearchBars () {
    $("#content .site-search").each (function () {
        console.log (`Restyling in-page site search ${ $(this).attr("id") }`);
        $(this)
            .addClass("align-middle grid-x small-12")
            .css({
                "background-color":"#d9edf7",
                "border":"1px solid #2268ab",
                "border-radius":"10px",
                "margin":"0",
                "max-width":"100%",
                "padding":"14px"
            });
        $(this).children("*").addClass ("cell");
        $(this).find("input").addClass ("auto");
    })
}

/**
* This function finds all .accordion elements, and creates a unique link between the .accordion-trigger and .accordion-target sub-elements.
* This was created to simplify the creation of accordions in the TDx richtext editor. Without it, content creators would have to go into
* the source code and manually enter a `data-target` attribute for each accordion.
**/
function linkAccordions ()
{
    var accordions = $(".accordion");
    let i = 0;
    while (accordions.hasOwnProperty (i))
    {
        let acc = accordions[i];
        let accId = `accordion-${i}`;
        try{
            var trigger = $(acc).children(".accordion-trigger")[0];
            var target = $(acc).children(".accordion-target")[0];
            
            $(target).attr("accordion-id",accId);
            $(target).addClass (`collapse`);

            $(trigger).attr(`data-target`, `[accordion-id=${accId}]`);
            $(trigger).attr(`data-toggle`,`collapse`);
        }
        catch (err)
        {
            console.log (`unable to link accordion ${i}: ${err}`);
        }
        i++;
    }
}


/**
* Injects the Get Help button into the top menu bar in TDX Client Portal
**/
function loadGetHelpButton ()
{
    var signedInTestElt = `.settings-button`;
    var notSignedInTestElt = `div [title="Sign In"]`;
    
    //    Create a new div to contain the button
    var containerDiv = document.createElement ("div");
    //  Set the container's class
    containerDiv.class = `header-btn-container`;
    //  Set the container's ID
    containerDiv.id = "bu-get-help";
    //  Set the container's style explicitly (can be replaced soon with CSS)
    containerDiv.style = `align-content: center; align-items: center; display: flex; flex-flow: row wrap; float: right; flex-direction: row; height: 50px; justify-content: flex-end; padding: 10px;`;

    //  Depending on screen context, create a link to either the public or the SSO form, or an error
    var button;
    //  If a #btnUserProfileMenu div exists, then the user is signed in: build the SSO button
    if ( $(signedInTestElt).length > 0 )
    {
        button = buildSsoGHB ();
        $(`.req-help-button`).attr("href", ssoHelpFormLink);
    }
    //  If a div with the title "Sign In" exists, then the user is not signed in: build the public button
    else if ( $(notSignedInTestElt).length > 0 )
    {
        button = buildPublicGHB ();
        $(`.req-help-button`).attr("href", publicHelpFormLink);
    }
    //  If neither of the above is true, then something went wrong.
    else
    {
        button = "<p>SOMETHING WENT WRONG</p>";
    }

    //    inside the div, create a "button" containing a link to the form, including the backlink
    containerDiv.innerHTML = button;
    //    prepend the container div into the .navbar-header div
    $(`#navContainer>div.navbar-header`).append (containerDiv);
}


function loadFontAwesome6 ()
{
    var sTag = document.createElement ("script");
    sTag.src = `https://kit.fontawesome.com/91fb534223.js`;
    sTag.crossorigin = `anonymous`;
    var head = document.getElementsByTagName('head')[0];
    //  Append the stylesheet link to the head
    head.appendChild(sTag);
}

/**
* This function finds all #SiteSearch-text... elements within a .ModuleContent element, and sets the placeholder attribute
* to the placeholderText value defined below.
**/
function setSearchbarPlaceholder ()
{
    //    This text will be inserted as the placeholder text for the in-body searchbar
    let placeholderText = "Search for services, how-to guides, and troubleshooting tips";
    //    Load the placeholder text into all [#SiteSearch-text...] items within a .ModuleContent element
    $(`.ModuleContent [id*="SiteSearch-text"]`).attr("placeholder",placeholderText);
}

//    If the page calling this script is in sandbox, run the Sandbox scripts
if ( window.location.href.match(/sbtdclient/i) )
    runSandboxFunctions ()
//    Otherwise, run the Production scripts
else
    runProductionFunctions ()

//    Wait .5 seconds for the DOM to finish loading, before calling the rest of the initialization functions
var fsbTimeout = setTimeout(runDelayedFunctions, 1000);
