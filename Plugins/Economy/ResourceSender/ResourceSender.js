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
			Log("In marketplace on Send resources tab. Checking for send request...");

			var query = ParseQuery(ActivePageQuery);
			var resourceValues = query.resourceSend;
			if (!resourceValues) {
				Log("Nothing to send", "ResourceSender");
				return;
			}

			DLog("Appending send resource value...");
			var values = resourceValues.split(",");
			$("#send_select input[id*='r']").each(function(index) {
				$(this).val(values[index].replace("-", ""));
			});

			Log("Send request processed.");
		}

		// Process all show costs containers
		if (ActiveProfile.Villages.length > 1) {
			$(".showCosts").each(function () {
				// Check if there is any negative costs in current container
				if ($(".ResourceCalculatorBuildCost.negative", $(this)).length && !$(".ResourceCalculatorBuildCost.upgradeStorage", $(this)).length) {
					// Retrieve costs
					var costs = $(".ResourceCalculatorBuildCost", $(this));
					var r1 = parseInt($(costs[0]).text().replace("(", ""), 10) || 0;
					var r2 = parseInt($(costs[1]).text().replace("(", ""), 10) || 0;
					var r3 = parseInt($(costs[2]).text().replace("(", ""), 10) || 0;
					var r4 = parseInt($(costs[3]).text().replace("(", ""), 10) || 0;

					$(this).append("<br/><div>You can send missing resources from another village:</div>");
					FillVillagesList($(this));
					AddSendButton($(this), "Send from this village",
						r1 < 0 ? r1 : 0,
						r2 < 0 ? r2 : 0,
						r3 < 0 ? r3 : 0,
						r4 < 0 ? r4 : 0);
					$(this).append("<br/><br/>");
				}
			});
		}

		if (!IsDevelopmentMode) {
			// Google analytics
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-33221456-3']);
			_gaq.push(['_trackEvent', 'Plugin', 'Economy/ResourceSender']);

			(function () {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = 'https://ssl.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		}
	};

	var GetMarketplaceLink = function(villageId, amountR1, amountR2, amountR3, amountR4) {
		return "http://" + ActiveServerAddress + Enums.TravianPages.Build + "?gid=17&t=5&newdid=" + villageId + "&resourceSend=" + amountR1 + "," + amountR2 + "," + amountR3 + "," + amountR4;
	};

	var AddSendButton = function(container, text, amountR1, amountR2, amountR3, amountR4) {
		/// <summary>
		/// Adds a travian like button with given link and text
		/// </summary>

		container.append($("<a>")
			.attr({
				"id": "ResourceSendSendButton" + $(".ResourceSendSendButton").length,
				"class": "ResourceSendSendButton",
				"href": "#",
				"data-r1": amountR1,
				"data-r2": amountR2,
				"data-r3": amountR3,
				"data-r4": amountR4
			})
			.css({
				"margin-left": "12px",
				"display": "none"
			})
			.html(text));
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
			console.log(current);
			console.log(value);
			selectInput.append("<option data-villageId='" + value.VID + "'>" + value.Name + "</option>");
		});

		// Update link if selection changes
		$(selectInput).change(function () {
			var selectedVillageId = $("option:selected", $(this)).data("villageid");
			var selectInputSendButtonId = $(this).data("sendbuttonid");
			var sendButton = $("#" + selectInputSendButtonId);

			var r1 = sendButton.data("r1");
			var r2 = sendButton.data("r2");
			var r3 = sendButton.data("r3");
			var r4 = sendButton.data("r4");

			var selectedVillageSendLink = GetMarketplaceLink(selectedVillageId, r1, r2, r3, r4);
			
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