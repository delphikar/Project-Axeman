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

		$("head").append("<style type='text/css'>.ElementHighlighter{ pointer-events:visible !important; background-color: rgba(255,0,0,0.4) !important; -webkit-box-shadow: rgba(255, 0, 0, 0.8) 0px 0px 5px inset !important;cursor: crosshair !important; }</style>");

		$('html>body div, a, input, p, strong').bind('mouseover', function (e) {
			e.preventDefault();
			e.stopPropagation();
			$(e.target).addClass('ElementHighlighter');
		});
		$('html>body div, a, input, p, strong').bind('mouseout', function (e) {
			e.preventDefault();
			e.stopPropagation();
			$(e.target).removeClass('ElementHighlighter');
		});
		$('html>body div, a, input, p, strong').bind('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			console.log($(e.target));
		});
	};
}

// Metadata for this plugin (Development)
var DevelopmentMetadata = {
	Name: "_Development",
	Alias: "_Development",
	Category: "Development",
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