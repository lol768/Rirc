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
var irc             = require('irc');                   // IRC
var gui             = require('nw.gui');                // NodeWebkit GUI
var settings        = require('./rirc/settings');            // Settings

// Load the settings
global.settings     = settings.loadSettings();
global.gui          = gui;
global.mainWindow   = gui.Window.get();
global.clients      = {};

$.each(global.settings.networks, function(key, value) {
    $("#status").html("Connecting to " + value.ip);
    global.clients[key] = value;
    global.clients[key].client  = new irc.Client(value.ip, global.settings.nickname, {
                                    channels: value.channels,
                                  });
});

console.log(global.clients);

$.each(global.clients, function(key, value) {
    value.print = function(message, sender) {
        sender = typeof sender !== 'undefined' ? sender : "*";
        var d = new Date();
        var time = "[" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "] ";
        $("#chatlist").append('<tr>' +
                              '<td class="timestamp col-xs-1">' + time + '</td>' +
                              '<td class="nickname text-right col-xs-1">' + sender + ':</td>' +
                              '<td class="message"><pre>' + message + '</pre></td>' + 
                              '</tr>');
    };
    
    var client = value.client;
    client.addListener('message', function (from, to, message) {
        console.log(from + ' => ' + to + ': ' + message);
        value.print(message, from);
    });

    client.addListener('error', function(message) {
        console.log('error: ', message);
        value.print(message);
    });

    client.addListener('names', function(channel, nicks) {
        console.log('nicks: ', channel, nicks);
        var formatted;
        $.each(nicks, function(nick, perms) {
            formatted += nick + " ";          
        });
        value.print("Connected users: " + formatted);
    });
                    
    client.addListener('registered', function(message) {
//{"prefix":"warden.esper.net","server":"warden.esper.net","command":"rpl_welcome","rawCommand":"001","commandType":"reply","args":["rirc","Welcome to the EsperNet Internet Relay Chat Network rirc"]}    
        value.print(message.args[1], message.prefix);     
    });
                    
    client.addListener('motd', function(motd) {
// 
        value.print(motd);     
    });
});

global.clients.current = 0;
console.log(global.clients);

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
            client = global.clients[global.clients.current].client;
            client.say("#rirc", $(this).val());
            $(this).val("");
        }
    });

    global.mainWindow.show();
}