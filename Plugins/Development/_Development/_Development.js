/******************************************************************************
 * _Development.js
 * 
 * Author:
 * 		Aleksandar Toplek
 *
 * Created on:
 * 		08.07.2012.
 *
 *****************************************************************************/

function Development() {
	/// <summary>
	/// Initializes object 
	/// </summary>
	this.Register = function () {
		Log("Development: Registering Development plugin...");

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
		buttonSortAsc.hover(function () { $(this).css(buttonHoverStyle); }, function () { $(this).css(buttonStyle); });
		buttonSortAsc.css("background-image", "url('" + GetURL("Plugins/Development/_Development/SortAscending.png") + "')");
		
		// Sort descending button
		var buttonSortDesc = $("<div>");
		buttonSortDesc.css(buttonStyle);
		buttonSortDesc.hover(function () { $(this).css(buttonHoverStyle); }, function () { $(this).css(buttonStyle); });
		buttonSortDesc.css("background-image", "url('" + GetURL("Plugins/Development/_Development/SortDescending.png") + "')");
		
		// Sort hiarachical button
		var buttonSortHia = $("<div>");
		buttonSortHia.css(buttonStyle);
		buttonSortHia.hover(function () { $(this).css(buttonHoverStyle); }, function () { $(this).css(buttonStyle); });
		buttonSortHia.css({
			"padding-left": "14px",
			"background-image": "url('" + GetURL("Plugins/Development/_Development/SortHierarchical.png") + "')"
		});
		
		// Append buttons to list
		villageListHead.append(buttonSortHia);
		villageListHead.append(buttonSortDesc);
		villageListHead.append(buttonSortAsc);
	};
}

// Metadata for this plugin (Development)
var DevelopmentMetadata = {
	Name: "_Development",
	Alias: "_Development",
	Category: "Economy",
	Version: "0.0.0.1",
	Description: "Development plugin is used to test new functionality and shouldn't be used as standard plugin",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Flags: {
		Internal: true
	},

	Class: Development
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, DevelopmentMetadata);