/******************************************************************************
 * AutoAdventure.js
 *
 * Author:
 * 		Geczy
 *
 * Created on:
 * 		13.07.2014.
 *
 *****************************************************************************/


function AutoAdventure() {
    /// <summary>
    /// Initializes object
    /// </summary>
    this.Register = function() {
        Log("Registering AutoAdventure plugin...", "AutoAdventure");

        initialize();

        if (!IsDevelopmentMode) {
            // Google analytics
            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-33221456-3']);
            _gaq.push(['_trackEvent', 'Plugin', 'Utility/AutoAdventure']);

            (function() {
                var ga = document.createElement('script');
                ga.type = 'text/javascript';
                ga.async = true;
                ga.src = 'https://ssl.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(ga, s);
            })();
        }
    },

    /// <summary>
    /// Adds checkbox on the end of reports list to check all reports
    /// </summary>

    initialize = function() {
        if (!this.enabled()) {
            if (MatchPages('start_adventure.php')) {
                $('button[name="ok"]').click();
            }
            return;
        }

        if (!MatchPages('adventure.php')) {
            location.href = 'hero_adventure.php';
            return;
        } else {
            this.process();
            $('button[name="start"]').click();
        }
    }

    enabled = function() {
        return this.doAdventures && $('.heroStatusMessage').text().trim().indexOf('in home') !== -1 && parseInt($('.adventureWhite .speechBubbleContent').text());
    }

    process = function() {
        var url = $('a.gotoAdventure:first').attr('href');
        if (url == undefined) {
            return;
        }

        location.href = url;
    }

}

// Metadata for this plugin (AutoAdventure)
var AutoAdventureMetadata = {
    Name: "AutoAdventure",
    Alias: "Auto Adventure",
    Category: "Utility",
    Version: "0.0.0.1",
    Description: "TODO",
    Author: "Geczy",
    Site: "https://github.com/JustBuild/Project-Axeman/wiki",

    Settings: {
        IsLoginRequired: true,
    },

    Flags: {
        Alpha: true,
        Internal: true
    },

    Class: AutoAdventure
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, AutoAdventureMetadata);