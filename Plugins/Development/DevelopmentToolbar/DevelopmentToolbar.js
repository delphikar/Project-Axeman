/******************************************************************************
 * DevelopmentToolbar.js
 * 
 * Author:
 * 		Aleksandar Toplek
 *
 * Created on:
 * 		27.02.2012.
 *
 * Notes:
 *			This plugin will enable developers to access frequently accessed
 *		development pages and give them aditional information about extension
 *		state. 
 *			This plugin will only be active when extension app is in 
 *		development mode which means that IsDevelopmentMode is set to true.
 *		This can be done by changing variable at Variables.js file.
 *
 *****************************************************************************/


/******************************************************************************
 *
 * Development toolbar that appears on bottom of the page
 *
 *****************************************************************************/
function DevelopmentToolbar() {
	//
	// Variables
	//
	var requestManager = new RequestManager();

	/**************************************************************************
	 *
	 * Registers Developer toolbar plugin
	 *
	 *************************************************************************/
	this.Register = function () {
		Log("DevelopmentToolbar: Registering DevelopmentToolbar plugin...");

		// Check if plugin can be active
		if (IsDevelopmentMode == false) {
			Log("DevelopmentToolbar: Not in development mode");
			return;
		}

		// Activate plugin message
		Log("DevelopmentToolbar: Extension is in development mode - plugin set to active.");

		// Attaches itself to request manager
		chrome.extension.onMessage.addListener(recieveConsoleRequest);

		// Creates new development toolbar source code
		var toolbar = this.GetNewToolbar(
			this.GetNewLabel("Project - Axeman").css("padding", "12px"),
			this.GetNewButton("PluginManager", GetURL("/Pages/PluginsManager/PluginsManager.html")),
			this.GetNewButton("Popup page", GetURL("/Pages/Popup.html")),
			this.GetNewButton("StorageDetails", GetURL("/Pages/StorageDetails.html")),
			this.GetNewImageButton("Console.png", function() {}).attr("id", "DTConsoleToggle").css("float", "right")
		);

		// Create stylesheet link DOM object
		var stylesheetLink = $("<link>");
		stylesheetLink.attr("href", GetURL("Plugins/Development/DevelopmentToolbar/DevelopmentToolbarStyle.css"));
		stylesheetLink.attr("type", "text/css");
		stylesheetLink.attr("rel", "stylesheet");
		
		// Create console output DOM object
		var consoleOutput = $("<div>");
		consoleOutput.attr("class", "DTConsoleOutput");
		consoleOutput.css("visibility", "hidden");
		consoleOutput.append($("<div>").attr("id", "DTConsoleOutputContainer"));
		
		// Appends style and code to current page
		$("head").append(stylesheetLink);
		$("body").append(toolbar);
		$("body").append(consoleOutput);

		// Apply click event to Console toggle button
		$("#DTConsoleToggle").click(function () {
			var console = $(".DTConsoleOutput");
			if (console.css("visibility") == "visible")
				console.css("visibility", "hidden");
			else console.css("visibility", "visible");

			$(this).attr("class", console.css("visibility") == "visible" ? "DTButtonImageToggled" : "DTButtonImage");
		});

		if (!IsDevelopmentMode) {
			// Google analytics
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-33221456-3']);
			_gaq.push(['_trackEvent', 'Plugin', 'Development/DevelopmentToolbar']);

			(function () {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = 'https://ssl.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		}
	};

	// TODO Comment
	// TODO Implement
	// TODO Log
	var recieveConsoleRequest = function (request, sender, sendRespons) {
		if (request.Sign != "ConsoleOutput") return;

		// Create and append new console element
		var style = "DTConsoleOutput" + request.Category;
		var category = request.Data.Category !== undefined ? request.Data.Category + ": " : "";
		var lineMessage = $("<div>").append(category + request.Data.Message || request.Data);
		var consoleLine = $("<div>").attr("class", style).append(lineMessage);
		$("#DTConsoleOutputContainer").append(consoleLine);

		// Scroll to last console element
		$("#DTConsoleOutputContainer").scrollTop($("#DTConsoleOutputContainer")[0].scrollHeight);
	};

	// TODO: Comment function
	this.GetNewLabel = function (content) {
		DLog("DevelopmentToolbar: Creating new label '" + content + "'");

		var label = $("<a>");
		label.attr("class", "DTLabelNormal");
		label.attr("href", "#");
		label.append(content);

		return label;
	};

	// TODO: Comment function
	this.GetNewLabelInfo = function (content) {
		DLog("DevelopmentToolbar: Creating new InfoLabel '" + content + "'");

		var label = $("<a>");
		label.attr("class", "DTLabelInfo");
		label.attr("href", "#");
		label.append(content);

		return label;
	};

	// TODO: Comment function
	this.GetNewLabelWarn = function (content) {
		DLog("DevelopmentToolbar: Creating new WarnLabel '" + content + "'");

		var label = $("<a>");
		label.attr("class", "DTLabelWarn");
		label.attr("href", "#");
		label.append(content);

		return label;
	};

	// TODO: Comment function
	this.GetNewToolbar = function () {
		DLog("DevelopmentToolbar: Creating new Toolbar with [" + arguments.length + "] components.");

		var toolbar = $("<div>");
		toolbar.attr("id", "DevelopmentToolbar");
		toolbar.attr("class", "DTBase");
		
		for (var index = 0; index < arguments.length; index++) {
			toolbar.append(arguments[index]);
		}

		return toolbar;
	};

	// TODO: Comment function
	this.GetNewButton = function (content, reference) {
		DLog("DevelopmentToolbar: Creating new Button of content '" + content + "'");

		var button = $("<a>");
		button.attr("class", "DTButton");
		button.attr("href", reference);
		button.attr("target", "_blank");
		button.append(content);

		return button;
	};

	// TODO Comment
	this.GetNewImageButton = function(content, action) {
		DLog("DevelopmentToolbar: Creating new Button of content '" + content + "'");

		var image = $("<img>");
		image.attr("src", GetURL("Plugins/Development/DevelopmentToolbar/" + content));

		var button = $("<div>");
		button.attr("class", "DTButtonImage");
		button.append(image);

		return button;
	};
}

// Metadata for this plugin (DevelopmentToolbar)
var DevelopmentToolbarMetadata = {
	Name: "DevelopmentToolbar",
	Alias: "Development Toolbar",
	Category: "Development",
	Version: "0.3.0.0",
	Description: "You can quickly access extension development pages from bottom of the page. It will even give you some additional information about script.",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Flags: {
		Beta: true,
		Internal: true
	},

	Class: DevelopmentToolbar
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, DevelopmentToolbarMetadata);