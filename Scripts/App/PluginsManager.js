/******************************************************************************
 * PluginsManager.js
 *
 * Author:
 *		Aleksandar Toplek
 *
 * Created on:
 *		07.06.2012.
 *
 *****************************************************************************/

// Global list of available plugins this list is used for registering 
// all plugins so that developer doesn't have to write script path to
// a lot of places (Only in manifest.json and Development notes.txt)
//
// ADD METADATA TO THIS LIST, DO NOT ADD PLUGIN CLASS
//
var GlobalPluginsList = new Array();

function PluginsManager() {
	// TODO comment
	this.Initialize = function() {
		Log("PluginsManager: Initializing...");

		this.RegisterPlugins(GlobalPluginsList);
	};


	/**************************************************************************
	 *
	 * Registers all available plugins from
	 * the list passed
	 *
	 *************************************************************************/
	this.RegisterPlugins = function (pluginsToRegister) {
		DLog("PluginsManager: Registering [" + pluginsToRegister.length + "] plugins");

		$.each(pluginsToRegister, function (index, obj) {
			// If plugins is internal don't load it if development mode is off
			if (obj.Flags.Internal && !IsDevelopmentMode) {
				DLog("PluginsManager: Internal plugin [" + obj.Name  + "]");
				return;
			}

			try {
				registerPlugin(obj);
			}
			catch (ex) {
				Warn("An exception was throwsn while registering " + obj.Name + " plugin!");
				Error(ex);
			}
		});
	};

	function registerPlugin(pluginMetadata) {
		var activeStateRequest = new Request("Background", "Data", "IsPluginActive" + pluginMetadata.Name, { Type: "get" });

		// Send request and handle callback
		activeStateRequest.Send(
			function (response) {
				// Get default state
				var state = pluginMetadata.Default.State;

				DLog("[-------------------- BEGIN " + pluginMetadata.Name + " --------------------]");

				// Check if user login is required for current plugin
				if (pluginMetadata.Settings.IsLoginRequired && !IsLogedIn) {
					Log("User login required for " + pluginMetadata.Name, "PluginsManager");
					return;
				}

				// Check if plugins matches current page
				if (!(MatchPages(pluginMetadata.Settings.RunOnPages) && MatchQuery(pluginMetadata.Settings.RunOnPageQuery))) {
					Log("Page doesn't match for " + pluginMetadata.Name, "PluginsManager");
					return;
				}

				// Check if page contains all required elements
				for (var index = 0, cache = pluginMetadata.Settings.PageMustContain.length; index < cache; index++) {
					if (!$(pluginMetadata.Settings.PageMustContain[index]).length) {
						Log("Page doesn't contain needed elements for " + pluginMetadata.Name, "PluginsManager");
						DLog("Page doesn't containe element \"" + pluginMetadata.Settings.PageMustContain[index] + "\"", "PluginsManager");
						return;
					}
				}

				// Check if plugin has state or default state is 'On'
				if ((response == null || !response.State) && state == "On" || response.State == "On") {
					Log("PluginsManager: Plugin '" + pluginMetadata.Name + "' is active...");
					Log("PluginsManager: Registering '" + pluginMetadata.Name + "'");

					var pluginObject = new pluginMetadata.Class();
					pluginObject.Register();
				}
				else Log("PluginsManager: Plugin '" + pluginMetadata.Name + "' is NOT active!");

				Log("Plugin " + pluginMetadata.Name + " loaded successfully!", "PluginsManager");
			}
		);
	};
}