/*
HealthMonitor
Description of script

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
https://www.patreon.com/benscripts
*/

var HealthMonitor = HealthMonitor || (function () {
    'use strict';

    //---- INFO ----//

    var version = '1.0',
    debugMode = false,
    MARKERS,
    ALT_MARKERS = [{name:'red', tag: 'red', url:"#C91010"}, {name: 'blue', tag: 'blue', url: "#1076C9"}, {name: 'green', tag: 'green', url: "#2FC910"}, {name: 'brown', tag: 'brown', url: "#C97310"}, {name: 'purple', tag: 'purple', url: "#9510C9"}, {name: 'pink', tag: 'pink', url: "#EB75E1"}, {name: 'yellow', tag: 'yellow', url: "#E5EB75"}, {name: 'dead', tag: 'dead', url: "X"}],
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;'
    },

    checkInstall = function () {
        if (!_.has(state, 'HealthMonitor')) state['HealthMonitor'] = state['HealthMonitor'] || {};
        if (typeof state['HealthMonitor'].healthBar == 'undefined') state['HealthMonitor'].healthBar = 'bar1';
        if (typeof state['HealthMonitor'].useAura1 == 'undefined') state['HealthMonitor'].useAura1 = true;
        if (typeof state['HealthMonitor'].woundedLevel == 'undefined') state['HealthMonitor'].woundedLevel = 0.5;
        if (typeof state['HealthMonitor'].woundedColor == 'undefined') state['HealthMonitor'].woundedColor = '#FFCC00';
        if (typeof state['HealthMonitor'].dyingLevel == 'undefined') state['HealthMonitor'].dyingLevel = 0.25;
        if (typeof state['HealthMonitor'].dyingColor == 'undefined') state['HealthMonitor'].dyingColor = '#CC0000';
        if (typeof state['HealthMonitor'].deadMarker == 'undefined') state['HealthMonitor'].deadMarker = 'dead';
        if (typeof state['HealthMonitor'].enforceMax == 'undefined') state['HealthMonitor'].enforceMax = false;
        MARKERS = JSON.parse(Campaign().get("token_markers"));
        log('--> HealthMonitor v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'HealthMonitor v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><a style="' + styles.textButton + '" href="!hm config">Show config</a>', 'GM');
		}
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!hm')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1] && playerIsGM(msg.playerid)) {
				switch (parms[1]) {
                    case 'markers':
                        commandShowMarkers(msg);
						break;
                    case 'set-marker':
                        commandSetMarker(msg, msg.content.split(/\s+/i).pop().toLowerCase());
						break;
                    case 'config':
                    default:
                        commandConfig(msg);
				}
			} else {
				commandConfig(msg);
			}
		}
    },

    commandConfig = function (msg) {
        var marker_style = 'margin: 5px 10px 0 0; display: block; float: left;';
        var message = '', err = '', parms = msg.content.replace('!hm config ', '').split(/\s*\-\-/i);
        _.each(parms, function (x) {
            var action = x.trim().split(/\s*\|\s*/i);
            if (action[0] == 'wounded-level' && action[1] != '' && isNum(action[1]) && parseInt(action[1]) < 100 && parseInt(action[1]) > 0) {
                state['HealthMonitor'].woundedLevel = parseInt(action[1]) / 100;
            }
            if (action[0] == 'wounded-color') {
                if (action[1].match(/^([0-9a-fA-F]{3}){1,2}$/) !== null) state['HealthMonitor'].woundedColor = '#' + action[1];
            }
            if (action[0] == 'dying-level' && action[1] != '' && isNum(action[1]) && parseInt(action[1]) < 100 && parseInt(action[1]) > 0) {
                state['HealthMonitor'].dyingLevel = parseInt(action[1]) / 100;
            }
            if (action[0] == 'dying-color') {
                if (action[1].match(/^([0-9a-fA-F]{3}){1,2}$/) !== null) state['HealthMonitor'].dyingColor = '#' + action[1];
            }
            if (action[0] == 'health-bar' && action[1] != '') {
                if (action[1].trim().match(/^bar[1-3]$/) !== null) state['HealthMonitor'].healthBar = action[1].trim();
            }
            if (action[0] == 'aura-toggle') state['HealthMonitor'].useAura1 = !state['HealthMonitor'].useAura1;
            if (action[0] == 'max-toggle') state['HealthMonitor'].enforceMax = !state['HealthMonitor'].enforceMax;
        });

        if (state['HealthMonitor'].woundedLevel < state['HealthMonitor'].dyingLevel) {
            var tmp = state['HealthMonitor'].woundedLevel;
            state['HealthMonitor'].woundedLevel = state['HealthMonitor'].dyingLevel;
            state['HealthMonitor'].dyingLevel = tmp;
        }
        if (state['HealthMonitor'].woundedLevel == state['HealthMonitor'].dyingLevel) state['HealthMonitor'].woundedLevel += 0.01;

        message += '<div style=\'' + styles.title + '\'>Wounded Indicator</div>';
        message += 'The HP percentage where the token is marked as "wounded" is <b>' + parseInt(state['HealthMonitor'].woundedLevel * 100) + '</b> <a style="' + styles.textButton + '" href="!hm config --wounded-level|&#63;&#123;Percent&#124;' + parseInt(state['HealthMonitor'].woundedLevel * 100) + '&#125;">change</a><br><br>';
        message += 'The button below is your Wounded indicator color: <i>#' + state['HealthMonitor'].woundedColor.substr(1)
        + '</i>. To change, use the button to enter a hexadecimal color value without the hash (#).<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '; background-color: ' + state['HealthMonitor'].woundedColor + '; color: ' + getContrastColor(state['HealthMonitor'].woundedColor) + '" href="!hm config --wounded-color|&#63;&#123;Wounded Color&#124;' + state['HealthMonitor'].woundedColor.substr(1) + '&#125;" title="Change the Wounded indicator color">Change 🎨</a></div>';

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Dying Indicator</div>';
        message += 'The HP percentage where the token is marked as "dying" or near death is <b>' + parseInt(state['HealthMonitor'].dyingLevel * 100) + '</b> <a style="' + styles.textButton + '" href="!hm config --dying-level|&#63;&#123;Percent&#124;' + parseInt(state['HealthMonitor'].dyingLevel * 100) + '&#125;">change</a><br><br>';
        message += 'The button below is your Dying indicator color: <i>#' + state['HealthMonitor'].dyingColor.substr(1)
        + '</i>. To change, use the button to enter a hexadecimal color value without the hash (#).<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '; background-color: ' + state['HealthMonitor'].dyingColor + '; color: ' + getContrastColor(state['HealthMonitor'].dyingColor) + '" href="!hm config --dying-color|&#63;&#123;Dying Color&#124;' + state['HealthMonitor'].dyingColor.substr(1) + '&#125;" title="Change the Dying indicator color">Change 🎨</a></div>';

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Options</div>';
        message += '<b>Health Bar: ' + state['HealthMonitor'].healthBar.replace('bar', 'Bar ') + '</b> <a style="' + styles.textButton + '" href="!hm config --health-bar|&#63;&#123;Health Bar&#124;Bar 1,bar1&#124;Bar 2,bar2&#124;Bar 3,bar3&#125;" title="Change which bar indicates health.">change</a><br>';
        message += 'Indicates which token bar to monitor for health.<br>';
        message += '<br><b>Aura: Aura ' + (state['HealthMonitor'].useAura1 ? '1' : '2') + '</b> <a style="' + styles.textButton + '" href="!hm config --aura-toggle" title="Toggle the aura use setting">change</a><br>';
        message += 'Indicates which aura to use when showing "wounded" or "dying" status.<br>';
        message += '<br><b>Enforce Max: ' + (state['HealthMonitor'].enforceMax ? 'On' : 'Off') + '</b> <a style="' + styles.textButton + '" href="!hm config --max-toggle" title="Toggle the enforce max setting">change</a><br>';
        message += 'Whether or not to enforce the max value on the Health Bar for <i>all tokens</i>.';

        var curr_marker = _.find(MARKERS, function (x) { return x.tag == state['HealthMonitor'].deadMarker; });
        if (typeof curr_marker == 'undefined') curr_marker = _.find(ALT_MARKERS, function (x) { return x.tag == state['HealthMonitor'].deadMarker; });
        message += '<hr style="margin: 8px 12px;"><div style=\'' + styles.title + '\'>Dead Marker</div>' + getMarker(curr_marker.tag, marker_style) + 'This is the current token marker used to indicate death. You may change it below.';
        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!hm markers" title="This may result in a very long list...">Choose Marker</a></div>';
        message += '<div style="text-align: center;"><a style="' + styles.textButton + '" href="!hm --set-marker &#63;&#123;Token Marker&#124;&#125;">Set manually</a></div><br>';

        message += '<hr style="margin: 4px 12px 8px;">See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/HealthMonitor">documentation</a> for complete instructions.<br>';
        showDialog('', message);
    },

    commandSetMarker = function (msg, marker) {
        marker = marker.replace('=', '::');
        var status_markers = _.pluck(MARKERS, 'tag');
        _.each(_.pluck(ALT_MARKERS, 'tag'), function (x) { status_markers.push(x); });
        if (_.find(status_markers, function (tmp) {return tmp === marker; })) {
            state['HealthMonitor'].deadMarker = marker;
        } else {
            showDialog('Error', 'The token marker "' + marker + '" is invalid. Please try again.');
        }
        commandConfig(msg);
    },

    commandShowMarkers = function () {
        var message = '<table style="border: 0; width: 100%;" cellpadding="0" cellspacing="2">';
        _.each(ALT_MARKERS, function (marker) {
            message += '<tr><td>' + getMarker(marker.tag, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + marker.name + '</td>';
            if (marker.tag == state['HealthMonitor'].deadMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!hm set-marker ' + marker.tag + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        _.each(MARKERS, function (icon) {
            message += '<tr><td>' + getMarker(icon.tag, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + icon.name + '</td>';
            if (icon.tag == state['HealthMonitor'].deadMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!hm set-marker ' + icon.tag.replace('::','=') + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        message += '<tr><td colspan="3" style="text-align: center; padding: 2px;"><a style="' + styles.button + '" href="!hm --help">&#9668; Back</a></td></tr>';
        message += '</table>';
        showDialog('Choose Dead Marker', message);
    },

    getMarker = function (marker, style = '') {
        var return_marker = '',
        marker_style = 'width: 24px; height: 24px;' + style,
        status_markers = _.pluck(MARKERS, 'tag'),
        alt_marker = _.find(ALT_MARKERS, function (x) { return x.tag == marker; });

        if (_.find(status_markers, function (x) { return x == marker; })) {
            var icon = _.find(MARKERS, function (x) { return x.tag == marker; });
            return_marker = '<img src="' + icon.url + '" width="24" height="24" style="' + marker_style + '" />';
        } else if (typeof alt_marker !== 'undefined') {
            if (alt_marker.url === 'X') {
                marker_style += 'color: #C91010; font-size: 30px; line-height: 24px; font-weight: bold; text-align: center; padding-top: 0px; overflow: hidden;';
                return_marker = '<div style="' + marker_style + '">X</div>';
            } else {
                marker_style += 'background-color: ' + alt_marker.url + '; border: 1px solid #fff; border-radius: 50%;';
                return_marker = '<div style="' + marker_style + '"></div>';
            }
        } else {
            return_marker = '<div style="' + marker_style + ' color: #c00;">--</div>';
        }
        return return_marker;
    },

    showDialog = function (title, content) {
        // Outputs a pretty box in chat with a title and content
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        sendChat('HealthMonitor', '/w GM ' + body, null, {noarchive:true});
    },

    isNum = function (txt) {
        // Returns whether or not a string is actually a Number
        var nr = /^\d+$/;
        return nr.test(txt);
    },

    getContrastColor = function (color) {
        if (color.slice(0, 1) === '#') color = color.slice(1);
        if (color.length === 3) {
            color = color.split('').map(function (hex) {
                return hex + hex;
            }).join('');
        }
        var r = parseInt(color.substr(0, 2), 16);
        var g = parseInt(color.substr(2, 2), 16);
        var b = parseInt(color.substr(4, 2), 16);
        var ratio = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (ratio >= 128) ? 'black' : 'white';
    },

    handleTokenChange = function (obj, prev) {
        // Change a token's aura to indicate how close to death they are
        if (obj.get("represents") !== '') {
    		let maxHP = parseInt(obj.get(state['HealthMonitor'].healthBar + '_max'));
    		let curHP = parseInt(obj.get(state['HealthMonitor'].healthBar + '_value'));
    		var myChar = getObj("character", obj.get('represents'));
    		if (myChar.get('controlledby') == '') {
    			if (isNum(maxHP) && isNum(curHP) && curHP < (maxHP * state['HealthMonitor'].woundedLevel)) {
                    if (state['HealthMonitor'].useAura1) obj.set({aura1_radius: '0.5', aura1_color: state['HealthMonitor'].woundedColor, aura1_square: false, showplayers_aura1: true});
                    else obj.set({aura2_radius: '0.5', aura2_color: state['HealthMonitor'].woundedColor, aura2_square: false, showplayers_aura2: true});
    			}
    			if (isNum(maxHP) && isNum(curHP) && curHP < (maxHP * state['HealthMonitor'].dyingLevel)) {
                    if (state['HealthMonitor'].useAura1) obj.set({aura1_radius: '0.5', aura1_color: state['HealthMonitor'].dyingColor, aura1_square: false, showplayers_aura1: true});
                    else obj.set({aura2_radius: '0.5', aura2_color: state['HealthMonitor'].dyingColor, aura2_square: false, showplayers_aura2: true});

    			}
    			if (isNum(maxHP) && isNum(curHP) && curHP > (maxHP * state['HealthMonitor'].woundedLevel)) {
                    if (state['HealthMonitor'].useAura1)obj.set('aura1_radius', '');
                    else obj.set('aura2_radius', '');
    			}
    		}

    		// Enforce max on bar1 (Health)
    		if (state['HealthMonitor'].enforceMax && curHP > maxHP) {
                switch (state['HealthMonitor'].healthBar) {
                    case 'bar3':
                        obj.set('bar3_value', maxHP);
                        break;
                    case 'bar2':
                        obj.set('bar2_value', maxHP);
                        break;
                    case 'bar1':
                    default:
                        obj.set('bar1_value', maxHP);
                        break;
                }
    		}
    	}
    },

    handleBar1Change = function (obj, prev) { if (state['HealthMonitor'].healthBar == 'bar1') handleTokenChange(obj, prev); },
    handleBar2Change = function (obj, prev) { if (state['HealthMonitor'].healthBar == 'bar2') handleTokenChange(obj, prev); },
    handleBar3Change = function (obj, prev) { if (state['HealthMonitor'].healthBar == 'bar3') handleTokenChange(obj, prev); },

    handleDeath = function (obj, prev) {
        // Remove aura indicator if dead
    	if (obj.get("represents") !== '' && obj.get("status_dead")) {
    		obj.set('aura1_radius', '');
    	}
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on('change:token:bar1_value', handleBar1Change);
        on('change:token:bar2_value', handleBar2Change);
        on('change:token:bar3_value', handleBar3Change);
        on('change:token:statusmarkers', handleDeath);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    HealthMonitor.checkInstall();
    HealthMonitor.registerEventHandlers();
});
