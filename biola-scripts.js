function runDelayedFunctions ()
{
    fixSearchBars ();
    linkAccordions ();
}

function runSandboxFunctions ()
{
    appendStylesheet ("biola-sandbox-stylesheet.css");
    loadFontAwesome6 ();
    setSearchbarPlaceholder ();
    window.setTimeout (loadGetHelpButton, 2000);
    //    This is just for visual confirmation of which version of the script is loading.
    console.log ("biola-scripts.js sb version 2025.03.06");
}

function runProductionFunctions ()
{
    appendStylesheet ("biola-stylesheet.css");
    loadFontAwesome6 ();
    setSearchbarPlaceholder ();
    //    This is just for visual confirmation of which version of the script is loading.
    console.log ("biola-scripts.js prod version 2025.03.06");
}

/**
* Appends the biola-stylesheet.css file to <head>
**/
function appendStylesheet (fileName)
{
  //  Define where the stylesheet is stored
  var stylesheetUrl = `https://biola-it.github.io/TDX/${fileName}`;
  
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
* This function injects a Get Help button into the top menu bar in TDX Client Portal
**/
function loadGetHelpButton ()
{
    //    Get the current address for a backlink reference
    var backlinkUrl = encodeURI (window.location.href);
    //    Create a new div to contain the button
    var containerDiv = document.createElement ("div");
    containerDiv.id="bu-get-help";
    containerDiv.style = `align-content: center; align-items: center; display: flex; flex-flow: row wrap; float: right; flex-direction: row; height: 50px; justify-content: flex-end; padding: 10px;`;
    //    inside the div, create a "button" containing a link to the form, including the backlink
    containerDiv.innerHTML = `
    <button class="btn btn-light"><a href="https://us1.teamdynamix.com/tdapp/app/form/start?c=NWE3NDc4OGMtNGQ5ZC00YTczLWFkNjUtOGNhYzk1YWRkNmMw&t=VXVwZ1RBPT1BQTZoWVlkMkdLQWVuRStpZ0pMSWhQSXcvQXFLZktPMERIRlhoa0s1NmlpcmoyZlFxR0dEM1FTK1B2Z0VBMVFJdVpGdUlzQk5MUEROSXk1ZUx1SWFVQi9vdVBBK0ZXbVFjbzgxSmhSZ3JPUWxVQ2d3c28ycEI0TDRMdkI2KzRZUQ&backlink=${backlinkUrl}">
    	Report a problem
    </a></button>`;
    //    prepend the container div into the #ct100_mainNav div
    $(`#td-navbar-collapse`).prepend (containerDiv);
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
