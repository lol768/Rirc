/**
 * Rirc - IRC client by rigor789
 * Copyright (C) 2014  Igor Randjelovic <rigor789>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var irc             = require('irc');
var gui             = require('nw.gui');
var client          = new irc.Client('irc.esper.net', 'rirc', {
                        channels: ['#rirc'],
                      });

global.gui          = gui;
global.mainWindow   = gui.Window.get();

client.addListener('message', function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
    var d = new Date()
    var time = "[" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "] ";
    $("#chatlist").append("<li>" + time + from + ": " + message + "</li>");
});
                
client.addListener('error', function(message) {
    console.log('error: ', message);
});
                
client.addListener('names#channel', function(nicks) {
    console.log('nicks: ', nicks);
});

window.onfocus = function() { 
    $("#status").html("focus");
}

window.onblur = function() { 
    $("#status").html("blur");
}

window.onload = function() {

    $("#minimize").click(function() {
        global.mainWindow.minimize();
    });

    $("#close").click(function() {
        global.mainWindow.hide();
        gui.App.quit();
    });

    $("a").click(function(event) {
        event.preventDefault();
    });
    
    $("a.link").click(function(event) {
        $("#window").load($(this).attr("href"));
    });
                
    $("input").keydown(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            client.say("#rirc", $(this).val());
            $(this).val("");
        }
    });

    global.mainWindow.show();
}