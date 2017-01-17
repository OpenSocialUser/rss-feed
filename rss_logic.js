var isOwner = null;
var isOnSave = false;

function toJSON(obj) {
    return gadgets.json.stringify(obj);
}

function toObject(str) {
    return gadgets.json.parse(str);
}

function checkIfOwner() {
    if (isOwner != null) return;

    var userId = null;
    var ownerId = null;
    osapi.people.getOwner().execute(function(data) {
        ownerId = data.id;
        osapi.people.getViewer().execute(function(data) {
            userId = data.id;
            if (ownerId != null && userId != null) {
                isOwner = (ownerId == userId);
            }
        });
    });
}

function getState() {
    var state = wave.getState();

    return {
        rssLink: state.get('rss_link'),
        displayEntries: state.get('entries_to_display')
    };
}


function normalizeDate(date) {
    var dateString = "";
    dateString += (date.getMonth() + 1).toString() + '/';
    dateString += date.getDate().toString() + '/';
    dateString += date.getFullYear().toString();
    dateString += "  ";
    if (date.getHours() < 10) {
        dateString += "0" + date.getHours().toString() + ":";
    } else {
        dateString += date.getHours().toString() + ":";
    }
    if (date.getMinutes() < 10) {
        dateString += "0" + date.getMinutes().toString();
    } else {
        dateString += date.getMinutes().toString();
    }
    return dateString;
}

function sanitize(text) {
    var safeDiv = document.createElement("div");
    safeDiv.innerHTML = text;

    var scriptElements = safeDiv.getElementsByTagName("script");
    for (var i = 0; i < scriptElements.length; i++) {
        scriptElements[i].parentNode.removeChild(scriptElements[i]);
    }

    var childElements = safeDiv.children;
    for (var i = 0; i < childElements.length; i++) {
        ["onclick","onload","onchange","onmousedown","onmouseenter","onmouseleave","onmousemove"
        ,"onmouseover","onmouseout","onmouseup","oncontextmenu","ondblclick","onkeydown"
        ,"onkeypress","onkeyup","onabort","onbeforeunload","onerror","onhashchange","onload"
        ,"onpageshow","onpagehide","onresize","onscroll","onunload","onblur","onchange","onfocus"
        ,"onfocusin","onfocusout","oninput","oninvalid","onreset","onsearch","onselect","onsubmit"
        ,"ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop"
        ,"oncopy","oncut","onpaste","onafterprint","onbeforeprint","onmessage","onopen","onwheel"
        ,"ontoggle","onshow","ononline","onoffline","ontouchcancel","ontouchend","ontouchmove"
        ,"ontouchstart","onpopstate","onstorage","transitionend","animationend"
        ,"animationiteration","animationstart","oncanplay","oncanplaythrough","ondurationchange"
        ,"onemptied","onended","onloadeddata","onloadedmetadata","onloadstart","onpause","onplay"
        ,"onplaying","onprogress","onratechange","onseeked","onseeking","onstalled","onsuspend"
        ,"ontimeupdate","onvolumechange","onwaiting"].forEach(function(event) {
            childElements[i].removeAttribute(event);
        });
    }
    return safeDiv.innerHTML;
}

var error_messages = {
    empty_input:       'Please provide a link to RSS Feed.',
    invalid_input:     'Provided link is not a valid RSS Feed.',
    expired_on_save:   'Changes cannot be saved.\nPlease reload the page and try again.',
    expired_on_cancel: 'RSS Feed cannot be rendered.\nPlease reload the page.',
    unavailable:       'The feed cannot be retrieved now.\nPlease try again later.'
}

var error_types = {
    data:    'url',
    general: 'general'
}

function handleUiErrors(type, message, clean) {
    if (type == null) type = error_types.general;
    if (clean == null) clean = true;

    var input = document.getElementById('link_to_rss');
    var urlSpan = document.getElementById('url_error');
    var generalSpan = document.getElementById('general_error');

    if (clean) {
        input.style.borderStyle='';
        input.style.borderColor = '';
        urlSpan.innerText = '';
        generalSpan.innerText = '';
    } else if (type == error_types.general) {
        generalSpan.innerText = message;
    } else {
        input.style.borderStyle='solid';
        input.style.borderColor = 'red';
        urlSpan.innerText = message;
    }
}

