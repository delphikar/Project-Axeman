/******************************************************************************
 * Services.js
 * 
 * Author:
 * 		Aleksandar Toplek (AleksandarDev)
 *
 * Created on:
 * 		28.06.2012.
 *
 *****************************************************************************/

function Services() {
	// <summary>
	// Plugin that takes care of all built-in models (fill and update), refreshes page and changes views randomly.
	// </summary>
	
	//
	// Variables
	//
	var activeVillage;

	
	this.Register = function () {
		// <summary>
		// Registers plugin 
		// </summary>

		Log("Initializing...", "Services");

		// Check if user is loged in
		ProcessIsLogedIn();
		
		// Process profile
		ProcessProfiles();
		
		// Crawl current page
		CrawlPage();
		
		// Save changes
		SaveActiveVillage();
		SaveProfileChanges();
		
		// Try to auto-login profile if possible
		AutoLoginUser();

		// Initiate refresh service
		InitializeNavigationService();

		if (!IsDevelopmentMode) {
			// Google analytics
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-33221456-3']);
			_gaq.push(['_trackEvent', 'Plugin', 'Core/Services']);
			(function () { var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true; ga.src = 'https://ssl.google-analytics.com/ga.js'; var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s); })();
		}
	};

	var InitializeNavigationService = function() {
		// TODO Implement
	};

	var AutoLoginUser = function () {
		/// <summary>
		/// If profile has option enabled and password is available, fills login information  and submits form
		/// </summary>

		Log("Checking if user can login automatically", "Services");
		
		if (!IsLogedIn && ActiveProfile.IsAutoLogin && ActiveProfile.Password) {
			$(".login input[name='name']").val(ActiveProfile.Name);
			$(".login input[name='password']").val(ActiveProfile.Password);

			$("form[name='login']").submit();
		}
	};

	var CrawlPage = function () {
		// <summary>
		// This function will crawl current page and get all available
		// data from it and save it to current profile
		// </summary>

		// Nothing to crawl is user is loged off
		if (!IsLogedIn) {
			DLog("Crawling not supported when user isn't loged in!", "Services");
			return;
		}

		if (!MatchPages([
			Enums.TravianPages.Home,
			Enums.TravianPages.Login,
			Enums.TravianPages.Logout])) {

			Log("Crawling page...", "Services");

			CrawlVillageList();
			activeVillage = ActiveProfile.Villages[ActiveVillageIndex];

			CrawlStorage();
			CrawlProduction();
			CrawlLoyalty();
			CrawlMessages();
			CrawlReports();
			
			if (MatchPages([Enums.TravianPages.Player])) {

				Log("Crawling Player page...", "Services");

				CrawlVillagesDetails();
			}
			if (MatchPages([Enums.TravianPages.VillageOut])) {

				Log("Crawling Village Out page...", "Services");

				CrawlVillageType();
				CrawlVillageFields();
				CrawlVillageBuildTasks();
				CrawlVillageMovements();
				CrawlVillageTotalTroops();
			}
			if (MatchPages([Enums.TravianPages.VillageIn])) {

				Log("Crawling Village In page...", "Services");

				CrawlVillageBuildings();
				CrawlVillageBuildTasks();
			}
			// TODO Military Units
			// TODO Crawl movements from rally point
		}
	};

	var CrawlStorage = function () {
		// <summary>
		// Crawls for active village storages and crop production/consumption
		// </summary>

		Log("Crawling village storage...", "Services");

		$("#res > li > p > span").each(function (index, obj) {
			var resText = $(obj).text();
			var separated = resText.split("/");

			// If storage, else it's crop production/consumtion
			if (index < 4) {
				// Set Storage max value
				activeVillage.Resources.Storage[index] = parseInt(separated[1], 10) || 0;

				// Set current stored value
				activeVillage.Resources.Stored[index] = parseInt(separated[0], 10) || 0;
			}
			else {
				activeVillage.Resources.FreeCrop = parseInt(resText, 10) || 0;
			}
		});

		DLog("Stored in Village [" + activeVillage.VID + "] is [" + activeVillage.Resources.Stored + "] and crop [" + activeVillage.Resources.Consumption + " of " + activeVillage.Resources.TotalCropProduction + "]", "Services");
		DLog("Storage of Village [" + activeVillage.VID + "] is [" + activeVillage.Resources.Storage + "]", "Services");
	};

	var CrawlProduction = function () {
		// <summary>
		// Crawls for active village production from production table (not from script)
		// </summary>

		Log("Crawling village production...", "Services");

		// Go through all script values and parse production values to village resource production array
		var scriptContent = $("script:contains('resources.production')").html();

		// Regular expression string from
		// http://txt2re.com/index-javascript.php3?s=resources.production%20=%20{%20%27l1%27:%20500,%27l2%27:%20556,%27l3%27:%20500,%27l4%27:%20367};&16&12&14&13&11
		var regexString = ".*?\\d+.*?(\\d+).*?\\d+.*?(\\d+).*?\\d+.*?(\\d+).*?\\d+.*?([-+]?\\d+)";
		var p = new RegExp(regexString, ["i"]);
		var m = p.exec(scriptContent);
		if (m != null) {
			for (var index = 1; index < 5; index++) {
				activeVillage.Resources.Production[index - 1] = parseInt(m[index], 10) || 0;
			};

			DLog("Production of Village [" + activeVillage.VID + "] is [" + activeVillage.Resources.Production + "]", "Services");
		}
		else Warn("Can't parse production script!", "Services");
	};

	var CrawlLoyalty = function () {
		// <summary>
		// Crawls for active village loyalty
		// </summary>
		
		Log("Crawling village loyalty...", "Services");

		// Get loyalty span text
		var loyaltyText = $("#villageName .loyalty").text();

		// Remove 'Loyalty' word parse right part to number
		var loyalty = parseInt(loyaltyText.split(":")[1], 10) || 0;

		// Set crawled data to active village
		activeVillage.Loyalty = loyalty;

		DLog("Set Village [" + activeVillage.VID + "] loyalty to [" + activeVillage.Loyalty + "]", "Services");
	};

	var CrawlVillageList = function () {
		// <summary>
		// Crawls Village list data
		// </summary>
		
		Log("Crawling Villages list...", "Services");

		// Go through all available entryes in village list
		$("#villageList .entry").each(function () {
			// Gets basic village values
			var villageName = $(" > a", this).text();
			var villageID = parseInt($(" > a", this).attr("href").replace("?newdid=", ""), 10) || 0;
			var isVillageActive = $(this).hasClass("active");
			
			DLog("Found village \"" + villageName + "\" [" + villageID + "]", "Services");

			// Try to update village data
			var wasUpdated = false;
			for (var index = 0, cache = ActiveProfile.Villages.length; index < cache; index++) {
				var obj = ActiveProfile.Villages[index];

				// Check if this is matched village
				if (obj.VID == villageID) {
					wasUpdated = true;

					obj.IsActive = isVillageActive;
					obj.Name = villageName;
					obj.VID = villageID;

					// Check if this is active village
					if (obj.IsActive) {
						ActiveVillageIndex = index;
						DLog("Set ActiveVilageIndex to [" + ActiveVillageIndex + "]", "Services");
					}

					DLog("Village [" + villageID + "] updated...", "Services");
					break;
				}
			}

			// Create new village if didnt match any village
			if (!wasUpdated) {
				var newVillage = new Models.Village();
				newVillage.Name = villageName;
				newVillage.VID = villageID;
				newVillage.IsActive = isVillageActive;

				// Check if this is active village
				if (newVillage.IsActive) {
					ActiveVillageIndex = ActiveProfile.Villages.length;
					DLog("Set ActiveVilageIndex to [" + ActiveVillageIndex + "]", "Services");
				}

				ActiveProfile.Villages[ActiveProfile.Villages.length] = newVillage;

				Log("New Village [" + villageID + "] registered!", "Services");
			}
		});
	};

	var CrawlMessages = function () {
		// <summary>
		// Crawls for new user reports
		// </summary>

		Log("Crawling messages...", "Services");
		
		var currentReportsCount = parseInt($(".messages > div.bubble > .bubble-content").text(), 10) || 0;
		ActiveProfile.Messages.UnreadCount = currentReportsCount;

		// Check if on Messages page
		if (MatchPages([Enums.TravianPages.Messages])) {
			// Check if on 'Inbox' tab
			if ($(".messages .container.active a[href*='t=0']").length ||
				$(".messages .container.active a[href*='t=2']").length) {
				DLog("On messages page. Crawling message details.", "Services");

				if ($(".paper").length) {
					// We are in write/read mode
					var messageID = $(".paper #answer input:eq(0)").attr("value");
					var messageContent = $("#message").html();

					// Check if message is already crawled
					if (ActiveProfile.Messages.Inbox[messageID]) {
						ActiveProfile.Messages.Inbox[messageID].Content = messageContent;
					} else if (ActiveProfile.Messages.Sent[messageID]) {
						ActiveProfile.Messages.Sent[messageID].Content = messageContent;
					} else {
						Warn("No message with same ID [" + messageID + "]", "Services");
						return;
					}
					
					DLog("Message [" + messageID + "] content set.", "Services");
				} else {
					// Go throigh all message lines and crawl data
					$(".inbox > tbody > tr").each(function() {
						var messageElement = $(this);

						// Get message details
						var message = new Models.Message();

						// Get message subject and ID
						var messageLink = $(".subject a", messageElement);
						message.MID = parseInt(messageLink.attr("href").replace("nachrichten.php?id=", "")).toString();
						message.IsRead = $(".subject img", messageElement).hasClass("messageStatusRead");
						message.Subject = $.trim(messageLink.text());

						// Get message sender
						var sender = $(".send a", messageElement);
						message.From = sender.text();
						message.FromUID = sender.attr("href").replace("spieler.php?uid=", "");

						// Get message date
						var date = $(".dat", messageElement).text();
						var dateSplit = date.split("/");
						if (dateSplit.length < 3) {
							// Message arrived today
							var dateNow = new Date();
							var timeSplit = date.split(" ")[1].split(":");
							message.Date = (new Date(dateNow.getYear() + 1900, dateNow.getMonth(), dateNow.getDate(), timeSplit[0], timeSplit[1])).getTime();
						} else {
							// Message arrives some day before today
							var timeSplit = dateSplit[2].split(" ")[1].split(":");
							message.Date = (new Date("20" + dateSplit[0], dateSplit[1], parseInt(dateSplit[2], 10) || 0, timeSplit[0], timeSplit[1])).getTime();
						}

						if ($(".messages .container.active a[href*='t=0']").length)
							ActiveProfile.Messages.Inbox[message.MID] = message;
						else ActiveProfile.Messages.Sent[message.MID] = message;
					});
				}
			}
		}
		DLog("Services: CrawlReports found [" + currentReportsCount + "] new messages");
	};

	// <summary>
	// Crawls for new user reports
	// </summary>
	var CrawlReports = function () {
		var currentReportsCount = parseInt($(".reports .bubble-content").text(), 10) || 0;

		// Check if on Reports page
		if (MatchPages([Enums.TravianPages.Reports])) {
			// TODO Implement
		}
		else {
			ActiveProfile.Reports.UnreadCount = currentReportsCount;
		}

		DLog("Services: CrawlReports found [" + currentReportsCount + "] new reports");
	};
	
	// <summary>
	// Crawls for villages details
	// </summary>
	var CrawlVillagesDetails = function () {
		$.each(ActiveProfile.Villages, function (index, obj) {
			// Get village detailc table
			var village = $("#villages tbody tr").find("td:contains('"+obj.Name+"')").parent();
		
			// Crawl IsMainCity
			var checkMainCity = ($(".name", village).has(".mainVillage").length ? true : false);
			ActiveProfile.Villages[index].IsMainCity = checkMainCity;
			DLog("Services: " + obj.Name + " " + (checkMainCity ? "is" : "isn't") + " main city");
			
			// Crawl village population
			var villagePop =  parseInt($(".inhabitants", village).text(), 10) || 0;
			ActiveProfile.Villages[index].Population = villagePop;
			DLog("Services: Population of "+obj.Name+" is ["+villagePop+"]");
			
			// Crawl village position X Coordinate
			var PositionX = $(".coordinateX", village).text();
			PositionX = parseInt(PositionX.replace("(",""), 10) || 0;
			ActiveProfile.Villages[index].Position.x = PositionX;
			
			// Crawl village position Y coordinate
			var PositionY = $(".coordinateY", village).text();
			PositionY = parseInt(PositionY.replace(")",""), 10) || 0;
			ActiveProfile.Villages[index].Position.y = PositionY;
			
			DLog("Services: Coordinates for "+obj.Name+" are [("+PositionX+"|"+PositionY+")]");
		});
	};
	
	// <summary>
	// Crawls village type
	// </summary>
	var CrawlVillageType = function () {
		var currentVillageType = $("#village_map").attr("class") || "f3";
	
		activeVillage.VillageOut.Type = currentVillageType;

		DLog("CrawlVillageType is [" + currentVillageType + "]", "Services");
	};

	var CrawlVillageFields = function () {
		/// <summary>
		/// Crawls field levels
		/// </summary>

		Log("Crawling VillageOut fields", "Services");

		var activeVillage = GetActiveVillage();
		$("#village_map .level").each(function (fieldIndex, fieldObj) {
			var field = $(fieldObj);
			var level = parseInt(field.text(), 10) || 0;
			activeVillage.VillageOut.Levels[fieldIndex] = level;
			
			DLog("VillageOut Field(" + fieldIndex + ") at lvl." + level, "Services");
		});
	};

	var CrawlVillageBuildings = function() {
		// TODO Implement
	};

	var CrawlVillageTasks = function(type) {
		// TODO Implement
	};

	var CrawlVillageBuildTasks = function () {
		// TODO Implement
	};
	
	var CrawlVillageMovements = function () {
		// TODO Implement
	};
	
	var CrawlVillageTotalTroops = function () {
		// TODO Implement
	};

	var ProcessIsLogedIn = function () {
		// <summary>
		// Sets variable to true if user is loged in
		// </summary>

		IsLogedIn = !IsNullOrEmpty($(".signLink"));

		if (IsLogedIn) Log("User is loged in...", "Services");
		else Warn("User isn't loged in!", "Services");
	};

	var ProcessProfiles = function () {
		// <summary>
		// Sets profile object to AvailableProfiles
		// </summary>

		Log("Processing profile...", "Services");

		// Can't get active user if user isn't loged in
		if (!IsLogedIn) {
			var profileIndexToActivate = -1;

			// Check if more than one profile belongs to current server address
			for (var index = 0, cache = AvailableProfiles.length; index < cache; index++) {
				if (AvailableProfiles[index].ServerAddress == ActiveServerAddress) {
					DLog("Found profile at [" + index + "]", "Services");
					if (profileIndexToActivate !== -1) {
						Warn("More than one profile is available for current server! Can't select profile automatically.", "Services");
						return;
					}
					profileIndexToActivate = index;
				}
			}
			
			// Check if any profiles were found
			if (profileIndexToActivate === -1) {
				Warn("No profile found for current server! Please login or create profile manualy.", "Services");
				return;
			}

			// Set active profile to matching profile
			ActiveProfile = AvailableProfiles[index];
		} else {
			// Gets active profile UID
			var profileLinkElement = $(".sideInfoPlayer .signLink").attr("href");
			var activeProfileUID = parseInt(profileLinkElement.replace("spieler.php?uid=", ""), 10) || 0;
			var activeProfileName = $(".sideInfoPlayer .signLink span").text();
			var activeProfileTribeID = $(".sideInfoPlayer img").attr("class").replace("nationBig nationBig", "");

			DLog("Active profile UID is [" + activeProfileUID + "]", "Services");

			// Search for matching profile
			for (var index = 0, cache = AvailableProfiles.length; index < cache; index++) {
				var obj = AvailableProfiles[index];
				
				// Match using Server Address and UID or name
				if (obj.ServerAddress == ActiveServerAddress &&
					(obj.UID == activeProfileUID || obj.Name == activeProfileName)) {
					// Set Active Profile
					Log("Active profile is found!", "Services");
					ActiveProfile = obj;

					break;
				}
			}

			DLog("Updating current active profile...", "Services");

			// Update profile data
			ActiveProfile = IsNullOrEmpty(ActiveProfile) ? new Models.Profile() : ActiveProfile;
			ActiveProfile.ServerAddress = ActiveServerAddress;
			ActiveProfile.Name = activeProfileName;
			ActiveProfile.UID = activeProfileUID;
			ActiveProfile.Tribe = Enums.Tribes[activeProfileTribeID];

			DLog("Profile updated!", "Services");
		}
	};

	var GetActiveVillage = function () {
		// <summary>
		// Gets currently active village
		// </summary>
		// <returns>Models.Village object representing currently active village</returns>
		
		return ActiveProfile.Villages[ActiveVillageIndex];
	};

	var SaveActiveVillage = function () {
		// <summary>
		// Updates active village
		// </summary>
		
		ActiveProfile.Villages[ActiveVillageIndex] = activeVillage;
	};
	
	var SaveProfileChanges = function () {
		// <summary>
		// Updates AvailableProfiles list with new profile data
		// </summary>

		Log("Saving profile...", "Services");

		if (!IsLogedIn) {
			DLog("Can't save profile when user isn't loged in!", "Services");
			return;
		}

		var wasUpdated = false;

		// Search for profile to update
		for (var index = 0, cache = AvailableProfiles.length; index < cache; index++) {
			var obj = AvailableProfiles[index];

			// Check if current profile matched active profile
			if (obj.ServerAddress == ActiveProfile.ServerAddress && obj.UID == ActiveProfile.UID) {
				// Replace old data with new data
				AvailableProfiles[index] = ActiveProfile;

				wasUpdated = true;

				Log("Profile saved [" + obj.UID + "]", "Services");

				break;
			}
		}

		// If no profile was updated, create new profile
		// Adds new profile to the end of list
		if (!wasUpdated) {
			AvailableProfiles[AvailableProfiles.length] = ActiveProfile;

			Log("New Profile[" + ActiveProfile.UID + "] saved!", "Services");
		}

		// Sends request to save profiles list so that other plugins can use it
		(new Request("Background", "Data", "Profiles", { Type: "set", Value: AvailableProfiles })).Send();
	};
}

// Metadata for this plugin (Services)
var ServicesMetadata = {
	Name: "Services",
	Alias: "Services",
	Category: "Core",
	Version: "0.0.2.0",
	Description: "Takes care of all data retrieving and is requeired for all plugins",
	Author: "JustBuild Development",
	Site: "https://github.com/JustBuild/Project-Axeman/wiki",

	Settings: {
		IsChangeable: false
	},

	Flags: {
		Alpha: true
	},

	Class: Services
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, ServicesMetadata);
