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
	this.Register = function () {
		/// <summary>
		/// Initializes plugin object
		/// </summary>

		if (!IsLogedIn) {
			Log("ResourcesIndicator: User isn't loged in...");
			return;
		}

		// Register only on send resources marketplace tab
		if (!(MatchPages(Enums.TravianPages.Build) && MatchQuery({ id: "30", t: "5" }))) return;

		Log("Registering MarketplaceEnhancements plugin...", "MarketplaceEnhancements");

		//work
		var traderMaxTransport = parseInt($(".send_res > tbody > tr:eq(0) > .max > a").text() || 0, 10);
		var tradersAvailable = parseInt($("#merchantsAvailable").text(), 10) || 0;

		//work
		FillVillagesList();

		//work-in-half, but rebuild
		//AddTransportShortcuts(traderMaxTransport);

		//work-in-half, but rebuild
		InsertJunkResourceTable();
		RegisterTimerFillInJunkResource([tradersAvailable, traderMaxTransport]);

		//Perhaps works, maybe not, but useful
		IncomingSum();

		addSpiners(tradersAvailable, traderMaxTransport);

		//Test Area ;)
		function testArea() {
			var useHour = $("<span>").text("1h").attr({
				"title": "Use hour production",
				"id": "PA_1h"
			}).css({
				"margin": "0"
			}).button({
				icons: {
					primary: "ui-icon-plus"
				}
			}).click(function () {
				$.each($("#send_select input"), function (index, obj) {
					var stored = ActiveProfile.Villages[ActiveVillageIndex].Resources.Production[index];
					$(obj).val(stored);
				});
			});;

			$("#send_select tr:eq(4) td").append(useHour);
			//need InsertJunkResourceTable and other ;)
		}
		testArea();

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
		// TODO Comment
		Log("Adding village list selector...", "MarketplaceEnhancements");

		// Gets village names to array
		var villages = [];
		for (var index = 0, cache = ActiveProfile.Villages.length; index < cache; index++) {
			var obj = ActiveProfile.Villages[index];
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


	function addSpiners(tradersAvailable, traderMaxTransport) {
		var maxTransport = tradersAvailable * traderMaxTransport;
		function max(maxTransport, stored) {
			if (maxTransport < stored) return maxTransport;
			else return stored;
		}
		$.each($("#r1, #r2, #r3, #r4"), function (index, obj) {
			var stored = ActiveProfile.Villages[ActiveVillageIndex].Resources.Stored[index];
			$(obj).spinner({
				incremental: true,
				step: 1,
				min: 0,
				max: max(maxTransport, stored),
				spin: function (event, ui) {
					if (ui.value > $(this).val() && ui.value - 1 + traderMaxTransport <= stored) {
						$(this).spinner("value", ui.value - 1 + traderMaxTransport);
						$("#r0").change();
						return false;
					}
					else if (ui.value < $(this).val() && ui.value + 1 - traderMaxTransport >= 0) {
						$(this).spinner("value", ui.value + 1 - traderMaxTransport);
						$("#r0").change();
						return false;
					}
					else {
						$(this).spinner("value", ui.value);
						$("#r0").change();
					}
				}
			});
		});
	}

	function RegisterTimerFillInJunkResource(args) {
		// TODO Comment
		$(".tradersAviable").text(+$("#merchantsAvailable").text());
		$(".maxRes").text(args[0] * args[1]);

		$("#r0, #r1, #r2, #r3, #r4").change(function () {
			FillInJunkResourceTimer(args);
		});

		Log("Attached for changes #r*", "MarketplaceEnhancements");
	}

	/**
	 * Inserts JunkResource rows in the end of resource selection table
	 *
	 * @author Aleksandar Toplek
	 */
	function InsertJunkResourceTable() {
		Log("Inserting Junk resources table...", "MarketplaceEnhancements");

		$(".send_res").append("<tfoot>");
		$(".send_res tbody tr:eq(5)").remove();
		$(".send_res tfoot").append("<tr><td colspan='7'><table id='send_info' style='background-color: white;'>\
			<tr><td>Merchants</td><td style='text-align: right;' class='tradersNeeded'>0</td><td>/</td><td class='tradersAviable'>0</td></tr>\
			<tr><td>Current</td><td style='text-align: right;' class='currentLoaded'>0</td><td>/</td><td class='maxRes'>0</td></tr>\
			<tr><td>Wasted:</td><td style='text-align: right;' class='junkAmount'>0</td></tr>\
		</table></td></tr><input id='r0' type='hidden'>");

		Log("Junk resources table inserted successfully...", "MarketplaceEnhancements");
	}

	/**
	 * Called by FillInJunkResource timer
	 * Actualy caltulates and fills values of pre-inserted table
	 *
	 * @author Aleksandar Toplek
	 *
	 * @param {Array} args  1 represents trader maximal transport amount
	 *                      0 represents how much traders is available
	 */
	function FillInJunkResourceTimer(args) {
		var resMax = args[0] * args[1];

		// Get input values
		var r1 = parseInt($("#r1").val(), 10) || 0;
		var r2 = parseInt($("#r2").val(), 10) || 0;
		var r3 = parseInt($("#r3").val(), 10) || 0;
		var r4 = parseInt($("#r4").val(), 10) || 0;

		// Calulate sum of values
		var resSum = r1 + r2 + r3 + r4;

		// Calculates min number of traders needed for transport
		var tradersNeeded = Math.ceil(resSum / args[1]);

		// Calculates junk amount
		var junkAmount = tradersNeeded * args[1] - resSum;

		// Styles of row (indicating too much resource requested / more traders needed)
		if (tradersNeeded > args[0])
			$(".currentLoaded").attr("style", "color:red;");
		else $(".currentLoaded").attr("style", "");

		// Changes value of pre-inserted rows
		$(".currentLoaded").html(resSum);
		$(".maxRes").html(resMax);
		$(".junkAmount").html((tradersNeeded > args[0] ? "NA" : junkAmount));
		$(".tradersNeeded").html(tradersNeeded);


		Log("traders [" + args[0] + "] each [" + args[1] + "] sending [" + resSum + "] with junk [" + junkAmount + "]", "MarketplaceEnhancements");
	}
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

	Flags: {
		Alpha: true,
		Internal: true
	},

	Class: MarketplaceEnhancements
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, MarketplaceEnhancementsMetadata);
