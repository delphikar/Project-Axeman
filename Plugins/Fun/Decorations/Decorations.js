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
	this.Register = function() {
		Log("Registering Decorations plugin...", "Decorations");

		RemoveInGameHelp();
		AllianceNumbered();

		var commaClasses = [
			".rArea",
			".carry",
			".val.lc",
		];

		for (var i in commaClasses) {
			AddCommas(commaClasses[i]);
		}
	};

	var RemoveInGameHelp = function() {
		/// <summary>
		/// Removes in game help link from every travian page.
		/// On some servers this will not remove stone and book since they are
		/// on one static image, it will only remove question mark and link.
		/// </summary>

		Log("Removing in game help...", "Decorations");
		$("#ingameManual").remove();
		Log("In game help removed!", "Decorations");
	};

	var AllianceNumbered = function() {
		if (MatchPages([Enums.TravianPages.Alliance]) && $('#member .pla').length) {
			Log("Found alliance page, lets order it", "Decorations");
			$('#member .pla').each(function(index) {
				$(this).prepend((index + 1) + '. ');
			});
		}
	};

	var AddCommas = function(commaClass) {
		if ($(commaClass).length) {
			$(commaClass).each(function(index) {
				$(this).html($(this).html().replace($(this).text(), NumberWithCommas($(this).text())));
			});
		}
	};
}

// Metadata for this plugin (Decorations)
var DecorationsMetadata = {
	Name: "Decorations",
	Alias: "Decorations",
	Category: "Fun",
	Version: "0.0.1.0",
	Description: "Removes in game help link, adds grouped numbers into statistics and numberes alliance members",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Flags: {
		Beta: true
	},

	Class: Decorations
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, DecorationsMetadata);