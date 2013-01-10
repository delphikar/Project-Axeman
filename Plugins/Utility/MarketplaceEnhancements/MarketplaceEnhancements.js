/******************************************************************************
 * MarketplaceEnhancements.js
 *
 * Author:
 * 		Grzegorz Witczak
 *
 * Collaborators:
 * 		Aleksandar Toplek
 *
 * Created on:
 * 		09.12.2012.
 *
 * ToDo:
 * 		It works
 * 		Documentation, log
 * 		and other
 *
 *****************************************************************************/

function MarketplaceEnhancements() {
	var tradersAvailable;
	var traderCarryAmount;

	this.Register = function () {
		/// <summary>
		/// Initializes plugin object
		/// </summary>

		Log("Registering MarketplaceEnhancements plugin...", "MarketplaceEnhancements");

		// Inserting stylesheet
		$("head").append(CreateStylesheet("Plugins/Utility/MarketplaceEnhancements/MarketplaceEnhancementsStyle.css"));

		// Gets max carry for one trader and number of traders available
		traderCarryAmount = parseInt($(".send_res .max:eq(0) > a").text() || 0, 10);
		tradersAvailable = parseInt($("#merchantsAvailable").text(), 10) || 0;

		DLog("Trader Max Transport: " + traderCarryAmount, "MarketplaceEnhancements");
		DLog("Traders available: " + tradersAvailable, "MarketplaceEnhancements");

		// Add village selector if there are villages to send resources to
		if (ActiveProfile.Villages.length > 1) {
			FillVillagesList();
		}

		// Adds placeholder to village name textbox
		$("#enterVillageName").attr("placeholder", "Enter village name");

		// Add spinners to resources textboxes
		AddSpiners(tradersAvailable, traderCarryAmount);

		// Inserts junk resources table
		InsertJunkResourceTable();
		FillInJunkResourceTable();

		//Test Area ;)
		(function testArea() {

			//work-in-half, but rebuild
			//AddTransportShortcuts(traderCarryAmount);

			//Perhaps works, maybe not, but useful
			IncomingSum();


			var ValidateHourButton = function (hourButton) {
				var villageResources = ActiveProfile.Villages[ActiveVillageIndex].Resources;
				var productionSum = 0;

				// Chack if enough each resources is stored
				for (var index = 0; index < 4; index++) {
					var stored = villageResources.Stored[index];
					var production = villageResources.Production[index];
					var alreadySet = parseInt($("#r" + (index + 1)).val(), 10) || 0;
					if (stored < production + alreadySet) {
						DLog("No enough " + Enums.FieldNames[index] + " stored [" + stored + "] to send " + (alreadySet ? "more than" : "hour production") + " [" + (production + alreadySet) + "]", "MarketplaceEnhancements");
						hourButton.button("option", "disabled", true);
						hourButton.attr("title", useHour.attr("title") + "\nNo enough " + Enums.FieldNames[index] + " - " + (production - stored) + " more needed");
					}

					productionSum += production + alreadySet;
				}

				// Check if enough traders is available
				var canTransport = tradersAvailable * traderCarryAmount;
				if (canTransport < productionSum) {
					DLog("No enough traders to send [" + productionSum + "] resources", "MarketplaceEnhancements");
					hourButton.button("option", "disabled", true);
					hourButton.attr("title", useHour.attr("title") + "\nNo enough traders available - " + (Math.ceil(productionSum / traderCarryAmount) - tradersAvailable) + " more needed");
				}
			}

			// TODO Add second button that adds hour production from all villages
			// TODO Pun in seperate function. Looks good
			var useHour = $("<span>").text("1h").attr({
				"title": "Use this village's hour production"
			}).css({
				"margin": "0"
			}).button({
				icons: { primary: "ui-icon-plus" }
			}).click(function () {
				$.each($("#send_select input"), function (index, obj) {
					var production = ActiveProfile.Villages[ActiveVillageIndex].Resources.Production[index];
					$(obj).val($(obj).val() + production);
					$(obj).change();
				});

				ValidateHourButton($(this));
			});

			//ValidateHourButton(useHour);

			$("#send_select tr:eq(4) td").append(useHour);
			//need InsertJunkResourceTable and other ;)
		})();

		if (!IsDevelopmentMode) {
			// Google analytics
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-33221456-3']);
			_gaq.push(['_trackEvent', 'Plugin', 'Utility/MarketplaceEnhancements']);

			(function () {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = 'https://ssl.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		}
	};

	var FillVillagesList = function () {
		/// <summary>
		/// Adds Select element under the village name textbox so that is 
		/// simplifies sending resources to owned villages
		/// </summary>

		Log("Adding village list selector...", "MarketplaceEnhancements");

		// Gets village names to array
		var villages = [];
		for (var index = 0, cache = ActiveProfile.Villages.length; index < cache; index++) {
			var obj = ActiveProfile.Villages[index];

			// Check if village is not currently active village
			if (ActiveProfile.Villages[ActiveVillageIndex].VID != obj.VID)
				villages[index] = obj.Name;
		}

		// Build dropdown selector
		var selectInput = $("<select>").attr({
			'id': 'enterVillageName_list',
			'class': 'text village'
		});

		selectInput.append("<option disabled selected>Select village</option>");

		// Add village names to list
		$.each(villages, function (current, value) {
			selectInput.append("<option>" + value + "</option>");
		});

		// Append selector
		$(".compactInput").append($("<br>"));
		$(".compactInput").append(selectInput);

		// Change village needs to delete coords
		$(selectInput).change(function () {
			$("#enterVillageName").val($(this).val());
			$("#xCoordInput, #yCoordInput").val("");
		});

		//Beautify it
		$("#enterVillageName").css("width", "175px");
		$("#enterVillageName_list").css("width", "100%");

		Log("Village list selector successfully added!", "MarketplaceEnhancements");
	};

	var AddSpiners = function() {
		/// <summary>
		/// Adds spinners to resource input textboxes
		/// </summary>
		/// <param name="tradersAvailable">Number of traders available</param>
		/// <param name="traderMaxTransport">Amount of resource each trader can carry</param>

		var maxTransport = tradersAvailable * traderCarryAmount;

		// Go through all resource input textboxes
		$.each($("#r1, #r2, #r3, #r4"), function (index, obj) {
			// Get stored amount of current resource
			var stored = ActiveProfile.Villages[ActiveVillageIndex].Resources.Stored[index];
			
			// Apply spinner to current resource input textbox
			$(obj).spinner({
				incremental: true,
				step: 1,
				min: 0,
				max: stored,
				spin: function (event, ui) {
					var spinStep = 1;
					var isInc = ui.value >= $(this).val();
					var stepValue = isInc ? 1 * spinStep : -1 * spinStep;

					// On spin up, if stored value is greater than trader carry, increase step to trader carry value (add one trader carry value)
					// On spin down, if spinner value is greater than trader carry, increase step to trader carry value (remove one trader carry value)
					if ((isInc && ui.value - 1 + traderCarryAmount <= stored) ||
						(!isInc && ui.value + 1 - traderCarryAmount >= 0)) {
						spinStep = traderCarryAmount;
					}

					$(this).spinner("value", ui.value + spinStep * stepValue - stepValue);
					$(event.target).change();
					return false;
				}
			}).click(function () {
				$(this).select();
			});
		});
	};

	var InsertJunkResourceTable = function () {
		/// <summary>
		/// Inserts JunkResource rows in the end of resource selection table
		/// </summary>

		Log("Inserting Junk resources table...", "MarketplaceEnhancements");

		// This will prevent error messages
		$(".send_res tbody tr:eq(5)").hide();

		var junkResourcesTable = $("<table>").addClass("PAMEJunkTable").attr({
			cellpadding: 1,
			cellspacing: 1
		});

		var mercantsRow = $("<tr>");
		mercantsRow.append($("<td>").attr("colspan", "2").append("Mercants"));
		mercantsRow.append($("<td>").addClass("tradersNeeded").append("0"));
		mercantsRow.append($("<td>").addClass("tradersAvailable").append("/ " + tradersAvailable));

		var currentRow = $("<tr>");
		currentRow.append($("<td>").attr("colspan", "2").append("Current"));
		currentRow.append($("<td>").addClass("currentLoaded").append("0"));
		currentRow.append($("<td>").addClass("maxRes").append("/ 0"));

		var wastedRow = $("<tr>");
		wastedRow.append($("<td>").attr("colspan", "2").append("Waste"));
		wastedRow.append($("<td>").addClass("junkAmount").append("0"));
		wastedRow.append($("<td>")
			.append($("<div>")
				.append($("<img>").addClass("r1 PAMEJunkTableResourceLink Disabled").attr({ src: "img/x.gif", title: "Add waste to Lumber" }).click(UseJunkResource))
				.append($("<img>").addClass("r2 PAMEJunkTableResourceLink Disabled").attr({ src: "img/x.gif", title: "Add waste to Clay" }).click(UseJunkResource))
				.append($("<img>").addClass("r3 PAMEJunkTableResourceLink Disabled").attr({ src: "img/x.gif", title: "Add waste to Iron" }).click(UseJunkResource))
				.append($("<img>").addClass("r4 PAMEJunkTableResourceLink Disabled").attr({ src: "img/x.gif", title: "Add waste to Crop" }).click(UseJunkResource))));

		junkResourcesTable.append(mercantsRow);
		junkResourcesTable.append(currentRow);
		junkResourcesTable.append(wastedRow);

		// Adds new row with column that is apend on whole outter table and insertst new table to that column
		$(".send_res tbody").append($("<tr>").append($("<td>").attr("colspan", "4").append(junkResourcesTable)));

		// For keyboard input
		$("#r1, #r2, #r3, #r4").live("input", function () {
			FillInJunkResourceTable();
		});

		$("#r1, #r2, #r3, #r4").change(function () {
			FillInJunkResourceTable();
		});

		Log("Junk resources table inserted successfully...", "MarketplaceEnhancements");
	};

	var UseJunkResource = function () {
		var obj = $(this);
		var objClass = obj.attr("class");

		// Check if shortcut is enabled
		if (obj.hasClass("Disabled")) {
			DLog("Shortcut isn't enabled [" + objClass + "]");
			return;
		}

		// Get spinner for given resource shortcut
		var targetResourceIndex = objClass[objClass.search(" r") + 2];
		var targetElement = $("#r" + targetResourceIndex);
		var resourceReserved = targetElement.spinner("value");

		var stored = ActiveProfile.Villages[ActiveVillageIndex].Resources.Stored[targetResourceIndex - 1];
		var junkAmount = (parseInt($(".junkAmount").text(), 10) || 0);
		
		targetElement.spinner("value", resourceReserved + Math.min(junkAmount, stored - resourceReserved));
		targetElement.change();
	};

	var FillInJunkResourceTable = function () {
		/// <summary>
		/// Caltulates and fills values of pre-inserted table for junk resources
		/// </summary>

		var resMax = tradersAvailable * traderCarryAmount;

		// Get input values
		var r1 = parseInt($("#r1").val(), 10) || 0;
		var r2 = parseInt($("#r2").val(), 10) || 0;
		var r3 = parseInt($("#r3").val(), 10) || 0;
		var r4 = parseInt($("#r4").val(), 10) || 0;

		// Calulate sum of values
		var resSum = r1 + r2 + r3 + r4;

		// Calculates min number of traders needed for transport
		var tradersNeeded = Math.ceil(resSum / traderCarryAmount);

		// Calculates junk amount
		var junkAmount = tradersNeeded * traderCarryAmount - resSum;

		// Chane styles when use requested too many traders
		if (tradersNeeded > tradersAvailable) 
			$(".tradersNeeded").parent().addClass("PAMEJunkTableErrorRow");
		else $(".tradersNeeded").parent().removeClass("PAMEJunkTableErrorRow");

		// Change style if user loaded more resources than travelers can carry
		if (resSum > resMax)
			$(".currentLoaded").parent().addClass("PAMEJunkTableErrorRow");
		else $(".currentLoaded").parent().removeClass("PAMEJunkTableErrorRow");

		// Disables all resource shortcuts so they can be enabled if available
		$(".PAMEJunkTableResourceLink").addClass("Disabled");

		// Change style if junk amount isn't zero
		if (junkAmount !== 0) {
			$(".junkAmount").parent().addClass("junkAmountNonzero");

			for (var index = 0; index < 4; index++) {
				var target = $("#r" + (index + 1));
				var resourceReserved = parseInt(target.spinner("value"), 10) || 0;
				var stored = ActiveProfile.Villages[ActiveVillageIndex].Resources.Stored[index];
				if (stored - resourceReserved > 0)
					$(".PAMEJunkTableResourceLink:eq(" + index + ")").removeClass("Disabled");
			}
		}
		else $(".junkAmount").parent().removeClass("junkAmountNonzero");

		// Changes value of pre-inserted rows
		$(".currentLoaded").text(resSum);
		$(".maxRes").text("/ " + resMax);
		$(".junkAmount").text("  " + junkAmount);
		$(".tradersNeeded").text(tradersNeeded);

		DLog("Traders [" + tradersAvailable + "] each (max. " + traderCarryAmount + ") sending [" + resSum + "] with total junk amount [" + junkAmount + "]", "MarketplaceEnhancements");
	};

	function AddTransportShortcuts(traderMaxTransport) {
		// TODO Comment
		Log("Adding transport shortcuts...", "MarketplaceEnhancements");

		// SAMPLE: "<a href='#' onmouseup='add_res(1);' onclick='return false;'>1000</a>"

		Log("buildMarketAddTransportShortcuts - Adding 1x shortcut");
		// 1x shortcut
		for (var index = 0; index < 4; index++) {
			var addCall = "add_res(" + (index + 1) + ");";
			var strX1 = "/ <a href='#' onmouseup='" + addCall + "' onclick='return false;'>" + traderMaxTransport + "</a><br>";
			$(".send_res > tbody > tr:eq(" + index + ") > .max").html(strX1);
		}

		Log("buildMarketAddTransportShortcuts - 1x shortcud added!");
		Log("buildMarketAddTransportShortcuts - Adding 2x shortcut");
		// 2x shortcut

		for (var index = 0; index < 4; index++) {
			var addCall = "add_res(" + (index + 1) + ");";
			var strX2 = "/ <a href='#' onmouseup='" + addCall + addCall + "' onclick='return false;'>" + traderMaxTransport * 2 + "</a><br>";
			$(".send_res > tbody > tr:eq(" + index + ") > .max").append(strX2);
		}
		Log("buildMarketAddTransportShortcuts - 1x shortcud added!");


		Log("Transport shortcuts added successfully!", "MarketplaceEnhancements");
	}


	function IncomingSum() {
		// TODO Comment
		Log("Generating table for incoming resources sum...", "MarketplaceEnhancements");

		var sum = [0, 0, 0, 0];
		var count = 0;
		var tableIndex = 0;

		var maxTime = 0; // Temp variable

		//this way do it!
		var groups = $("#merchantsOnTheWayFormular h4").length;

		if (groups == 2) {
			//incoming = first group
		}
		if (groups == 1) {
			//if transport aviable=total
			//incoming=true
			//else
			//check language options
			//else
			//there is no incoming, sorry ;(
		}
		//save language info for later ;)

		$("#merchantsOnTheWayFormular h4").each(function (index, obj) {
			$(this).nextUntil("h4").append("<p>'" + $(this).text().trim() + "'</p>");
		});

		//This way not work, but it might be helpy
		/*
		$(".traders").each(function(index) {
			var bodys = $(this).children("tbody");
			if (bodys.length === 2) {
				alert("mam cie");
				// Gets max time and timer name
				var timeSpan	 = $(bodys[0].children).children("td").children("div:first").children();
				var time		 = timeSpan.text();
				var timeSplit	 = time.split(":");
				var timeInteger = timeSplit[0] * 3600 + timeSplit[1] * 60 + timeSplit[2] * 1;

				if (timeInteger > maxTime) {
					maxTime	 = timeInteger;
					tableIndex	 = index;
					count++;
				}

				// Gets resources and sums it to total
				var res		 = $(bodys[1].children).children("td").children().text();
				var resSplit	 = res.split(" ");

				for (var i = 0; i < 4; ++i) {
					sum[i] += parseInt(resSplit[i + 1], 10);
				}
			}
		});

		// Checks if any incoming trade exists
		if (count > 0) {
			// Recreate table with custom text
			var sourceTable = $(".traders:eq(" + tableIndex + ")");

			var customTable = $(sourceTable.outerHTML());

			// Head customization
			customTable.children("thead").children().children().each(function(index) {
				if (index === 0) $(this).html(_gim("TravianTotalIncoming"));
				else $(this).html(_gim("TravianIncomingFrom") + " " + count + " " + _gim("TravianVillagesLC"));
			});

			customTable.children("tbody:first").children().children("td").children(".in").children().attr("id", "paIncomingSumTimer");

			// Resource customization
			customTable.children("tbody:last").children().children("td").children().html(
				"<img class='r1' src='img/x.gif' alt='wood'> " + sum[0] + "&nbsp;&nbsp;" +
				"<img class='r2' src='img/x.gif' alt='clay'> " + sum[1] + "&nbsp;&nbsp;" +
				"<img class='r3' src='img/x.gif' alt='iron'> " + sum[2] + "&nbsp;&nbsp;" +
				"<img class='r4' src='img/x.gif' alt='crop'> " + sum[3] + "&nbsp;&nbsp;"
				);

			Log("buildMarketIncomingSum - Table generated! Appending table to beginning...");

			// Appends custom table to beginning
			$(".traders:first").before(customTable.outerHTML());

			Log("buildMarketIncomingSum - Table appended successfully! Asigning timer...");

			// Updates incoming left time every 128 ms to original table value
			setInterval(function() {
				$("#paIncomingSumTimer").text(
					sourceTable.children("tbody:first").children().children("td").children(".in").children().text());
			}, 1000);
		}
		*/

		Log("Incoming resources sum shown", "MarketplaceEnhancements");
	}

	//function RegisterTimerFillInJunkResource(args) {
	//	// TODO Comment
	//	$(".tradersAviable").text(+$("#merchantsAvailable").text());
	//	$(".maxRes").text(args[0] * args[1]);

	//	$("#r0, #r1, #r2, #r3, #r4").change(function () {
	//		FillInJunkResourceTimer(args);
	//	});

	//	Log("Attached for changes #r*", "MarketplaceEnhancements");
	//}
}

// Metadata for this plugin (MarketplaceImprovement)
var MarketplaceEnhancementsMetadata = {
	Name: "MarketplaceEnhancements",
	Alias: "Marketplace Enhancements",
	Category: "Utility",
	Version: "0.0.1",
	Description: "ToDo",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Settings: {
		IsLoginRequired: true,
		RunOnPages: [Enums.TravianPages.Build],
		PageMustContain: [".gid17 .container.active a[href*='t=5']"] // NOTE This can be changed later and test for specific tab in code
	},

	Flags: {
		Alpha: true,
		Internal: true
	},

	Class: MarketplaceEnhancements
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, MarketplaceEnhancementsMetadata);
