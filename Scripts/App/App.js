/******************************************************************************
 * App.js
 * 
 * Author:
 * 		Aleksandar Toplek,
 *
 * Created on:
 * 		25.02.2012.
 *
 ******************************************************************************/

// Google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-33221456-3']);
_gaq.push(['_trackEvent', 'App', 'Application used']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


function App() {
	/// <summary>
	/// App class
	/// This is start class for content script
	/// </summary>

	var loadNumber = 1;
	var currentLoad = 0;
	var pluginsManager = new PluginsManager();

	this.Initialize = function () {
		/// <summary>
		/// Initializes App object
		/// </summary>

		Log("App: Initialization started...");

		// Disables browser caching of ajax calls so that changes made on 
		// plugins manager page are available on next restart
		$.ajaxSetup({ cache: false });

		// TODO Remove is not needed any more (moved to contentscript.css)
		// Inject Project Axeman styles
		//var stylesheet = $("<link>");
		//stylesheet.attr("href", GetURL("Pages/PAStyle.css"));
		//stylesheet.attr("type", "text/css");
		//stylesheet.attr("rel", "stylesheet");
		//$("head").append(stylesheet);

		// Initialize Modal View
		this.InitializeModalView();
		this.isModalViewActive = false;

		// Get active page
		this.GetActivePage();

		// Initiates loading
		this.Load();

		// Send request to check if this is first play
		(new Request("Background", "Action", "IsFirstPlay")).Send();
	};

	this.Load = function () {
		/// <summary>
		/// Loads all variables needed for further initialization
		/// </summary>

		Log("App: Loading...");

		// Loading available user profiles
		LoadProfiles();
	};

	var LoadProfiles = function () {
		/// <summary>
		/// Sends request and loads available user profiles
		/// </summary>

		DLog("App: Requesting profiles list...");

		var profilesRequest = new Request("Background", "Data", "Profiles", { Type: "get" });
		profilesRequest.Send(function (response) {
			// Check if response is valid
			if (IsNullOrEmpty(response)) {
				DLog("App: No profiles found...");
				DLog("App: Creating new profiles list...");

				AvailableProfiles = new Array();
			}
			else {
				// Parse response
				AvailableProfiles = response || new Array();

				DLog("App: Recieved [" + AvailableProfiles.length + "] profile(s)");
			}

			// Calls for loading finished for this request
			CheckFinishedLoading();
		});
	};

	var CheckFinishedLoading = function () {
		/// <summary>
		/// Increments number of current loads and checks if it is equal 
		/// to needed loads, if so calls initialization finalization
		/// </summary>

		DLog("App: Loaded [" + (currentLoad + 1) + " of " + loadNumber + "]");

		if (++currentLoad >= loadNumber) {
			// If loading finished, finalize initialization
			InitializationFinalize();
		}
	};

	var InitializationFinalize = function () {
		/// <summary>
		/// Finazlizes initialization process
		/// </summary>

		Log("App: Finalizing initialization...");

		// Register plugins
		pluginsManager.Initialize();
	};

	this.GetActivePage = function () {
		/// <summary>
		/// Gets pathnames of current page and saves it to variables
		/// </summary>

		Log("App: Reading current page...");

		var currentAddress = window.location.hostname;
		var currentPath = window.location.pathname;
		var currentQuery = window.location.search;

		DLog("App: Current page address [" + currentAddress + "]");
		DLog("App: Current page pathname [" + currentPath + "]");
		DLog("App: Current page query [" + currentQuery + "]");

		ActiveServerAddress = currentAddress;
		ActivePage = GetKeyByValue(Enums.TravianPages, currentPath);
		ActivePageQuery = currentQuery;
		
		_gaq.push(['_trackEvent', 'Server', currentAddress]);
	};

	this.InitializeModalView = function () {
		/// <summary>
		/// Initializes Moval View
		/// This function will inject modalview <div> tag onto page. This will
		/// be used to slide in/out pages so that user can change settings
		/// or see some additional information.
		/// </summary>

		Log("App: Initializing ModalView");

		// Appends modal view 
		var modalViewElement = $("<div>");
		modalViewElement.attr("id", "PAModalView");
		modalViewElement.addClass("ModalView");
		$("body").append(modalViewElement);

		// Attach function to click and keyup events
		// so that we close modalview when user clicks
		// outside of modalview (on document not on modalview)
		$(document).bind('click keyup', function (e) {
			// If this is a keyup event, let's see if it's an ESC key
			if (e.type == "keyup" && e.keyCode != 27) return;

			// Make sure it's visible, and we're not modal	    
			if (app.isModalViewActive == true &&						// Check if modal is active
				e.target.className != "ModalView" &&					// Check that click target is not modal view
				$(e.target).parents().index($("#PAModalView")) < 0) {	// Check that click target are not modal view children
				app.HideModalView();
			}
		});

		Log("App: ModalView injected to the page");
	};

	this.ShowModalView = function (content) {
		/// <summary>
		/// Slides in ModalView if it is hidden and shows given content on it
		/// </summary>
		/// <param name="content">Content string</param>
		/// <returns>Returns true if modalview is successfully shown</returns>

		// Return if modelview is already active
		if (app.isModalViewActive == true) {
			DLog("App: Modal already oppened!");
			return false;
		}

		DLog("App: Opening ModalView...");

		// Changes content of modelview
		$("#PAModalView").html(content);

		// Slide modal view in
		var animationDuration = 500;
		$("#PAModalView").show("slide", { direction: "right" }, animationDuration);

		// Selay setting modal view to shown for length of animation
		setTimeout(function() {
			app.isModalViewActive = true;
			DLog("App: ModalView shown");
		}, animationDuration);
		
		return true;
	};

	this.HideModalView = function () {
		/// <summary>
		/// Slides out ModalView if it is shown
		/// </summary>
		/// <returns>Returns true if modalview is successfully hidden</returns>

		// Return if modalview is already hidden
		if (app.isModalViewActive == false) {
			DLog("App: Modal already hidden!");
			return false;
		}

		// Slide modal view away
		var animationDuration = 500;
		$("#PAModalView").hide("slide", { direction: "right" }, animationDuration);
		
		// Delay setting modal view to hidden for length of animation
		setTimeout(function() {
			app.isModalViewActive = false;
			DLog("App: ModalView hidden");
		}, animationDuration);

		return true;
	};
}