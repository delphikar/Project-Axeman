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

var backgroundScript = new BackgroundScript();
backgroundScript.Initialize();

/// <summary>
/// Background scipt is class that has all chrome.* permissions and can do actions that contentscript can't
/// </summary>
function BackgroundScript() {
	var Settings = {
		TravianURLMatchesKey: "PATravianServerMatches"
	};

	var Default = {
		TravianULRMatches: [
			"http://*.travian.ae/*",
			"http://*.travian.asia/*",
			"http://*.travian.com.au/*",
			"http://*.travian.ba/*",
			"http://*.travian.bg/*",
			"http://*.travian.com.br/*",
			"http://*.travian.cl/*",
			"http://*.travian.cc/*",
			"http://*.travian.cz/*",
			"http://*.travian.de/*",
			"http://*.travian.dk/*",
			"http://*.travian.co.ee/*",
			"http://*.travian.com.eg/*",
			"http://*.travian.com/*",
			"http://*.travian.net/*",
			"http://*.travian.fi/*",
			"http://*.travian.fr/*",
			"http://*.travian.gr/*",
			"http://*.travianteam.com/*",
			"http://*.travian.hk/*",
			"http://*.travian.com.hr/*",
			"http://*.travian.hu/*",
			"http://*.travian.co.id/*",
			"http://*.travian.co.il/*",
			"http://*.travian.in/*",
			"http://*.travian.ir/*",
			"http://*.travian.it/*",
			"http://*.travian.jp/*",
			"http://*.travian.kr/*",
			"http://*.travian.lt/*",
			"http://*.travian.lv/*",
			"http://*.travian.ma/*",
			"http://*.travian.com.my/*",
			"http://*.travian.nl/*",
			"http://*.travian.no/*",
			"http://*.travian.ph/*",
			"http://*.travian.pk/*",
			"http://*.travian.pl/*",
			"http://*.travian.pt/*",
			"http://*.travian.ro/*",
			"http://*.travian.rs/*",
			"http://*.travian.ru/*",
			"http://*.travian.sa/*",
			"http://*.travian.se/*",
			"http://*.travian.si/*",
			"http://*.travian.sk/*",
			"http://*.travian.sy/*",
			"http://*.travian.th/*",
			"http://*.travian.tr/*",
			"http://*.travian.tw/*",
			"http://*.travian.com.ua/*",
			"http://*.travian.co.uk/*",
			"http://*.travian.us/*",
			"http://*.travian.com.vn/*",
			"http://*.travian.co.za/*"
		]
	};

	var notificationManager = new NotificationManager();
	var requestManager = new RequestManager();
	var isLocalStorageSupported = true;

	/// <summary>
	/// Initialize class variables
	/// </summary>
	this.Initialize = function () {
		// Initial setup
		InitialSetup();

		// Check if localStorage is supported
		if (typeof (localStorage) == 'undefined') {
			isLocalStorageSupported = false;
			console.error("localStorage not found! Try updating your browser!");
		}

		// Attach listener to all request signs
		requestManager.Recieve("*", GotRequest);


		if (!IsDevelopmentMode) {
			// Google analytics
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-33221456-3']);
			_gaq.push(['_trackPageview']);

			(function () {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = 'https://ssl.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		}
	};

	var InitialSetup = function () {
		/// <summary>
		/// Sets all data and settings to default if not already set
		/// </summary>

		// Set travian url matches to default
		if (!GetObject(Settings.TravianURLMatchesKey))
			SetObject(Settings.TravianURLMatchesKey, Default.TravianULRMatches);
	};

	/// <summary>
	/// Handles requests for BackgroundScript
	/// </summary>
	/// <param name="request">Request object</param>
	/// <param name="sender">Sender object</param>
	/// <param name="sendResponse">sendResponse function</param>
	var GotRequest = function (request, sender, sendResponse) {
		console.log("Got request category [" + request.Category + "]");

		if (request.Sign != "Background") {
			chrome.tabs.sendMessage(sender.tab.id, request);
		} else {
			// Supports following categories
			//		Data
			//		Action
			switch (request.Category) {
				case "Data": {
					GotDataRequest(request, sendResponse);
					break;
				}
				case "Action": {
					GotActionRequest(request);
					break;
				}
				case "URLCheck": {
					GotURLCheckRequest(request, sendResponse);
					break;
				}
				default: {
					console.error("Unknown category [" + request.Category + "]");
					break;
				}
			}
		}
	};

	var GotActionRequest = function (request) {
		/// <summary>
		/// Handles action requests
		/// </summary>
		/// <param name="request">Request object</param>

		console.log("Got Action request [" + request.Name + "]");

		if (IsNullOrEmpty(request.Name)) {
			console.error("Invalid action name [" + request.Name + "]");
		}
		else if (!ActionsAvailable[request.Name]) {
			console.error("Unknown action [" + request.Name + "]");
		}
		else ActionsAvailable[request.Name]();
	};

	var GotDataRequest = function (request, sendResponse) {
		/// <summary>
		/// Handles data requests
		/// </summary>
		/// <param name="request">Request object</param>
		/// <param name="sendResponse">Response function</param>

		console.log("Got Data request [" + request.Data.Type + "]");

		if (request.Data.Type == "get") {
			sendResponse(GetObject(request.Name));
		}
		else if (request.Data.Type == "set") {
			SetObject(request.Name, request.Data.Value);
		}
		else {
			console.error("Unknown Data request Type [" + request.Data.Type + "]");
			console.error(request);
		}
	};

	var GotURLCheckRequest = function (request, sendResponse) {
		/// <summary>
		/// Handles URL check requests and checks if given url matches saved patterns
		/// </summary>
		/// <param name="request">Request object where Data is url to be matched</param>
		/// <param name="sendResponse">Response function that returns true if page is matched</param>

		console.log("Got URLCheck request [" + request.Data + "]");

		var patterns = GetObject(Settings.TravianURLMatchesKey);

		var pp = new Array();
		for (var index = 0, cache = patterns.length; index < cache; index++) {
			pp[index] = parse_match_pattern(patterns[index]);
		}
		console.log("Regexed" + pp);

		var pattern;
		var requestURL = request.Data;
		for (var index = 0, cache = patterns.length; index < cache; index++) {
			pattern = patterns[index];
			var regex = new RegExp(parse_match_pattern(pattern));
			var match = requestURL.match(regex);
			if (match) {
				console.log("Found URL match for pattern [" + pattern + "]");

				sendResponse(true);
				break;
			}
		}

		console.warn("Given URL is not on extension's white list!");
		sendResponse(false);
	};

	/// <summary>
	/// Handles IsFirstPlay action request
	/// </summary>
	var ActionIsFirstPlay = function () {
		if (!GetObject("IsFirstPlay")) {
			chrome.tabs.create({ url: GetURL("Pages/Welcome/Welcome.html") });
			SetObject("IsFirstPlay", { State: "AlreadyPlayed" });
		};
	};

	var ActionReloadExtension = function() {
		chrome.tabs.create({ url: "http://reload-extension/", active: false });
	};

	/// <summary>
	/// List of actions that can be called
	/// </summary>
	var ActionsAvailable = {
		IsFirstPlay: ActionIsFirstPlay,
		ReloadExtension: ActionReloadExtension
	};
	
	/// <summary>
	/// Sets object to localStorage as <key, value> pair
	/// This function will automatically stringify given object.
	/// </summary>
	/// <param name="key">Key object</param>
	/// <param name="value">Value object</param>
	var SetObject = function (key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			console.log("Set Data [" + key + "] Value");
			console.log(value);
		}
		catch (exception) {
			if (exception.name === 'QUOTA_EXCEEDED_ERR' ||
				exception.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
				console.error("Quota exceeded! Clear localStorage to solve problem. WARNING: Clearing localStorage will delete all user data.");
			}
			else {
				console.error("Unknown error while trying to set an item \"" + key + "\" with value: ");
				console.log(value);
			}
		}
	};

	/// <summary>
	/// Gets object from localStorage as value for given key
	/// This function will automatically parse localStorage value and return object type
	/// </summary>
	/// <param name="key">Key object</param>
	/// <returns>Object from localStorage that corresponds to given key</returns>
	var GetObject = function (key) {
		var value = localStorage.getItem(key);
		var parsedValue = value && JSON.parse(value);
		console.log("Get Data [" + key + "] Value");
		console.log(parsedValue);
		return parsedValue;
	};

	/*
	 * @param String input  A match pattern
	 * @returns  null if input is invalid
	 * @returns  String to be passed to the RegExp constructor
	 *
	 * Code from: http://stackoverflow.com/questions/12433271/can-i-allow-the-extension-user-to-choose-matching-domains*/
	function parse_match_pattern(input) {
		if (typeof input !== 'string') return null;
		var match_pattern = '(?:^'
		  , regEscape = function (s) { return s.replace(/[[^$.|?*+(){}\\]/g, '\\$&'); }
		  , result = /^(\*|https?|file|ftp|chrome-extension):\/\//.exec(input);

		// Parse scheme
		if (!result) return null;
		input = input.substr(result[0].length);
		match_pattern += result[1] === '*' ? 'https?://' : result[1] + '://';

		// Parse host if scheme is not `file`
		if (result[1] !== 'file') {
			if (!(result = /^(?:\*|(\*\.)?([^\/*]+))/.exec(input))) return null;
			input = input.substr(result[0].length);
			if (result[0] === '*') {    // host is '*'
				match_pattern += '[^/]+';
			} else {
				if (match[1]) {         // Subdomain wildcard exists
					match_pattern += '(?:[^/]+\.)?';
				}
				// Append host (escape special regex characters)
				match_pattern += regEscape(match[2]) + '/';
			}
		}
		// Add remainder (path)
		match_pattern += input.split('*').map(regEscape).join('.*');
		match_pattern += '$)';
		return match_pattern;
	};
};

// TODO: Comment function
//function GotNotificationRequest(request) {
//	console.log("Got Notification request.");

//	if (request.actionName == "Show") {
//		notificationManager.Show(request.requestData);
//	}
//}