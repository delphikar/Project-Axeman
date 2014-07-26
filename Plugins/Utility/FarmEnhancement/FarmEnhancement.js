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

        if (MatchPages([Enums.TravianPages.Build]) && $('.listEntry').length) {
            this.initialize();
        }

        this.notify();
        this.addSummary();

        setInterval(this.refresh, 1000);
    },

    this.refresh = function() {
        // Go through all seconds indicators
        $(".raidTimerCountdown").each(function() {
            var secondsLeft = parseInt($(this).attr("data-seconds"), 10);
            if (secondsLeft > 0) {
                secondsLeft--;
                $(this).attr("data-seconds", secondsLeft);
                $(this).html(ConvertSecondsToTime(secondsLeft));
            }

            if (secondsLeft < 1)
                var color = "#B20C08";
            else if (secondsLeft < 60)
                var color = "#B20C08";
            else if (secondsLeft < 180)
                var color = "#CCA758";
            else
                var color = "black";

            $(this).css("color", color);
        });
    }

    this.notify = function() {
        var endDate = new Date();
        var html = "<br/>Send raids:";
        for (var i in this.raidTimes) {
            var startDate = this.raidTimes[i].begin;
            var diff = (startDate - endDate.getTime()) / 1000;

            if (diff < 1 && this.raidTimes[i].minutes != -1) {
                html += "<span><a href='/build.php?tt=99&id=39' style='color: #00BC00; text-decoration: underline;'>" + this.raidTimes[i].title + "</a></span>";
            }
        }

        $("#sidebarBoxVillagelist .innerBox.content").append(html);
    },

    this.addSummary = function() {
        var endDate = new Date();
        var html = '';
        for (var i in this.raidTimes) {

            if (this.raidTimes[i].minutes == -1) {
                continue;
            }

            var startDate = this.raidTimes[i].begin;
            var diff = (startDate - endDate.getTime()) / 1000;
            diff = diff < 1 ? 0 : diff;

            if (diff == 0)
                var color = "#B20C08";
            else if (diff < 60)
                var color = "#B20C08";
            else if (diff < 180)
                var color = "#CCA758";
            else
                var color = "black";

            html += "<span>";
            html += "<span class='raidTimerCountdown' data-seconds='" + diff + "' style='color:" + color + "'>" + ConvertSecondsToTime(diff) + "</span>";
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

        $('.listEntry').each(function(i) {
            var minutes = parseInt($(this).find('input.raidTimerInput').val()) || 15;
            var index = $(this).attr('id');

            if (raidTimes[index]) {
                minutes = raidTimes[index].minutes;
            }

            var title = $(this).find('.listTitleText').text().trim();
            startDate = raidTimes[index] ? raidTimes[index].begin : resetStartDate(index, minutes, title);
            var diff = (startDate - endDate.getTime()) / 1000;
            diff = diff < 1 ? 0 : diff;
            if (diff < 1 && raidTimes[index].minutes != -1) {
                $(this).find('.listTitle, .listContent').css('background-color', 'rgba(255, 0, 0, 0.36)').css('border', 'rgba(255, 0, 0, 0.36) solid 1px')
            }

            var closeMark = $(this).find('.markAll:first');

            var container = $('<div>');
            container.css('float', 'right');
            container.css('margin', '0 0 0 75px');
            container.css('padding-right', '5px');
            container.attr('id', 'raidTimer-' + index);
            container.attr('class', 'raidTimer');
            container.append('<span class="raidTimerCountdown" data-seconds="' + diff + '">' + ConvertSecondsToTime(diff) + '</span>');

            var reset = $('<a>');
            reset.attr('href', '#');
            reset.css('margin', '0 0 0 5px');
            reset.text('Reset')
            reset.on('click', function(e) {
                e.preventDefault();
                if ($(this).closest('.listTitle').find('.switchClosed').length) {
                    alert('Open the raid list to start the timer');
                    return false;
                }

                var endDate = new Date();
                var index = $(this).parent().attr('id').replace('raidTimer-', '');
                var title = $(this).closest('.listEntry').find('.listTitleText').text().trim();
                var minutes = parseInt($(this).parent().find('input.raidTimerInput').val()) || 15;
                var startDate = resetStartDate(index, minutes, title);
                var diff = minutes < 1 ? 0 : (startDate - endDate.getTime()) / 1000;

                var span = $(this).parent().find('span');
                span.text(ConvertSecondsToTime(diff));
                span.attr('data-seconds', diff);

                if (minutes > 0) {
                    $(this).closest('.listEntry').find('input[type="checkbox"]').click();
                }

                return false;
            })

            var input = $('<input>');
            input.attr('class', 'raidTimerInput');
            input.attr('title', 'minutes');
            input.attr('type', 'number');
            input.attr('placeholder', minutes);
            input.val(minutes);
            input.css('margin', '0 0 0 5px');
            input.css('width', '45px');

            container.append(input);
            container.append(reset);
            $(this).find('.listTitle').prepend(container);
        });
    }

    var resetStartDate = function(index, minutes, title) {
        var raidTimes = JSON.parse(localStorage.getItem('lastRaids')) || {};
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