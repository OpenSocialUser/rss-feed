var isOwner = false;

function toJSON(obj) { 
	return gadgets.json.stringify(obj); 
}

function toObject(str) {
    return gadgets.json.parse(str);
}

function changeRSSLink(){
	var state = wave.getState();

	var rssLink = document.getElementById('link_to_rss').value;
    var entries_to_display = parseInt(document.getElementById('entries_to_display').value);

	if (rssLink != null && rssLink != "") {
        if (entries_to_display != null && entries_to_display >= 1 && entries_to_display <= 25) {
            document.getElementById('entries_to_display').value = '';
            state.submitDelta({'entries_to_display' : entries_to_display});
        } else {
            document.getElementById('entries_to_display').value = '';
            state.submitDelta({'entries_to_display' : 3});
        }
		document.getElementById('link_to_rss').value = '';
		state.submitDelta({'rss_link' : rssLink});
		requestRSS(rssLink);
	}
}

function requestRSS(rss_url, number) {    
    var opt_params = {};  
    opt_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.FEED;
    opt_params[gadgets.io.RequestParameters.NUM_ENTRIES] = number; 
    opt_params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 3600; 

    gadgets.io.makeRequest(rss_url, handleResponse, opt_params);
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

function checkIfOwner() {
    var userId = null;
    var ownerId = null;

    osapi.people.getViewer().execute(function(data) {
        userId = data.id;
        osapi.people.getOwner().execute(function(data) {
            ownerId = data.id;
            if (ownerId != null && userId != null && ownerId == userId) {
                isOwner = true;
            } else {
                isOwner = false;
            }
        });
    });
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
        childElements[i].removeAttribute("onclick");
        childElements[i].removeAttribute("onload");
        childElements[i].removeAttribute("onchange");

        // a bit more inline js to remove
        childElements[i].removeAttribute("onmousedown");
        childElements[i].removeAttribute("onmouseenter");
        childElements[i].removeAttribute("onmouseleave");
        childElements[i].removeAttribute("onmousemove");
        childElements[i].removeAttribute("onmouseover");
        childElements[i].removeAttribute("onmouseout");
        childElements[i].removeAttribute("onmouseup");
        childElements[i].removeAttribute("oncontextmenu");
        childElements[i].removeAttribute("ondblclick");
        childElements[i].removeAttribute("onkeydown");
        childElements[i].removeAttribute("onkeypress");
        childElements[i].removeAttribute("onkeyup");
        childElements[i].removeAttribute("onabort");
        childElements[i].removeAttribute("onbeforeunload");
        childElements[i].removeAttribute("onerror");
        childElements[i].removeAttribute("onhashchange");
        childElements[i].removeAttribute("onload");
        childElements[i].removeAttribute("onpageshow");
        childElements[i].removeAttribute("onpagehide");
        childElements[i].removeAttribute("onresize");
        childElements[i].removeAttribute("onscroll");
        childElements[i].removeAttribute("onunload");
        childElements[i].removeAttribute("onblur");
        childElements[i].removeAttribute("onchange");
        childElements[i].removeAttribute("onfocus");
        childElements[i].removeAttribute("onfocusin");
        childElements[i].removeAttribute("onfocusout");
        childElements[i].removeAttribute("oninput");
        childElements[i].removeAttribute("oninvalid");
        childElements[i].removeAttribute("onreset");
        childElements[i].removeAttribute("onsearch");
        childElements[i].removeAttribute("onselect");
        childElements[i].removeAttribute("onsubmit");
        childElements[i].removeAttribute("ondrag");
        childElements[i].removeAttribute("ondragend");
        childElements[i].removeAttribute("ondragenter");
        childElements[i].removeAttribute("ondragleave");
        childElements[i].removeAttribute("ondragover");
        childElements[i].removeAttribute("ondragstart");
        childElements[i].removeAttribute("ondrop");
        childElements[i].removeAttribute("oncopy");
        childElements[i].removeAttribute("oncut");
        childElements[i].removeAttribute("onpaste");
        childElements[i].removeAttribute("onafterprint");
        childElements[i].removeAttribute("onbeforeprint");
        childElements[i].removeAttribute("onmessage");
        childElements[i].removeAttribute("onopen");
        childElements[i].removeAttribute("onwheel");
        childElements[i].removeAttribute("ontoggle");
        childElements[i].removeAttribute("onshow");
        childElements[i].removeAttribute("ononline");
        childElements[i].removeAttribute("onoffline");
        childElements[i].removeAttribute("ontouchcancel");
        childElements[i].removeAttribute("ontouchend");
        childElements[i].removeAttribute("ontouchmove");
        childElements[i].removeAttribute("ontouchstart");
        childElements[i].removeAttribute("onpopstate");
        childElements[i].removeAttribute("onstorage");
        childElements[i].removeAttribute("transitionend");
        childElements[i].removeAttribute("animationend");
        childElements[i].removeAttribute("animationiteration");
        childElements[i].removeAttribute("animationstart");
        childElements[i].removeAttribute("oncanplay");
        childElements[i].removeAttribute("oncanplaythrough");
        childElements[i].removeAttribute("ondurationchange");
        childElements[i].removeAttribute("onemptied");
        childElements[i].removeAttribute("onended");
        childElements[i].removeAttribute("onloadeddata");
        childElements[i].removeAttribute("onloadedmetadata");
        childElements[i].removeAttribute("onloadstart");
        childElements[i].removeAttribute("onpause");
        childElements[i].removeAttribute("onplay");
        childElements[i].removeAttribute("onplaying");
        childElements[i].removeAttribute("onprogress");
        childElements[i].removeAttribute("onratechange");
        childElements[i].removeAttribute("onseeked");
        childElements[i].removeAttribute("onseeking");
        childElements[i].removeAttribute("onstalled");
        childElements[i].removeAttribute("onsuspend");
        childElements[i].removeAttribute("ontimeupdate");
        childElements[i].removeAttribute("onvolumechange");
        childElements[i].removeAttribute("onwaiting");
    }

    return safeDiv.innerHTML;
}

