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
    global.clients[key].print = function(message, sender) {
        sender = typeof sender !== 'undefined' ? sender : "*";
        var d = new Date();
        var time = "[" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "] ";
        var list = $("#chatlist");
        list.append('<tr>' +
                              '<td class="timestamp">' + time + '</td>' +
                              '<td class="nickname text-right">' + sender + ':</td>' +
                              '<td class="message"><pre>' + message + '</pre></td>' + 
                              '</tr>');
        var chatbuffer = $("#chatbuffer");
        chatbuffer.scrollTop(list[0].scrollHeight);
    };
    global.clients[key].print("Connecting to " + value.ip + " as " + global.settings.nickname);
    global.clients[key].client  = new irc.Client(value.ip, global.settings.nickname, {
                                    channels: value.channels,
                                  });
});

console.log(global.clients);

$.each(global.clients, function(key, value) {
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
        console.log(nicks);
        var formatted = 'Connected users: ';
        $.each(nicks, function(nick, perms) {
            formatted += nick + " ";          
        });
        value.print(formatted);
    });
                    
    client.addListener('registered', function(message) {
//{"prefix":"warden.esper.net","server":"warden.esper.net","command":"rpl_welcome","rawCommand":"001","commandType":"reply","args":["rirc","Welcome to the EsperNet Internet Relay Chat Network rirc"]}    
        value.print('Connected to ' + message.server + ' as ' + global.settings.nickname);
        value.print(message.args[1], message.prefix);   
    });
                    
    client.addListener('motd', function(motd) {
        value.print(motd);
    });

    client.addListener('topic', function(channel, topic, nick, message) {
        console.log(message);
        var time = new Date(message.args[3] * 1000);
        value.print('Topic set by ' + message.args[2] + ' on ' + time.toTimeString() + ' - ' + topic, message.prefix);     
    });
                    
    client.addListener('join', function(channel, nick, message) {
        console.log(message);
        value.print(nick + " joined " + channel);     
    });
                    
    client.addListener('part', function(channel, nick, reason, message) {
        console.log(message);
        value.print(nick + ' left ' + channel + '(' + reason + ')');     
    });
                    
    client.addListener('quit', function(nick, reason, channels, message) {
        console.log(message);
        value.print(nick + ' left ' + channel + '(' + reason + ')');     
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
            var message = $(this).val();
            var client = global.clients[global.clients.current].client;
            global.clients[global.clients.current].print(message, global.settings.nickname);
            client.say("#rirc", message );
            $(this).val("");
        }
    });

    global.mainWindow.show();
}