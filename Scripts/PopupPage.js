// Initialize GA
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-33221456-3']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


var popupPage;

$(document).ready(function () {
	popupPage = new PopupPage();
	popupPage.Initialize();
});

function PopupPage() {
	this.Initialize = function () {
		$("#Plugins").click(function () {
			chrome.tabs.create({ url: GetURL("Pages/PluginsManager/PluginsManager.html"), active: true });
		});

		$("#ModalNewProfileClose").click(function () {
			popupPage.AddNewProfile($("#NewServerAddress").val(), $("#NewProfileUsername").val(), $("#NewProfileUID").val(), $("#NewProfileTribe").val());
			location.reload();

			$("body").css("height", "auto");
			$("#Selection").show("slide", { direction: "left" }, 500);
			$("#ModalNewProfile").hide("slide", { direction: "right" }, 500);
		});

		$("#AddNewProfile").click(function () {
			$("body").css("height", "200px");
			$("#Selection").hide("slide", { direction: "left" }, 500);
			$("#ModalNewProfile").show("slide", { direction: "right" }, 500);
		});

		this.RefreshProfiles();
	};

	this.AddNewProfile = function (server, username, uid, tribe) {
		// TODO Comment

		Log("PopupPage: Adding new user.");

		// Create profile and populate fields
		var profile = new Models.Profile();
		profile.Name = username;
		profile.UID = uid;
		profile.ServerAddress = server;
		profile.Tribe = tribe;

		DLog("PopupPage: User created [" + profile + "]");

		// Check if that profile (Server + UID) 
		// already exists if so return
		var existingProfiles = this.GetProfiles();
		for (var index in existingProfiles) {
			if (existingProfiles[index].ServerAddress == server &&
				existingProfiles[index].UID == uid) {
				Warn("PopupPage: Profile already exists");
				return false;
			}
		}

		// Insert profile to list
		existingProfiles[existingProfiles.length] = profile;
		DLog("PopupPage: New user added to array. New array [" + existingProfiles + "]");

		// Update list in storage
		this.UpdateProfiles(existingProfiles);
		Log("PopupPage: New list saved.");
	};

	this.RefreshProfiles = function () {
		// TODO Comment

		// Get a list of available profiles
		var profiles = this.GetProfiles();

		// Generates and prepends all profiles from list
		for (var index in profiles) {
			var profile = profiles[index];

			$("#ProfilesTable").prepend(this.GenerateView(profile));
		}
		
		// Open new tab on profile click
		$(".SectionItem").click(function (e) {
			if (e.srcElement.className != "DeleteButton") {
				chrome.tabs.create({ url: ("http://" + $(this).find(".AccountServer").text()), active: true });
			}
		});
		
		// Remove profile from list on click and 
		// reloads page to get list without deleted profile
		$(".DeleteButton").click(function () {
			var server = $(this).parents().find(".AccountServer").first().text();
			var uid = $(this).parents().find(".AccountUID").first().text();

			popupPage.RemoveProfile(server, uid);
			location.reload();
		});

		Log("PopupPage: Profiles refreshed!");
	};

	this.RemoveProfile = function (server, uid) {
		// TODO Comment

		DLog("Profile remove requested for [" + server + "](" + uid + ")", "PopupPage");

		// Get a list of available profiles
		var profiles = this.GetProfiles();
		var newProfiles = new Array();

		// Go through all available profiles and check if that profile is not 
		// matching with given parameters (server and UID), in that case keep it
		for (var index in profiles) {
			if ((profiles[index].ServerAddress == server && profiles[index].UID == uid) == false) {
				newProfiles[newProfiles.length] = profiles[index];

				DLog("Profile not removed [" + profiles[index].server + "](" + profiles[index].UID + ")", "PopupPage");
			}
		}

		this.UpdateProfiles(newProfiles);
	};

	this.GenerateView = function (profile) {
		// TODO Comment
		// TODO Replace table with divs

		if (profile == null) return "<tr><td>NoData</td></tr>";

		var source = 
			"<tr>\
				<td>\
					<table class='SectionItem' style='width:100%;'>\
						<tr>\
							<td style='width:64px'>\
								<div class='DeleteButton'>r</div>\
								<img id='Img2' src='http://" + profile.ServerAddress + "/hero_image.php?uid=" + profile.UID + "' width='64' height='73' />\
							</td>\
							<td>\
								<table style='width:100%'>\
									<tr>\
										<td>\
											<div>" + profile.Name + "</div>\
										</td>\
										<td>\
											<div class='AccountUID'>" + profile.UID + "</div>\
										</td>\
									</tr>\
									<tr>\
										<td colspan='2'>\
											<div class='AccountDetail' style='margin-top:10px'>" + profile.Villages.length + " village(s)</div>\
										</td>\
									</tr>\
									<tr>\
										<td colspan='2'>\
											<div class='AccountDetail' style='margin-bottom:10px'>" + profile.Population + " population</div>\
										</td>\
									</tr>\
									<tr>\
										<td colspan='2'>\
											<div class='AccountServer'>" + profile.ServerAddress + "</div>\
										</td>\
									</tr>\
								</table>\
							</td>\
						</tr>\
					</table>\
				</td>\
			</tr>";
		
		return source;
	};

	this.UpdateProfiles = function(value) {
		localStorage.setItem("Profiles", JSON.stringify(value));
	};

	this.GetProfiles = function () {
		// Dont use requests, this is faster
		// This is not ContentScript so there is no need to use Requests
		var profilesString = localStorage.getItem("Profiles");
		if (profilesString != null && profilesString.length > 0) {
			return JSON.parse(profilesString);
		}
		else return new Array();
	};
};