function renderEditButton() {
    if (!isOwner || document.getElementById('editButtonIcon') != null) return;

    var footer = document.getElementById('footer');
    var button = document.createElement('div');
    button.setAttribute('id', 'editButtonIcon');
    button.setAttribute('onclick', 'renderEditPage()');
    footer.appendChild(button);
}

function handleSaveButton(saving) {
    if (saving == null) saving = true;

    var btn = document.getElementById('saveButton');
    if (btn == null) return;

    if (saving) {
        btn.textContent = 'Saving...'
        btn.disabled = true;
    } else {
        btn.textContent = 'Save'
        btn.disabled = false;
    }
}

function checkOsApiAvailable(options, callback) {
    osapi.people.getOwner().execute(function(data) {
        if (data.id == null) {
            handleSaveButton(false);
            handleUiErrors(error_types.general, options.msg, false);
        } else {
            if (options.url != null && options.count != null) {
                callback(options.url, options.count);
            } else callback();
        }
    })
}

function cancelEdit() {
    handleUiErrors();

    var state = getState();
    if (state.rssLink != null && state.rssLink != '') {
        checkOsApiAvailable({msg: error_messages.expired_on_cancel}, insertRss);
    }
}

function requestRss(url, number, callback) {
    var opt_params = {};
    opt_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.FEED;
    opt_params[gadgets.io.RequestParameters.NUM_ENTRIES] = number;
    opt_params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 3600;

    gadgets.io.makeRequest(url, callback, opt_params);
}

function saveRss() {
    handleUiErrors();

    var rssLink = document.getElementById('link_to_rss').value;
    var entries = parseInt(document.getElementById('entries_to_display').value);

    if (rssLink == null || rssLink == '') {
        handleUiErrors(error_types.data, error_messages.empty_input, false);
    } else {
        handleSaveButton();
        checkOsApiAvailable({url: rssLink, count: entries, msg: error_messages.expired_on_save},
            function(rssLink, entries) {
                if (isNaN(entries) || entries < 1 || entries > 25) entries = 3;

                requestRss(rssLink, entries, function(obj) {
                    var message = '';
                    var type = error_types.general;
                    if (obj.rc == 200) {
                        isOnSave = true;

                        var state = wave.getState();
                        state.submitDelta({
                            'rss_link': rssLink,
                            'entries_to_display': entries
                        });
                    } else {
                        if (obj.rc == 401) {
                            message = error_messages.expired_on_save;
                        } else if (obj.rc == 408 || obj.rc >= 500) {
                            message = error_messages.unavailable;
                        } else {
                            message = error_messages.invalid_input;
                            type = error_types.data
                        }
                        handleSaveButton(false);
                        handleUiErrors(type, message, false);
                    }
                });
            }
        );
    }
}

function insertRss() {
    if (document.getElementsByClassName('rssEntry').length > 0) {
        renderEditButton();
        return;
    }

    var html = "";
    var htmlFooter = "";
    var htmlHeader = "";

    var state = getState();
    requestRss(state.rssLink, state.displayEntries, function(obj){
        if (obj.rc == 200) {
            var rss = toObject(obj.text);
            rss["Entry"].forEach(function(entry){
                html += "<div class='rssEntry'>";
                html += "<div class='entryTitle'>" + sanitize(entry["Title"]) + "</div>";
                var entryDate = new Date(entry["Date"]);
                html += "<div class='entryDate'>" + normalizeDate(entryDate) + "</div>";
                html += "<a target='_blank' class='entryLink' href='" + sanitize(entry["Link"]) + "'>" + "Browse</a>";
                html += "</div>";
            });

            htmlHeader += "<div class='rss-header'>";
            if (rss["Image"] != undefined && rss["Image"]["Url"] != undefined) {
                htmlHeader += "<div class='mainImageWrapper'><img class='mainImage' src='" + sanitize(rss["Image"]["Url"]) + "'></div>";
            }
            htmlHeader += "<a target='_blank' class='mainLink' href='" + sanitize(rss["Link"]) + "'>" + sanitize(rss["Title"]) + "</a>";
            htmlHeader += "</div>";

            htmlHeader += "<div style='height: 20px'></div>"

            document.getElementById('body').innerHTML = html;
            document.getElementById('footer').innerHTML = htmlFooter;
            document.getElementById('header').innerHTML = htmlHeader;

            renderEditButton();
            if (gadgets.window.getHeight() < 370) {
                gadgets.window.adjustHeight();
            } else gadgets.window.adjustHeight(370);
        } else {
            if (isOwner) renderEditPage();
        }
    })
}

