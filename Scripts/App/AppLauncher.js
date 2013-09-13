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

// NOTE: Some testing with auto-reload extension on file change
//var host = "ws://localhost:41258/";
//var ws = new WebSocket(host);
//ws.onmessage = function (e) {
//	try {
//		console.log("Got message: " + e.data);
		
//		// Send reload extension request to the background script
//		if (e.data === "reloadExtension") {
//			(new Request("Background", "Action", "ReloadExtension")).Send();
//			console.log("Requested extension reload");
//		}
//	} catch (er) {
//		console.warn(er);
//	}
//};
//ws.onopen = function(e) {
//	console.log("Socket opened to [" + host + "]");
//};
//ws.onclose = function(e) {
//	console.log("Socket closed!");
//};
//ws.onerror = function(e) {
//	console.error(e);
//};
// END TEST

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