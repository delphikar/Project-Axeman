function Options() {
	this.InitializeSettings = function() {
		//
		// Extension State
		//
		var extensionStateCheckbox = $("#SettingsExtensionStateCheckbox");
		var extensionStateMessage = $("#SettingsExtensionStateDisabledMessage");
		extensionStateCheckbox.change(function() {
			var isChecked = !extensionStateCheckbox.prop('checked');

			// Handle Disabled message
			if (!isChecked) {
				extensionStateMessage.hide();
			} else {
				extensionStateMessage.show();
			}
		});
	};

	this.InitializePlugins = function() {
		//
		// Plugins
		//
		var PluginsViewModel = function(plugins) {
			this.plugins = ko.observableArray(plugins);
		};

		var pluginsArray = new Array();

		// Go through all plugins in global list and add them to the page
		$.each(GlobalPluginsList, function (index, metadata) {
			// Skip internal plugins if not in development mode
			if (metadata.Flags.Internal && !IsDevelopmentMode) {
				return true;
			}

			metadata["ImageSource"] = GetPluginImage(metadata);
			metadata["State"] = GetActiveState(metadata);
			pluginsArray.push(metadata);
			return true;
		});

		ko.applyBindings(new PluginsViewModel(pluginsArray));
	};

	function GetActiveState(obj) {
		var activeState = null;

		// Gets currently set plugin state
		var stateObject = JSON.parse(localStorage.getItem("IsPluginActive" + obj.Name));

		// If satte is not set, save default state else 
		if (stateObject === null) {
			activeState = obj.Default.State;
			localStorage.setItem("IsPluginActive" + obj.Name, JSON.stringify({ State: activeState }));
		}
		else activeState = stateObject.State;

		return activeState;
	};
};

$(document).ready(function () {
	// Instantiate options and initialize
	var optionsInstance = new Options();
	optionsInstance.InitializeSettings();
	optionsInstance.InitializePlugins();
});

//
// chrome-bootstrap
//
$(function () {
	$('.menu a').click(function (ev) {
		ev.preventDefault();
		var selected = 'selected';

		$('.mainview > *').removeClass(selected);
		$('.menu li').removeClass(selected);
		setTimeout(function () {
			$('.mainview > *:not(.selected)').css('display', 'none');
		}, 100);

		// Rename title to selected item
		$("title").text($(ev.currentTarget).text());

		$(ev.currentTarget).parent().addClass(selected);
		var currentView = $($(ev.currentTarget).attr('href'));
		currentView.css('display', 'block');
		setTimeout(function () {
			currentView.addClass(selected);
		}, 0);

		setTimeout(function () {
			$('body')[0].scrollTop = 0;
		}, 200);
	});

	$('#launch_modal').click(function (ev) {
		ev.preventDefault();
		var modal = $('.overlay').clone();
		$(modal).removeAttr('style');
		$(modal).find('button, .close-button').click(function () {
			$(modal).addClass('transparent');
			setTimeout(function () {
				$(modal).remove();
			}, 1000);
		});

		$(modal).click(function () {
			$(modal).find('.page').addClass('pulse');
			$(modal).find('.page').on('webkitAnimationEnd', function () {
				$(this).removeClass('pulse');
			});
		});
		$(modal).find('.page').click(function (ev) {
			ev.stopPropagation();
		});
		$('body').append(modal);
	});

	$('.mainview > *:not(.selected)').css('display', 'none');
});

