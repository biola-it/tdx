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
 * Robust addStatusMenuItem:
 * - Waits for nav to exist and settle (debounced observer)
 * - Inserts exactly once (idempotent)
 * - Removes duplicate anchors that point to the same URL
 * - Inserts before Projects (id #divTDProjects) when available
 */
function addStatusMenuItem(options) {
  options = options || {};
  const url = options.url || 'https://status.biola.edu/';
  const label = options.label || 'Biola IT Status';
  const newTab = ('newTab' in options) ? !!options.newTab : true;
  const parentSelectors = ['#navContainer ul', '#ctl00_mainNav ul', '.navbar-nav'];
  const insertBeforeId = 'divTDProjects';
  const STABLE_MS = 350;      // how long DOM must be idle before inserting
  const OBS_TIMEOUT_MS = 10000; // stop observing after this many ms

  // guard to prevent multiple insertions across runs
  if (window.__biola_status_injected) {
    // console.log('addStatusMenuItem: already injected previously — skipping');
    return;
  }

  function normalizeHref(h) {
    try { return (new URL(h, location.href)).href.replace(/\/$/, ''); }
    catch (e) { return ('' + h).replace(/\/$/, ''); }
  }
  const normalizedTargetHref = normalizeHref(url);

  function findParent() {
    for (const sel of parentSelectors) {
      const p = document.querySelector(sel);
      if (p) return p;
    }
    return null;
  }

  // Remove duplicate anchors pointing to the same URL, keep first
  function dedupeExisting(parent) {
    const anchors = Array.from(parent.querySelectorAll('a'));
    const matching = anchors.filter(a => normalizeHref(a.href) === normalizedTargetHref);
    if (matching.length > 1) {
      matching.slice(1).forEach(a => {
        const li = a.closest('li');
        if (li && li.dataset && li.dataset.biolaInjected === 'true') {
          // remove clones of our item first
          li.remove();
          console.log('addStatusMenuItem: removed duplicate injected li');
        } else if (li) {
          // if another script created it, remove duplicates but keep the first one seen
          li.remove();
          console.log('addStatusMenuItem: removed duplicate existing li for', a.href);
        } else {
          a.remove();
          console.log('addStatusMenuItem: removed duplicate existing anchor for', a.href);
        }
      });
    }
  }

  function alreadyExists(parent) {
    // exists if an anchor with identical normalized href or same text exists
    return Array.from(parent.querySelectorAll('a')).some(a =>
      normalizeHref(a.href) === normalizedTargetHref || (a.textContent || '').trim() === label
    );
  }

  function createItem(parent) {
    // Try to clone a representative li to match classes/structure
    const sampleLi = parent.querySelector('li.themed') || parent.querySelector('li');
    if (sampleLi) {
      const clone = sampleLi.cloneNode(true);
      // Remove IDs to avoid duplicate IDs on page
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      // Ensure a proper anchor
      let anchor = clone.querySelector('a');
      if (!anchor) {
        anchor = document.createElement('a');
        clone.appendChild(anchor);
      }
      anchor.href = url;
      anchor.textContent = label;
      anchor.setAttribute('role', 'menuitem');
      anchor.setAttribute('aria-label', label);
      if (newTab) anchor.target = '_blank';
      else anchor.removeAttribute('target');

      // mark it so we can detect our own injection later
      clone.dataset.biolaInjected = 'true';
      return clone;
    }

    // fallback simple li/a with expected classes
    const li = document.createElement('li');
    li.className = 'themed tdbar-button-anchored';
    const a = document.createElement('a');
    a.href = url;
    a.textContent = label;
    a.setAttribute('role', 'menuitem');
    a.setAttribute('aria-label', label);
    if (newTab) a.target = '_blank';
    li.appendChild(a);
    li.dataset.biolaInjected = 'true';
    return li;
  }

  function insertOnce(parent) {
    // If exists, dedupe and exit
    if (alreadyExists(parent)) {
      console.log('addStatusMenuItem: item already exists, deduping if needed.');
      dedupeExisting(parent);
      // mark injected even if pre-existing so we don't try again
      window.__biola_status_injected = true;
      return true;
    }

    const newLi = createItem(parent);

    // Try to insert before Projects if available, otherwise append
    const beforeEl = parent.querySelector('#' + insertBeforeId);
    if (beforeEl) {
      parent.insertBefore(newLi, beforeEl);
      console.log('addStatusMenuItem: inserted before #' + insertBeforeId);
    } else {
      parent.appendChild(newLi);
      console.log('addStatusMenuItem: appended to end of nav');
    }

    // cleanup any duplicates that might exist
    dedupeExisting(parent);

    // final guard
    window.__biola_status_injected = true;
    return true;
  }

  // If parent exists now, attempt immediate insertion
  const nowParent = findParent();
  if (nowParent) {
    insertOnce(nowParent);
    return;
  }

  // Otherwise observe the DOM until parent appears and is stable
  let stabilityTimer = null;
  let observer = null;
  let timedOut = false;

  function startObserving() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      const p = findParent();
      if (!p) return; // keep waiting for nav to appear
      // reset stability timer when mutations occur
      if (stabilityTimer) clearTimeout(stabilityTimer);
      stabilityTimer = setTimeout(() => {
        try {
          if (!window.__biola_status_injected) insertOnce(p);
        } catch (e) { console.warn('addStatusMenuItem: insert failed', e); }
        try { observer.disconnect(); } catch (e) {}
      }, STABLE_MS);
    });

    try {
      observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
      // safety timeout — stop observing after OBS_TIMEOUT_MS
      setTimeout(() => {
        timedOut = true;
        try { if (observer) observer.disconnect(); } catch (e) {}
        const p = findParent();
        if (p && !window.__biola_status_injected) {
          // last-ditch attempt
          try { insertOnce(p); } catch(e){ console.warn('addStatusMenuItem: final insert failed', e); }
        }
      }, OBS_TIMEOUT_MS);
    } catch (err) {
      // If MutationObserver fails for some reason, fallback to simple polling
      console.warn('addStatusMenuItem: MutationObserver failed, falling back to polling', err);
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        const p = findParent();
        if (p) {
          clearInterval(poll);
          try { insertOnce(p); } catch(e){ console.warn('addStatusMenuItem: poll insert failed', e); }
        }
        if (attempts > 50) clearInterval(poll);
      }, 200);
    }
  }

  startObserving();
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