function handleResponse(obj) { 
    if (obj.rc == 400) {
        renderEditPage("Provided link is not a valid RSS Feed.");
        return;
    }

    var html = "";
    var htmlFooter = "";
    var htmlHeader = "";

    var rss = toObject(obj.text);
    rss["Entry"].forEach(function(entry){
    	html += "<div class='rssEntry'>";
    	html += "<div class='entryTitle'>" + sanitize(entry["Title"]) + "</div>";
    	var entryDate = new Date(entry["Date"]);
    	html += "<div class='entryDate'>" + normalizeDate(entryDate) + "</div>";
    	html += "<a target='_blank' class='entryLink' href='" + sanitize(entry["Link"]) + "'>" + "Browse</a>";
    	html += "</div>";
    });

    if (isOwner) {
        //htmlFooter += "<button id='editButton' onclick='renderEditPage(null)''>Edit</button>";
        htmlFooter += "<div id='editButtonIcon' onclick='renderEditPage(null)''></div>";
    }

    if (rss["Image"] != undefined && rss["Image"]["Url"] != undefined) {
        htmlHeader += "<div class='mainImageWrapper'><img class='mainImage' src='" + sanitize(rss["Image"]["Url"]) + "'></div>";
    }
    htmlHeader += "<a target='_blank' class='mainLink' href='" + sanitize(rss["Link"]) + "'>" + sanitize(rss["Title"]) + "</a>";

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;
    document.getElementById('header').innerHTML = htmlHeader;
}

function renderEditPage(errorText) {
	var state = wave.getState();
	var rssLink = state.get('rss_link');
    var entries_to_display = state.get('entries_to_display');

	var html = "";
	var htmlHeader = "";
	var htmlFooter = "";

    if (errorText != null && errorText != "") {
        html += "<p style='font-size: 14px; color: red;'>" + errorText + "</p>";
    }

	html += "<p style='font-size: 14px;'>Enter RSS feed URL:</p>";
	if (rssLink != null && rssLink != "") {
		html += "<input type='text' id='link_to_rss' value='" + rssLink + "'>";
	} else {
		html += "<input type='text' id='link_to_rss' value=''>";
	}

    html += "<p style='font-size: 14px;'>Enter number of entries to display (1-25):</p>"

    if (entries_to_display != null) {
        html += "<input type='text' id='entries_to_display' style='width: 40px;' value='" + entries_to_display + "'>";
    } else {
        html += "<input type='text' id='entries_to_display' value='3' style='width: 40px;'>";
    }

    html += "</br>";

    html += "<button id='saveButton' onclick='changeRSSLink()''>Save</button>";
    html += "<button id='cancelButton' onclick='renderRSS()''>Cancel</button>";

    html += "<p>";
    html += "Please report issues to IT direct component ";
    html += "<a target='_blank' href='https://itdirect.wdf.sap.corp/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm?saprole=ZITSERVREQU&crm-object-type=AIC_OB_INCIDENT&crm-object-action=D&PROCESS_TYPE=ZINE&CAT_ID=IMAS_JAM'>'IMAS_Jam'</a>";
    html += ", feedback to ";
    html += "<a target='_blank' href='https://jam4.sapjam.com/groups/about_page/3B960zLBubCXJjPjDT59T5'>SAP Jam Support Center</a>";
    html += ".";
    html += "</p>";

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;
    document.getElementById('header').innerHTML = htmlHeader;
}

function renderDummy() {
    var html = "";
    var htmlHeader = "";
    var htmlFooter = "";

    html += "<p style='color:red;'>Gadget has not yet been initialized with proper RSS Feed. Please contact group admin.</p>";

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;
    document.getElementById('header').innerHTML = htmlHeader;
}

function renderRSS() {
    if (!wave.getState()) {
        return;
    }
    var state = wave.getState();
    var rssLink = state.get('rss_link');
    var displayEntries = state.get('entries_to_display');

    checkIfOwner();

    if (rssLink != null && rssLink != "") {
        if (displayEntries == null) {
            displayEntries = 3;
        }
    	requestRSS(rssLink, displayEntries);
    } else {
        if (isOwner) {
    	   renderEditPage(null);
        } else {
            /*setTimeout(function(){
                if (isOwner) {
                   renderEditPage(null);
                }
            }, 2000);*/
            renderDummy();
        }
    }

    /*gadgets.window.adjustHeight();
    setTimeout(function(){
        gadgets.window.adjustHeight();
    }, 1500);*/
}

function init() {
    if (wave && wave.isInWaveContainer()) {
        wave.setStateCallback(renderRSS);

        wave.setParticipantCallback(renderRSS);
    }
}

gadgets.util.registerOnLoadHandler(init);