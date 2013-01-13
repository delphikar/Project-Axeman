/******************************************************************************
 * Decorations.js
 * 
 * Author:
 * 		Aleksandar Toplek
 *
 * Created on:
 * 		13.01.2013.
 *
 *****************************************************************************/


function Decorations() {
	/// <summary>
	/// Initializes object 
	/// </summary>
	this.Register = function () {
		Log("Registering Decorations plugin...", "Decorations");

		RemoveInGameHelp();

		if (!IsDevelopmentMode) {
			// Google analytics
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-33221456-3']);
			_gaq.push(['_trackEvent', 'Plugin', 'Fun/Decorations']);

			(function () {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = 'https://ssl.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		}
	};

	var RemoveInGameHelp = function () {
		/// <summary>
		/// Removes in game help link from every travian page.
		/// On some servers this will not remove stone and book since they are
		/// on one static image, it will only remove question mark and link.
		/// </summary>

		Log("Removing in game help...", "Decorations");

		$("#ingameManual").remove();

		Log("In game help removed!", "Decorations");
	};
}

// Metadata for this plugin (Decorations)
var DecorationsMetadata = {
	Name: "Decorations",
	Alias: "Decorations",
	Category: "Fun",
	Version: "0.0.0.1",
	Description: "TODO",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Flags: {
		Alpha: true,
		Internal: true
	},

	Class: Decorations
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, DecorationsMetadata);