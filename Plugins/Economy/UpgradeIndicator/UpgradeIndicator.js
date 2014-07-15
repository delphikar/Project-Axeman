/******************************************************************************
 * FieldUpgradeIndicator.js
 *
 * Author:
 * 		Aleksandar Toplek
 *
 * Collaborators:
 * 		Grzegorz Witczak
 *
 * Created on:
 * 		11.07.2012.
 *
 *****************************************************************************/


function UpgradeIndicator() {
	/// <summary>
	/// Initializes object
	/// </summary>
	this.Register = function () {
		// TODO Refactor
		// TODO Log

		Log("Registering UpgradeIndicator plugin...", "UpgradeIndicator");

		$("head").append(CreateStylesheet("Plugins/Economy/UpgradeIndicator/UpgradeIndicatorStyle.css"));

		// Check if we can apply states
		if (MatchPages([Enums.TravianPages.VillageOut])) FieldUpgradeIndicator();
		if (MatchPages([Enums.TravianPages.VillageIn])) BuildingUpgradeIndicator();
	};


	var FieldUpgradeIndicator = function() {
		// Get village levels map
		var villageType = ActiveProfile.Villages[ActiveVillageIndex].VillageOut.Type;
		var availableFields = Enums.VillageOutMaps[villageType];

		// Go through all available resource types
		for (var rIndex = 0, rcache = availableFields.length; rIndex < rcache; rIndex++) {
			DLog("---------" + Enums.FieldNames[rIndex] + ":" + availableFields[rIndex].length);
			// Go through all available fields for specific resource type
			for (var fIndex = 0, fcache = availableFields[rIndex].length; fIndex < fcache; fIndex++) {
				var field = $("#village_map .level:eq(" + availableFields[rIndex][fIndex] + ")");

				DLog("Index: " + availableFields[rIndex][fIndex]);

				// Check if field is under construction
				if (field.hasClass("underConstruction")) {
					SetUIElementState(field, "UnderConstruction");
					continue; // Skip to next field
				}

				var fieldUpgradeState = "Upgradeable";
				var fieldLevel = ActiveProfile.Villages[ActiveVillageIndex].VillageOut.Levels[availableFields[rIndex][fIndex]];
				var fieldMaxLevel = ActiveProfile.Villages[ActiveVillageIndex].IsMainCity ? 20 : 10;

				// Check if max upgraded
				if (fieldLevel >= fieldMaxLevel) {
					SetUIElementState(field, "MaxUpgraded");
					continue;; // Skip to next field
				}

				// Get upgrade cost for current level
				var fieldUpgradeCost = Enums.Fields[rIndex][fieldLevel];

				// Go through all resources
				for (var resource = 0; resource < 4; resource++) {
					// Get currently max storage capacity and check if we can upgrade
					var canStoreResource = ActiveProfile.Villages[ActiveVillageIndex].Resources.Storage[resource];
					if (fieldUpgradeCost[resource] > canStoreResource) {
						fieldUpgradeState = "NonUpgradeable";
						break; // Skip to next field
					}

					// Check if enough resource is stored in order to upgrade field
					var availableResource = ActiveProfile.Villages[ActiveVillageIndex].Resources.Stored[resource];
					var costDiff = availableResource - fieldUpgradeCost[resource];
					if (costDiff < 0) {
						fieldUpgradeState = "NoResources";
						// NOTE: This can't break because we have to check for
						// warehouse/granary cost difference even if we can't
						// upgrade field. Can be case where we can't upgarade
						// because of wood and we would break at first itteration
						// but field clay cost is larger than what can be store.
					}
				}

				// Set field state
				SetUIElementState(field, fieldUpgradeState);
			}
		}
	};

	var BuildingUpgradeIndicator = function() {
		// TODO Simplify - Nesting too deep

		// Get village levels map
		var villageMap = $("#village_map");
		var GIDs = Enums.VillageInGID;
		var buildings = $("img", villageMap).not(".iso, .clickareas, #lswitch, .onTop");
		buildings.each(function(index) {
			var levelObject = $("#levels div", villageMap)[index];
			if (!$(levelObject).is(".underConstruction")) {
				// Get current building level and GID
				// TODO Pull this from profile.village model
				var buildingLevel = parseInt($(levelObject).text(), 10) || 0;
				var buildingGID = $(this).attr("class").match(/g([0-9]{1,2})/)[1];
				var building = Enums.Buildings[GIDs[buildingGID]];
				var buildingUpgradeCost = building[buildingLevel];

				DLog("------" + buildingGID + ": " + GIDs[buildingGID]);

				var upgradeState = "Upgradeable";
				if (buildingLevel < building.length) {
					for (var rrIndex = 0; rrIndex < 4; rrIndex++) {
						// Check if village have warehouse/granary large enough to upgrade field
						var canStoreResource = ActiveProfile.Villages[ActiveVillageIndex].Resources.Storage[rrIndex];

						if (buildingUpgradeCost[rrIndex] > canStoreResource) {
							upgradeState = "NonUpgradeable";
							break;
						} else {
							// Check if enough resources is stored to allow upgrade
							var availableResource = ActiveProfile.Villages[ActiveVillageIndex].Resources.Stored[rrIndex];
							var costDiff = availableResource - buildingUpgradeCost[rrIndex];
							if (costDiff < 0) {
								upgradeState = "NoResources";
								// NOTE: This can't break because we have to check for
								// warehouse/granary cost difference even if we can't
								// upgrade field. Can be case where we can't upgarade
								// because of wood and we would break at first itteration
								// but field clay cost is larger than what can be store.
							}
						}

						DLog("Storage: " + canStoreResource + " Cost[" + rrIndex + "]: " + buildingUpgradeCost[rrIndex] + " for lvl." + (buildingLevel + 1));
					}
				} else {
					upgradeState = "MaxUpgraded";
				}
			} else {
				upgradeState = "UnderConstruction";
			}

			SetUIElementState(levelObject, upgradeState);
		});
	};

	var SetUIElementState = function (field, state) {
		// Apply styles
		$(field).addClass("PAUIElement " + state);
	};
};

// Metadata for this plugin (UpgradeIndicator)
var UpgradeIndicatorMetadata = {
	Name: "UpgradeIndicator",
	Alias: "Upgrade Indicator",
	Category: "Economy",
	Version: "0.2.0.16",
	Description: "Know when you can upgrade fields and building without clicking for each. This plugin will highlight upgradeable fields and buildings for you.",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Settings: {
		RunOnPages: [Enums.TravianPages.VillageIn, Enums.TravianPages.VillageOut],
		IsLoginRequired: true
	},

	Flags: {
		Beta: true
	},

	Class: UpgradeIndicator
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, UpgradeIndicatorMetadata);