function isEditPageShown() {
    return document.getElementById('saveButton') != null;
}

function renderEditPage() {
    if (isEditPageShown()) return;

    var html = '';
    var htmlHeader = '';
    var htmlFooter = '';

    html += "<p class='label'>Enter RSS feed URL:</p>";

    var rssValue = '';
    var state = getState();
    if (state.rssLink != null && state.rssLink != "") rssValue = state.rssLink;
    html += "<input type='text' id='link_to_rss' value='"+rssValue+"'>";
    html += "<span id='url_error' class='error-txt'></span>"

    html += "<p class='label'>Enter number of entries to display (1-25):</p>"

    var numValue = 3;
    if (state.displayEntries != null && state.displayEntries != '') numValue = state.displayEntries;
    html += "<input id='entries_to_display' type='number' value='"+numValue+"' min='1' max=25 style='width: 40px;'>";

    html += "<span id='general_error' class='error-txt' style='margin-top: 10px;'></span>"

    html += "<button id='saveButton' onclick='saveRss()''>Save</button>";
    html += "<button id='cancelButton' onclick='cancelEdit()''>Cancel</button>";

    html += "<p>";
    html += "Please report issues to IT direct component ";
    html += "<a target='_blank' href='https://itdirect.wdf.sap.corp/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?saprole=ZITSERVREQU&crm-object-type=AIC_OB_INCIDENT&crm-object-action=D&PROCESS_TYPE=ZINE&CAT_ID=IMAS_JAM'>'IMAS_Jam'</a>";
    html += ", provide your feedback on ";
    html += "<a target='_blank' href='https://jam4.sapjam.com/groups/about_page/3B960zLBubCXJjPjDT59T5'>SAP Jam Support Center</a>";
    html += ".";
    html += "</p>";

    htmlHeader += "<h3>Settings:</h3>";
    htmlHeader += "<div class='help'><a href='https://jam4.sapjam.com/wiki/show/4jjEQ9eoJ6z75IWQQ1DyMT' target='_blank' title='Help'><div id='help_icon'></div></a></div>";

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;
    document.getElementById('header').innerHTML = htmlHeader;

    gadgets.window.adjustHeight(370);
}

// function renderDummy() {
//     if (document.getElementById('dummy_txt') != null) return;

//     var html = "";
//     var htmlHeader = "";
//     var htmlFooter = "";

//     html += "<p id='dummy_txt' style='color:red;'>Gadget has not yet been initialized with proper RSS Feed. Please contact group admin.</p>";

//     document.getElementById('body').innerHTML = html;
//     document.getElementById('footer').innerHTML = htmlFooter;
//     document.getElementById('header').innerHTML = htmlHeader;
// }

function renderRss() {
    if (!wave.getState()) return;
    checkIfOwner();
    if (!isOnSave && isEditPageShown()) return;

    isOnSave = false;

    var state = getState();
    if (state.rssLink != null && state.rssLink != '') {
        insertRss();
    } else {
        if (isOwner) renderEditPage();
    }
}

function init() {
    if (wave && wave.isInWaveContainer()) wave.setStateCallback(renderRss);
}

gadgets.util.registerOnLoadHandler(init);
