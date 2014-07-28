/******************************************************************************
 * AutoAdventure.js
 *
 * Author:
 *      Geczy
 *
 * Created on:
 *      13.07.2014.
 *
 *****************************************************************************/


function AutoAdventure() {
    /// <summary>
    /// Initializes object
    /// </summary>
    this.Register = function() {
        Log("Registering AutoAdventure plugin...", "AutoAdventure");

        this.initialize();
    },

    /// <summary>
    /// Adds checkbox on the end of reports list to check all reports
    /// </summary>

    this.initialize = function() {

        if (!this.hasAdventure()) {

            // We're on the last page of doing the adventure
            if (MatchPages([Enums.TravianPages.HeroStartAdventure])) {
                $('button[name="ok"]').click();
            }

            // No adventures = don't continue
            return;
        }

        // We have an adventure, let's go to the list of adventures
        if (!MatchPages([Enums.TravianPages.HeroStartAdventure, Enums.TravianPages.HeroAdventures])) {
            location.href = 'hero_adventure.php';
            return;
        }

        // Pick the first adventure from the list
        if (MatchPages([Enums.TravianPages.HeroAdventures])) {
            var url = $('a.gotoAdventure:first').attr('href');
            if (url != undefined) {
                location.href = url;
                return;
            }
        }

        // Start the first adevnture
        if (MatchPages([Enums.TravianPages.HeroStartAdventure])) {
            $('button[name="start"]').click();
            return;
        }

    }

    this.hasAdventure = function() {
        return $('.heroStatusMessage').text().trim().indexOf('in home') !== -1 && parseInt($('.adventureWhite .speechBubbleContent').text());
    }

}

// Metadata for this plugin (AutoAdventure)
var AutoAdventureMetadata = {
    Name: "AutoAdventure",
    Alias: "Auto Adventure",
    Category: "Utility",
    Version: "0.0.0.1",
    Description: "Completes an adventure when available.",
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