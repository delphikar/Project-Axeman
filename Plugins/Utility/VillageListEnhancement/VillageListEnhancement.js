/******************************************************************************
 * VillageListEnhancement.js
 * 
 * Author:
 * 		Aleksandar Toplek
 *
 * Created on:
 * 		24.11.2012.
 *
 *****************************************************************************/

// Google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-33221456-3']);
_gaq.push(['_trackEvent', 'Plugin', 'Utility/VillageListEnhancement']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


function VillageListEnhancement() {
	/// <summary>
	/// Initializes object 
	/// </summary>
	this.Register = function () {
		if (!IsLogedIn) {
			Log("VillageListEnhancement: User isn't loged in...");
			return;
		}

		Log("VillageListEnhancement: Registering VillageListEnhancement plugin...");

		// Button styles
		var buttonStyle = {
			"float": "right",
			"position": "relative",
			"top": "6px",
			"width": "22px",
			"height": "22px",
			"-webkit-filter": "grayscale(1)",
		};
		var buttonHoverStyle = {
			"-webkit-filter": "grayscale(0)",
			"cursor": "pointer"
		};
		
		// Retrieve villahe list and header
		var villageListPanel = $("#villageList");
		var villageListHead = $(".head", villageListPanel);

		// Sort ascending button
		var buttonSortAsc = $("<div>");
		buttonSortAsc.css(buttonStyle);
		buttonSortAsc.css("background-image", "url('" + GetURL("Plugins/Utility/VillageListEnhancement/SortAscending.png") + "')");
		buttonSortAsc.hover(function () { $(this).css(buttonHoverStyle); }, function () { $(this).css(buttonStyle); });
		buttonSortAsc.click(sortVillageListAscending);

		// Sort descending button
		var buttonSortDesc = $("<div>");
		buttonSortDesc.css(buttonStyle);
		buttonSortDesc.css("background-image", "url('" + GetURL("Plugins/Utility/VillageListEnhancement/SortDescending.png") + "')");
		buttonSortDesc.hover(function () { $(this).css(buttonHoverStyle); }, function () { $(this).css(buttonStyle); });
		buttonSortDesc.click(sortVillageListDescending);
		
		// Sort hiarachical button
		var buttonSortHia = $("<div>");
		buttonSortHia.css(buttonStyle);
		buttonSortHia.css({
			"padding-left": "14px",
			"background-image": "url('" + GetURL("Plugins/Utility/VillageListEnhancement/SortHierarchical.png") + "')"
		});
		buttonSortHia.hover(function () { $(this).css(buttonHoverStyle); }, function () { $(this).css(buttonStyle); });
		buttonSortHia.click(sortVillageListHiararchical);
		
		// Append buttons to list
		villageListHead.append(buttonSortHia);
		villageListHead.append(buttonSortDesc);
		villageListHead.append(buttonSortAsc);
	};
	
	// TODO Comment
	// TODO Log
	// TODO Implement
	var sortVillageListAscending = function() {

	};

	// TODO Comment
	// TODO Log
	// TODO Implement
	var sortVillageListDescending = function () {
		$.each($("#villageList #villageListLinks li"), function() {
			Warn($(this)[0]);
		});
	};
	
	// TODO Comment
	// TODO Log
	// TODO Implement
	var sortVillageListHiararchical = function() {

	};
}

// Metadata for this plugin (VillageListEnhancement)
var VillageListEnhancementMetadata = {
	Name: "VillageListEnhancement",
	Alias: "Village List Enhancement",
	Category: "Utility",
	Version: "0.0.0.1",
	Description: "TODO",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Flags: {
		Alpha: true,
		Internal: true
	},

	Class: VillageListEnhancement
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, VillageListEnhancementMetadata);