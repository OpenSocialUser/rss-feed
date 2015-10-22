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
    opt_params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 300; 

    gadgets.io.makeRequest(rss_url, handleResponse, opt_params);
}

function normalizeDate(date) {
	var dateString = "";
	dateString += (date.getMonth() + 1).toString() + '/';
	dateString += date.getDate().toString() + '/';
	dateString += date.getFullYear().toString();
	dateString += "  ";
	dateString += date.getHours().toString() + ":";
	dateString += date.getMinutes().toString();

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

function handleResponse(obj) { 
    var html = "";
    var htmlFooter = "";
    var htmlHeader = "";

    var rss = toObject(obj.text);
    rss["Entry"].forEach(function(entry){
    	html += "<div class='rssEntry'>";
    	html += "<div class='entryTitle'>" + entry["Title"] + "</div>";
    	var entryDate = new Date(entry["Date"]);
    	html += "<div class='entryDate'>" + normalizeDate(entryDate) + "</div>";
    	html += "<a target='_blank' class='entryLink' href='" + entry["Link"] + "'>" + "Browse</a>";
    	html += "</div>";
    });

    if (isOwner) {
        htmlFooter += "<button id='editButton' onclick='renderEditPage()''>Edit</button>";
    }

    htmlHeader += "<div class='mainImageWrapper'><img class='mainImage' src='" + rss["Image"]["Url"] + "'></div>";
    htmlHeader += "<a target='_blank' class='mainLink' href='" + rss["Link"] + "'>" + rss["Title"] + "</a>";

    document.getElementById('body').innerHTML = html;
    document.getElementById('footer').innerHTML = htmlFooter;
    document.getElementById('header').innerHTML = htmlHeader;
}

function renderEditPage() {
	var state = wave.getState();
	var rssLink = state.get('rss_link');
    var entries_to_display = state.get('entries_to_display');

	var html = "";
	var htmlHeader = "";
	var htmlFooter = "";

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
    	   renderEditPage();
        } else {
            setTimeout(function(){
                if (isOwner) {
                   renderEditPage();
                }
            }, 2000);
        }
    }

    gadgets.window.adjustHeight();
    setTimeout(function(){
        gadgets.window.adjustHeight();
    }, 1500);
}

function init() {
    if (wave && wave.isInWaveContainer()) {
        wave.setStateCallback(renderRSS);

        wave.setParticipantCallback(renderRSS);
    }
}

gadgets.util.registerOnLoadHandler(init);