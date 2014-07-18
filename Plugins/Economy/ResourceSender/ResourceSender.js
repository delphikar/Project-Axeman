/******************************************************************************
 * ResourceSender.js
 *
 * Author:
 * 		Aleksandar Toplek
 *
 * Collaborator:
 *		Geczy
 *
 * Donator:
 *		Geczy
 *
 * Created on:
 * 		11.07.2014.
 *
 *****************************************************************************/

function ResourceSender() {
	/// <summary>
	/// Initializes object
	/// </summary>
	this.Register = function () {
		Log("Registering ResourceSender plugin...", "ResourceSender");

		// If in marketplace at Send resource tab
		if ($(".gid17 .container.active a[href*='t=5']").length) {
			HandleMarketplaceRequest();
		}

		// Process all show costs containers
		if (ActiveProfile.Villages.length > 1) {
			BuildingsSender();
		}
	};

	var BuildingsSender = function () {
		Log("In build page. Building UI...", "ResourceSender");

		$(".showCosts").each(function(index) {
			var container = $(this);

			// Check if there is any negative costs in current container

			DLog("Creating UI elements for cost block", "ResourceSender");

			// Retrieve costs
			var rx = GetBlockResourceDifference(index);

			DLog("Got costs: " + rx[0] + ", " + rx[1] + ", " + rx[2] + ", " + rx[3], "ResourceSender");

			// Build block UI
			var block = $("<div>")
				.addClass("ResourceSenderBlock")
				.data("blockindex", index);
			block.append("<br/><div>You can send missing resources from another village:</div>");
			FillVillagesList(block);
			AddSendButton(block, index, "Send from this village", rx[0], rx[1], rx[2], rx[3]);
			if ($("[class*='ResourceCalculatorR']", container).length) {
				AttachInputChangeWatcher($("input[name*='t']", container.parent()), index);
			}
			block.append("<br/><br/>");

			// Append block to container
			container.append(block);

			// Determine whether this block need to be shown to user
			if ($(".ResourceCalculatorBuildCost.negative", container).length && !$(".ResourceCalculatorBuildCost.upgradeStorage", container).length) {
				block.show();
			} else {
				block.hide();
			}
		});
	}

	var AttachInputChangeWatcher = function(input, index) {
		$(input).on("input", function () {
			DLog("Input (" + index + ") changed...", "ResourceSender");

			var container = $(".showCosts:eq(" + index + ")");
			if ($(".ResourceCalculatorBuildCost.negative", container).length) {
				DLog("Showing troops block", "ResourceSender");

				var rx = GetBlockResourceDifference(index);
				DLog("Got costs: " + rx[0] + ", " + rx[1] + ", " + rx[2] + ", " + rx[3], "ResourceSender");

				UpdateSendButton(index, rx[0], rx[1], rx[2], rx[3]);

				$(".ResourceSenderBlock", container).show();
				$(".ResourceSendVillageNameList", container).change();
			} else {
				DLog("Hidding troops block", "ResourceSender");

				$(".ResourceSenderBlock", container).hide();
			}
		});
	}

	var GetBlockResourceDifference = function(index) {
		var container = $(".showCosts:eq(" + index + ")");
		
		var costs = $(".ResourceCalculatorBuildCost", container);
		var r1 = Math.floor(parseInt($(costs[0]).text().replace("(", "").replace(",", ""), 10) / 10) * 10 || 0;
		var r2 = Math.floor(parseInt($(costs[1]).text().replace("(", "").replace(",", ""), 10) / 10) * 10 || 0;
		var r3 = Math.floor(parseInt($(costs[2]).text().replace("(", "").replace(",", ""), 10) / 10) * 10 || 0;
		var r4 = Math.floor(parseInt($(costs[3]).text().replace("(", "").replace(",", ""), 10) / 10) * 10 || 0;

		return [r1, r2, r3, r4];
	}

	var HandleMarketplaceRequest = function() {
		Log("In marketplace on Send resources tab. Checking for send request...");

		var query = ParseQuery(ActivePageQuery);
		var resourceDestination = query.resourceDestinationId;
		var resourceValues = query.resourceSend;
		if (!resourceDestination || !resourceValues) {
			Log("No valid resource send request.", "ResourceSender");
			return;
		}

		// Retrieve destination name
		DLog("Retrieving destination village name...", "ResourceSender");
		var destinationName = "unknown";
		for (var index = 0, cache = ActiveProfile.Villages.length; index < cache; index++) {
			if (ActiveProfile.Villages[index].VID == resourceDestination) {
				destinationName = ActiveProfile.Villages[index].Name;
			}
		}
		DLog("Destination village name: " + destinationName, "ResourceSender");

		// Append resource values to textboxes
		DLog("Appending send resource value...");
		var values = resourceValues.split(",");
		$("#send_select input[id*='r']").each(function (index) {
			$(this).val(values[index].replace("-", ""));
		});

		// Append destination name to village name textbox
		$("#enterVillageName").val(destinationName);

		Log("Send request processed.");
	};

	var GetMarketplaceLink = function(villageId, receiverVillageId, amountR1, amountR2, amountR3, amountR4) {
		return "http://" + ActiveServerAddress + Enums.TravianPages.Build + "?gid=17&t=5&newdid=" + villageId + "&resourceDestinationId=" + receiverVillageId + "&resourceSend=" + amountR1 + "," + amountR2 + "," + amountR3 + "," + amountR4;
	};

	var UpdateSendButton = function (blockIndex, amountR1, amountR2, amountR3, amountR4) {
		DLog("Updating button (" + blockIndex + ") data", "ResourceSender");

		var button = $("#ResourceSendSendButton" + blockIndex);
		button.data("r1", amountR1 < 0 ? amountR1 : 0);
		button.data("r2", amountR2 < 0 ? amountR2 : 0);
		button.data("r3", amountR3 < 0 ? amountR3 : 0);
		button.data("r4", amountR4 < 0 ? amountR4 : 0);
	}

	var AddSendButton = function(container, blockIndex, text, amountR1, amountR2, amountR3, amountR4) {
		/// <summary>
		/// Adds a travian like button with given link and text
		/// </summary>

		var button = $("<a>")
			.attr({
				"id": "ResourceSendSendButton" + blockIndex,
				"class": "ResourceSendSendButton",
				"href": "#"
			})
			.css({
				"margin-left": "12px",
				"display": "none"
			})
			.html(text);
		container.append(button);

		UpdateSendButton(blockIndex, amountR1, amountR2, amountR3, amountR4);
	};

	var FillVillagesList = function (container) {
		/// <summary>
		/// Adds Select element under the village name textbox so that is
		/// simplifies sending resources to owned villages
		/// </summary>

		Log("Adding village list selector...", "ResourceSender");

		// Gets village names to array
		var villages = [];
		for (var index = 0, cache = ActiveProfile.Villages.length; index < cache; index++) {
			var obj = ActiveProfile.Villages[index];

			// Check if village is not currently active village
			if (ActiveProfile.Villages[ActiveVillageIndex].VID != obj.VID)
				villages[villages.length] = obj;
		}

		// Build dropdown selector
		var index = $(".ResourceSendVillageNameList").length;
		var selectInput = $("<select>")
			.attr({
				'id': 'ResourceSendVillageNameList' + index,
				'class': "ResourceSendVillageNameList",
				"data-sendButtonId": "ResourceSendSendButton" + index
			})
			.css({
				"width": "40%"
			});

		// TODO Localize
		selectInput.append("<option disabled selected>Select a village</option>");

		// Add village names to list
		$.each(villages, function (current, value) {
			selectInput.append("<option data-villageId='" + value.VID + "'>" + value.Name + "</option>");
		});

		// Update link if selection changes
		$(selectInput).change(function () {
			DLog("Village selection changed", "ResourceSender");

			var selectedVillageId = $("option:selected", $(this)).data("villageid");
			var selectInputSendButtonId = $(this).data("sendbuttonid");
			var sendButton = $("#" + selectInputSendButtonId);

			if (!selectedVillageId) return;

			var r1 = sendButton.data("r1");
			var r2 = sendButton.data("r2");
			var r3 = sendButton.data("r3");
			var r4 = sendButton.data("r4");

			var selectedVillageSendLink = GetMarketplaceLink(selectedVillageId, ActiveProfile.Villages[ActiveVillageIndex].VID, r1, r2, r3, r4);

			sendButton.attr("href", selectedVillageSendLink);
			sendButton.show();
		});

		// Append selector
		container.append(selectInput);

		Log("Village list selector successfully added!", "ResourceSender");
	};
}

// Metadata for this plugin (Development)
var DevelopmentMetadata = {
	Name: "ResourceSender",
	Alias: "Resource Sender",
	Category: "Economy",
	Version: "0.1.0.1",
	Description: "Sends missing resource amount from any village shortcut",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Settings: {
		RunOnPages: [Enums.TravianPages.Build],
		IsLoginRequired: true
	},

	Flags: {
		Beta: true
	},

	Class: ResourceSender
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, DevelopmentMetadata);