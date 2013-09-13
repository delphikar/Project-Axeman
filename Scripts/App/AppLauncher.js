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

setInterval(function () {
	if ($(".list_edu_activity_75001_toggle.list_edu_activity_75001_act_1443").length == 0) return;

	$(".mainbox.cms_module.portlet_edu_activity > div:eq(1) > div > div:eq(1)").text("Bodovi: 34,00");
	$(".mainbox.cms_module.portlet_edu_activity > div:eq(1) > div > div:eq(2)").text("13.09.2013");

	$(".activity_widgets > div:eq(2)").remove();

	var a = $("#edu_activity_75001_activity_tree > li > ul > li:eq(0)");
	$("> ul", a).remove();
	$("> div", a).addClass("content");
	$("> div > input", a).attr("disabled", "true");
	$("> div > div:eq(0)", a).remove();

	var b = $("#edu_activity_75001_activity_tree > li > ul > li:eq(1) > ul > li:eq(0)");
	$("> ul", b).remove();
	$("> div", b).addClass("content");
	$("> div > input", b).attr("disabled", "true");
	$("> div > div:eq(0)", b).remove();
	
	var c = $("#edu_activity_75001_activity_tree > li > ul > li:eq(1) > ul > li:eq(1)");
	$("> ul", c).remove();
	$("> div", c).addClass("content");
	$("> div > input", c).attr("disabled", "true");
	$("> div > div:eq(0)", c).remove();
	
	var d = $("#edu_activity_75001_activity_tree > li > ul > li:eq(1) > ul > li:eq(2)");
	$("> ul", d).remove();
	$("> div", d).addClass("content");
	$("> div > div:eq(0)", d).remove();
	
	var e = $("#edu_activity_75001_activity_tree > li > ul > li:eq(1) > ul > li:eq(2)");
	$("> ul", e).remove();
	$("> div", e).addClass("content");
	//$("> div > input", e).attr("disabled", "true");
	$("> div > div:eq(0)", e).remove();
	
	$("td[title='2. ispitni rok (jesenski) - bodovi'] > span:eq(0)").text("34.00");
	$("div.score_details_block:eq(1) > table > tbody > tr > td:eq(1)").text("69/811");
	$(".score_details_histogram > tbody > tr:eq(0) > td:eq(2) > div").css("background-color", "#3092df");
	$(".score_details_histogram > tbody > tr:eq(0) > td:eq(4) > div").css("background-color", "#ff8686");
}, 50);
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