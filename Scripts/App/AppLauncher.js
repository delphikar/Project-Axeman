/******************************************************************************
 * AppLauncher.js
 * 
 * Author:
 * 		Aleksandar Toplek,
 *
 * Created on:
 * 		25.02.2012.
 *
 *****************************************************************************/

// DO NOT USE ANY EXTENSION SCRIPT CLASSES (except App class)
// OR CREATE ANY VARIABLES IN THIS SCRIPT . THIS IS LAUNCHER!

// Start message (log) that contains
// date and extension root URL
console.log("Project Axeman Extension initialized at ");
console.log((new Date()).toString());
console.log("Extension URL [" + chrome.extension.getURL("/") + "]");
console.log("Starting App...");

// Create new App object
var app = new App();

console.log("Checking is current URL is on white list...");
(new Request("Background", "URLCheck", null, window.location.href)).Send(function (foundMatch) {
	if (foundMatch) {
		console.log("Current URL is on white list");

		// Initialize application on match
		app.Initialize();

		console.log("App started!");
	}
	else {
		console.warn("Current URL isn't on white list!");
		console.log("If Project Axeman extension should run on this page, go to extension settings and add this page to white list.");
	}
});