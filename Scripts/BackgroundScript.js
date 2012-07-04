/******************************************************************************
 * BackgroundScript.js
 *
 * Author:
 *		Aleksandar Toplek
 *
 * Created on:
 *		26.02.2012.
 *
 *****************************************************************************/

 // Public Definition
var BackgroundScript = {
	"Initialize": 		Initialize
};

// Variables
notificationManager = new NotificationManager();
requestManager = new RequestManager();


// This is called since there is no launcher
// as there is for App script
BackgroundScript.Initialize();

// TODO: Comment function 
function Initialize() {
	//if (typeof(localStorage) == 'undefined') {
	//	alert('Your browser does not support HTML5 localStorage. Try upgrading.');
	//}

	// Sets sign to "Background"
	requestManager.Recieve("Background", GotRequest);
}


// TODO: Comment function
function GotRequest(request, sender, sendResponse) {
	DLog("BackgroundScript: Got request category [" + request.Category + "]");

	// Supports following categories
	//		Data
	//		Action
	switch (request.Category) {
		case "Data": { GotDataRequest(request, sendResponse); break; }
		case "Action": { GotActionRequest(request); break; }
		default:
			console.error("BackgroundScript: Unknown category!", request);
			break;
	}
}

function GotActionRequest(request) {
	DLog("BackgroundScript: Got Action request [" + request.Name + "]");

	if (request.requestName == "IsFirstPlay") {
		chrome.tabs.create({ url: GetURL("Pages/Welcome.html") }, function () { });
	}
};

// TODO: Comment function
//function GotNotificationRequest(request) {
//	DLog("BackgroundScript: Got Notification request.");

//	if (request.actionName == "Show") {
//		notificationManager.Show(request.requestData);
//	}
//}

function GotDataRequest(request, response) {
	DLog("BackgroundScript: Got Data request [" + request.Data.Type + "]");

	// On GET request
	if (request.Data.Type == "get") {
		response(GetObject(request.Name));
	}
		// ON SET request
	else if (request.Data.Type == "set") {
		SetObject(request.Name, request.Data.Value);
	}
	else {
		Error("BackgroundScript: Unknown Data request Type [" + request.Data.Type + "]");
		Error(request);
	}
}


var SetObject = function (key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		DLog("BackgroundScript: Set Data [" + key + "] Value [" + value + "]");
	}
	catch (exception) {
		if (exception.name === 'QUOTA_EXCEEDED_ERR' ||
			exception.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
			Error("BackgroundScript: Quota exceeded!");
		}
		else {
			Error("BackgroundScript: Unknown error while trying to set an item!");
		}
	}
};

var GetObject = function (key) {
	var value = localStorage.getItem(key);
	var parsedValue = value && JSON.parse(value);
	DLog("BackgroundScript: Got Data [" + key + "] Value [" + parsedValue + "]");
	return parsedValue;
};