/******************************************************************************
 * FarmEnhancement.js
 *
 * Author:
 *      Geczy
 *
 * Created on:
 *      13.07.2014.
 *
 *****************************************************************************/


function FarmEnhancement() {
    /// <summary>
    /// Initializes object
    /// </summary>
    this.Register = function() {
        Log("Registering FarmEnhancement plugin...", "FarmEnhancement");

        this.raidTimes = JSON.parse(localStorage.getItem('lastRaids')) || {};
        this.raidSize = Object.keys(this.raidTimes).length;

        if (MatchPages([Enums.TravianPages.Build]) && $('.listEntry').length) {
            this.initialize();
        }

        this.notify();
        this.addSummary();
    },

    this.notify = function() {
        var raidTimes = this.raidTimes;
        var endDate = new Date();
        var html = "<br/>Send raids:";
        for (var i in raidTimes) {
            var startDate = raidTimes[i].begin;
            var diff = (startDate - endDate.getTime()) / 1000;

            if (diff < 0) {
                html += "<span>[" + (parseInt(i) + 1) + "/" + this.raidSize + "] <a href='/build.php?tt=99&id=39' style='color: #00BC00; text-decoration: underline;'>" + raidTimes[i].title + "</a></span>";
            }
        }

        $("#sidebarBoxVillagelist .innerBox.content").append(html);
    },

    this.addSummary = function() {
        var endDate = new Date();
        var html = 'List summary:<br>';
        for (var i in this.raidTimes) {
            var startDate = this.raidTimes[i].begin;
            var diff = (startDate - endDate.getTime()) / 1000;
            diff = diff < 0 ? 0 : diff;

            if (diff == 0)
                var color = "#B20C08";
            else if (diff < 60)
                var color = "#B20C08";
            else if (diff < 180)
                var color = "#CCA758";
            else
                var color = "black";

            html += "<span>[" + (parseInt(i) + 1) + "/" + this.raidSize + "] ";
            html += "<span style='color:" + color + "'>" + ConvertSecondsToTime(diff) + "</span>";
            html += " <a href='/build.php?tt=99&id=39' style='color: #00BC00; text-decoration: underline;'>" + this.raidTimes[i].title + "</a>";
            html += "</span><br>";
        }

        html += "<br>";
        CreateTravianSidebar('Raid Summary', html);
        // $('.listEntry:first').prepend(html);
    },

    /// <summary>
    /// Adds checkbox on the end of reports list to check all reports
    /// </summary>

    this.initialize = function() {
        var raidTimes = this.raidTimes;
        var endDate = new Date();

        $('.listEntry').each(function(index) {
            var minutes = parseInt($(this).find('input.raidTimerInput').val()) || 15;
            if (raidTimes[index]) {
                minutes = raidTimes[index].minutes;
            }

            var title = $(this).find('.listTitleText').text().trim();
            startDate = raidTimes[index] ? raidTimes[index].begin : resetStartDate(index, minutes, title);
            var diff = (startDate - endDate.getTime()) / 1000;
            if (diff <= 0) {
                diff = 0;
                $(this).find('.listTitle, .listContent').css('background-color', 'rgba(255, 0, 0, 0.36)').css('border', 'rgba(255, 0, 0, 0.36) solid 1px')
            }

            var closeMark = $(this).find('.markAll:first');

            var container = $('<div>');
            container.css('float', 'left');
            container.css('margin', '10px 0 0 75px');
            container.attr('id', 'raidTimer-' + index);
            container.attr('class', 'raidTimer');
            container.append('<span data-seconds="' + diff + '">' + ConvertSecondsToTime(diff) + '</span>');

            var reset = $('<a>');
            reset.attr('href', '#');
            reset.css('margin', '0 0 0 5px');
            reset.text('Reset')
            reset.on('click', function(e) {
                e.preventDefault();
                var endDate = new Date();
                var index = $(this).parent().attr('id').replace('raidTimer-', '');
                var title = $(this).closest('.listEntry').find('.listTitleText').text().trim();
                var minutes = parseInt($(this).parent().find('input.raidTimerInput').val()) || 15;
                var startDate = resetStartDate(index, minutes, title);
                var diff = (startDate - endDate.getTime()) / 1000;

                var span = $(this).parent().find('span');
                span.text(ConvertSecondsToTime(diff));
                span.attr('data-seconds', diff);

                $(this).parent().parent().find('input[type="checkbox"]').prop('checked', true);
            })

            var input = $('<input>');
            input.attr('class', 'raidTimerInput');
            input.attr('type', 'number');
            input.attr('placeholder', minutes);
            input.val(minutes);
            input.css('margin', '0 0 0 5px');
            input.css('width', '45px');

            container.append(input);
            container.append(reset);
            closeMark.after(container);
        });
    }

    var resetStartDate = function(index, minutes, title) {
        var raidTimes = JSON.parse(localStorage.getItem('lastRaids')) || {};
        var index = parseInt(index);

        if (isNaN(index)) {
            return false;
        }

        var endDate = new Date();
        var startDate = new Date(endDate);
        var durationInMinutes = minutes;
        startDate.setMinutes(endDate.getMinutes() + durationInMinutes);
        startDate = startDate.getTime();

        raidTimes[index] = raidTimes[index] || {};
        raidTimes[index].title = title;
        raidTimes[index].begin = startDate;
        raidTimes[index].minutes = minutes;

        localStorage.setItem('lastRaids', JSON.stringify(raidTimes));
        return startDate;
    }

}

// Metadata for this plugin (FarmEnhancement)
var FarmEnhancementMetadata = {
    Name: "FarmEnhancement",
    Alias: "Farm Timer",
    Category: "Utility",
    Version: "0.0.0.1",
    Description: "Timer on raids",
    Author: "Geczy",
    Site: "https://github.com/JustBuild/Project-Axeman/wiki",

    Settings: {
        IsLoginRequired: true,
    },

    Flags: {
        Alpha: true,
        Internal: true
    },

    Class: FarmEnhancement
};

// Adds this plugin to global list of available plugins
GlobalPluginsList[GlobalPluginsList.length] = $.extend(true, {}, Models.PluginMetadata, FarmEnhancementMetadata);