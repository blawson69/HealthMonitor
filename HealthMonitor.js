/*
HealthMonitor
A NPC health indicator for Roll20 games

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
https://www.patreon.com/benscripts
*/

var HealthMonitor = HealthMonitor || (function () {
    'use strict';

    //---- INFO ----//

    var version = '2.0',
    debugMode = false,
    MARKERS,
    ALT_MARKERS = [{name:'red', tag: 'red', url:"#C91010"}, {name: 'blue', tag: 'blue', url: "#1076C9"}, {name: 'green', tag: 'green', url: "#2FC910"}, {name: 'brown', tag: 'brown', url: "#C97310"}, {name: 'purple', tag: 'purple', url: "#9510C9"}, {name: 'pink', tag: 'pink', url: "#EB75E1"}, {name: 'yellow', tag: 'yellow', url: "#E5EB75"}, {name: 'dead', tag: 'dead', url: "X"}],
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;'
    },
    LAST_WORD = ["So, it has come to this...", "Is this why fate brought us together?", "And thus, I die...", "As the prophecy foretold...", "Just like in my dream...", "Such a cruel, cruel world...", "No mercy for the dying?", "Death is nothing, but to live defeated and inglorious is to die daily.", "Death makes us all equal.", "There is no escape from destiny...", "That's what she said...", "Death is but the next great adventure...", "Ask not for whom the bell tolls...", "I see a bright light...", "Not again!?...", "How could you do this to me?", "Well, shit.", "It's just a flesh wound...", "I've had worse...", "Tell momma I'll see her soon...", "Arrggg!", "Mother... fucker...", "Aaahhhh!", "And I was so young...", "Next time for sure...", "Wait! I concede! Please...", "Damn it...", "You're so mean!", "This is the last of my world. I am content.", "I want nothing but death.", "Don't die like I did.", "I'm bored with it all.", "It's better to burn out than to fade away!", "I do not believe in my death.", "I'm tired. So tired...", "I know now why you cry. But it's something I can never do. Goodbye.", "I can't lie to you about your chances... but you have my sympathies.", "I was supposed to die in France. I never even saw France...", "A plague on both your houses!", "In the words of my generation, ‘up yours!’", "I need to tell you something. It's about your father. He...", "It's been a funny sort of day, hasn't it?", "If you strike me down, I shall become more powerful than you can possibly imagine.", "Ah, you cursed brat! Look what you've done! What a world...", "Rosebud.", "I'll see you in another life... when we are both cats.", "I am a leaf on the wind. Watch how I...", "I've seen things you people wouldn't believe. All those moments will be lost in time... like tears in rain... Time to die.", "The horror... the horror...", "Is that the best you can do, ya pansy?", "At least it's an honorable death.", "And I was to lead you to your destiny...", "And here I thought we were really getting to understand each other.", "I've been looking forward to this for a long time.", "I have paid the price for my lack of vision...", "I don't feel so good...", "What have you done!?", "You see, madness, as you know, is like gravity. All it takes is a little push!", "What is your major malfunction, numb-nuts? Didn't Mommy and Daddy show you enough attention when you were a child?", "I am... inevitable.", "I'm not sorry.", "Oh, no no no no... no, it's not fair!", "I want my mommy!", "Hail Hydra", "Game over.", "It's a joke. It's all a joke. Mother, forgive me.", "Whatever I've done, I'm s--"],

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
        if (typeof state['HealthMonitor'].showLastWord == 'undefined') state['HealthMonitor'].showLastWord = false;

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
        var bars = {bar1: 'Bar 1', bar2: 'Bar 2', bar3: 'Bar 3'};
        var message = '', err = '', parms = msg.content.replace('!hm config ', '').split(/\s*\-\-/i);
        _.each(parms, function (x) {
            var action = x.trim().split(/\s*\|\s*/i);
            if (action[1] && action[1].search('%') !== -1) action[1] = action[1].replace('%', '');
            if (action[0] == 'wounded-level' && action[1] != '' && isNum(action[1]) && parseInt(action[1]) < 100 && parseInt(action[1]) > 0) {
                state['HealthMonitor'].woundedLevel = parseInt(action[1]) / 100;
            }
            if (action[0] == 'wounded-color') {
                if (action[1].startsWith('#')) action[1] = action[1].substr(1);
                if (action[1].match(/^([0-9a-fA-F]{3}){1,2}$/) !== null) state['HealthMonitor'].woundedColor = '#' + action[1];
            }
            if (action[0] == 'dying-level' && action[1] != '' && isNum(action[1]) && parseInt(action[1]) < 100 && parseInt(action[1]) > 0) {
                state['HealthMonitor'].dyingLevel = parseInt(action[1]) / 100;
            }
            if (action[0] == 'dying-color') {
                if (action[1].startsWith('#')) action[1] = action[1].substr(1);
                if (action[1].match(/^([0-9a-fA-F]{3}){1,2}$/) !== null) state['HealthMonitor'].dyingColor = '#' + action[1];
            }
            if (action[0] == 'health-bar' && action[1] != '') {
                if (action[1].trim().match(/^bar[1-3]$/) !== null) state['HealthMonitor'].healthBar = action[1].trim();
            }
            if (action[0] == 'aura-toggle') state['HealthMonitor'].useAura1 = !state['HealthMonitor'].useAura1;
            if (action[0] == 'max-toggle') state['HealthMonitor'].enforceMax = !state['HealthMonitor'].enforceMax;
            if (action[0] == 'word-toggle') state['HealthMonitor'].showLastWord = !state['HealthMonitor'].showLastWord;
        });

        if (state['HealthMonitor'].woundedLevel < state['HealthMonitor'].dyingLevel) {
            var tmp = state['HealthMonitor'].woundedLevel;
            state['HealthMonitor'].woundedLevel = state['HealthMonitor'].dyingLevel;
            state['HealthMonitor'].dyingLevel = tmp;
        }
        if (state['HealthMonitor'].woundedLevel == state['HealthMonitor'].dyingLevel) state['HealthMonitor'].woundedLevel += 0.01;

        message += '<div style=\'' + styles.title + '\'>Wounded Indicator</div>';
        message += '"Wounded" threshold: <a style="' + styles.textButton + 'font-size: 1.25em;" href="!hm config --wounded-level|&#63;&#123;Percent (numbers only)&#124;' + parseInt(state['HealthMonitor'].woundedLevel * 100) + '&#125;" title="Change the Wounded thrshhold percent">' + parseInt(state['HealthMonitor'].woundedLevel * 100) + '</a>%<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '; background-color: ' + state['HealthMonitor'].woundedColor + '; color: ' + getContrastColor(state['HealthMonitor'].woundedColor) + '" href="!hm config --wounded-color|&#63;&#123;Enter hexadecimal value&#124;' + state['HealthMonitor'].woundedColor.substr(1) + '&#125;" title="Change the Wounded indicator color">Change 🎨</a></div>';

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Dying Indicator</div>';
        message += '"Dying" threshold: <a style="' + styles.textButton + 'font-size: 1.25em;" href="!hm config --dying-level|&#63;&#123;Percent (numbers only)&#124;' + parseInt(state['HealthMonitor'].dyingLevel * 100) + '&#125;" title="Change the Dying threshold percent">' + parseInt(state['HealthMonitor'].dyingLevel * 100) + '</a>%<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '; background-color: ' + state['HealthMonitor'].dyingColor + '; color: ' + getContrastColor(state['HealthMonitor'].dyingColor) + '" href="!hm config --dying-color|&#63;&#123;Enter hexadecimal value&#124;' + state['HealthMonitor'].dyingColor.substr(1) + '&#125;" title="Change the Dying indicator color">Change 🎨</a></div>';

        var curr_marker = _.find(MARKERS, function (x) { return x.tag == state['HealthMonitor'].deadMarker; });
        if (typeof curr_marker == 'undefined') curr_marker = _.find(ALT_MARKERS, function (x) { return x.tag == state['HealthMonitor'].deadMarker; });
        message += '<hr style="margin: 8px 12px;"><div style=\'' + styles.title + '\'>Dead Marker</div>' + getMarker(curr_marker, marker_style);
        if (typeof curr_marker == 'undefined') message += '<b style="color: #c00;">Warning:</b> The token marker "' + state['HealthMonitor'].deadMarker + '" is invalid!';
        else message += 'This is the current token marker used to indicate death. You may change it below.';
        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!hm markers" title="This may result in a very long list...">Choose Marker</a></div>';
        message += '<div style="text-align: center;"><a style="' + styles.textButton + '" href="!hm --set-marker &#63;&#123;Token Marker tag&#124;&#125;">Set manually</a></div><br>';

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Options</div>';
        message += '<b>Health Bar: ' + bars[state['HealthMonitor'].healthBar] + '</b> <a style="' + styles.textButton + '" href="!hm config --health-bar|&#63;&#123;Health Bar&#124;Bar 1,bar1&#124;Bar 2,bar2&#124;Bar 3,bar3&#125;" title="Change which bar indicates health.">choose</a><br>';
        message += 'Token bar to monitor for NPC health.<br>';
        message += '<br><b>Aura: Aura ' + (state['HealthMonitor'].useAura1 ? '1' : '2') + '</b> <a style="' + styles.textButton + '" href="!hm config --aura-toggle" title="Toggle the aura use setting">toggle</a><br>';
        message += 'Aura to use for "wounded" or "dying" status.<br>';
        message += '<br><b>Show Last Word: ' + (state['HealthMonitor'].showLastWord ? 'On' : 'Off') + '</b> <a style="' + styles.textButton + '" href="!hm config --word-toggle" title="Toggle the show last word setting">toggle</a><br>';
        message += 'Whether to show a dialog with the dead NPC\'s last words to players.<br>';
        message += '<br><b>Enforce Max: ' + (state['HealthMonitor'].enforceMax ? 'On' : 'Off') + '</b> <a style="' + styles.textButton + '" href="!hm config --max-toggle" title="Toggle the enforce max setting">toggle</a><br>';
        message += 'Whether to enforce max value on Health Bar for <i>all tokens</i>.';

        message += '<hr style="margin: 4px 12px 8px;"><p>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/HealthMonitor">documentation</a> for complete instructions.</p>';
        showDialog('', message, 'GM');
    },

    commandSetMarker = function (msg, marker) {
        marker = marker.replace('=', '::');
        var status_markers = _.pluck(MARKERS, 'tag');
        _.each(_.pluck(ALT_MARKERS, 'tag'), function (x) { status_markers.push(x); });
        if (_.find(status_markers, function (tmp) {return tmp === marker; })) {
            state['HealthMonitor'].deadMarker = marker;
        } else {
            showDialog('Error', 'The token marker "' + marker + '" is invalid. Please try again.', 'GM');
        }
        commandConfig(msg);
    },

    commandShowMarkers = function () {
        var message = '<table style="border: 0; width: 100%;" cellpadding="0" cellspacing="2">';
        _.each(ALT_MARKERS, function (marker) {
            message += '<tr><td>' + getMarker(marker, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + marker.name + '</td>';
            if (marker.tag == state['HealthMonitor'].deadMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!hm set-marker ' + marker.tag + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        _.each(MARKERS, function (icon) {
            message += '<tr><td>' + getMarker(icon, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + icon.name + '</td>';
            if (icon.tag == state['HealthMonitor'].deadMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!hm set-marker ' + icon.tag.replace('::','=') + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        message += '<tr><td colspan="3" style="text-align: center; padding: 2px;"><a style="' + styles.button + '" href="!hm --help">&#9668; Back</a></td></tr>';
        message += '</table>';
        showDialog('Choose Dead Marker', message, 'GM');
    },

    getMarker = function (marker, style = '') {
        var marker_style = 'width: 24px; height: 24px;' + style;
        var return_marker = '<img src="" width="24" height="24" style="' + marker_style + ' border: 1px solid #ccc;" alt=" " />';
        if (typeof marker != 'undefined' && typeof marker.tag != 'undefined') {
            var status_markers = _.pluck(MARKERS, 'tag'),
            alt_marker = _.find(ALT_MARKERS, function (x) { return x.tag == marker.tag; });

            if (_.find(status_markers, function (x) { return x == marker.tag; })) {
                var icon = _.find(MARKERS, function (x) { return x.tag == marker.tag; });
                return_marker = '<img src="' + icon.url + '" width="24" height="24" style="' + marker_style + '" title="' + icon.name + '" />';
            } else if (typeof alt_marker !== 'undefined') {
                if (alt_marker.url === 'X') {
                    marker_style += 'color: #C91010; font-size: 30px; line-height: 24px; font-weight: bold; text-align: center; padding-top: 0px; overflow: hidden;';
                    return_marker = '<div style="cursor: default;' + marker_style + '" title="dead">X</div>';
                } else {
                    marker_style += 'background-color: ' + alt_marker.url + '; border: 1px solid #fff; border-radius: 50%;';
                    return_marker = '<div style="cursor: default;' + marker_style + '" title="' + alt_marker.name + '"></div>';
                }
            }
        }
        return return_marker;
    },

    showLastWord = function (obj) {
        var died = ["has died", "has expired", "is gone for good", "has snuffed it", "has bitten the dust", "has checked out", "has perished", "has croaked", "has snuffed it", "has flatlined", "lives no more", "has been discontinued", "has kicked the bucket", "has passed away", "has passed on", "has succumbed to their wounds", "has shuffled off this mortal coil", "has ceased existing", "has bought the farm", "has met their maker", "has met their demise", "has cashed in their chips", "has been terminated", "has uttered their last breath", "has given up the ghost", "has gone the way of the dodo", "has said their last goodbye", "has gone to be with their Maker", "now sleeps the eternal sleep", "will be feeding the worms soon", "has gone to their reward", "didn't survive", "has gone the way of all flesh", "just met the Grim Reaper", "is history", "has been neutralized", "is no more", "is not with us any more", "has paid the ultimate price", "is pushing up daisies", "rides the pale horse", "has been struck down", "is taking a dirt nap", "has taken their final bow", "has turned up their toes", "will soon be wearing a pine overcoat", "has ceased to be", "got smoked", "went belly up", "bit the big one", "carked it", "has joined the choir invisible", "made the ultimate sacrifice"];
        var says = ["exclaims", "mutters", "states", "announces", "proclaims", "declares", "replies", "says", "remarks", "groans", "growls", "complains", "moans", "grunts", "sputters", "pontificates", "grumbles", "imparts", "utters", "whispers", "adds", "asserts", "claims", "responds", "opines"];

        //var title = '<div style=\'' + styles.title + '\'>Your foe ' + died[randomInteger(_.size(died)-1)] + '!</div>';
        var title = 'Your foe ' + died[randomInteger(_.size(died)-1)] + '!';
        //var content = '<strong>' + obj.get('name') + '</strong> ' + says[randomInteger(_.size(says)-1)] + ' "' + LAST_WORD[randomInteger(_.size(LAST_WORD)-1)] + '"';
        //var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        var message = '<strong>' + obj.get('name') + '</strong> ' + says[randomInteger(_.size(says)-1)] + ' "' + LAST_WORD[randomInteger(_.size(LAST_WORD)-1)] + '"';
        showDialog(title, message);
    },

    showDialog = function (title, content, whisperTo = '') {
        // Outputs a pretty box in chat with a title and content
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('HealthMonitor', whisperTo + body, null, {noarchive:true});
        } else {
            sendChat('', body);
        }
    },

    isNum = function (txt) {
        // Returns whether or not a string is actually a Number
        var nr = /^\-?\d+$/;
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

    //----- EXTERNAL API -----//
    updateToken = function (obj) {
        var curVal = parseInt(obj.get(state['HealthMonitor'].healthBar + '_value'));
        if (curVal > 0) handleTokenChange(obj);
        else {
            obj.set('status_' + state['HealthMonitor'].deadMarker, true);
            if (state['HealthMonitor'].useAura1) obj.set('aura1_radius', '');
            else obj.set('aura2_radius', '');
            if (state['HealthMonitor'].showLastWord) {
                setTimeout(function () { showLastWord(obj); }, 500);
            }
        }
    },

    //----- EVENT HANDLERS -----//

    handleTokenChange = function (obj) {
        // Change a token's aura to indicate how close to death they are
        if (obj.get("represents") !== '') {
    		let maxHP = obj.get(state['HealthMonitor'].healthBar + '_max');
    		let curHP = obj.get(state['HealthMonitor'].healthBar + '_value');
    		var myChar = getObj("character", obj.get('represents'));

    		if (isNum(maxHP) && isNum(curHP) && myChar.get('controlledby') == '') {
    			if (curHP < (maxHP * state['HealthMonitor'].woundedLevel)) {
                    if (state['HealthMonitor'].useAura1) obj.set({aura1_radius: '0.5', aura1_color: state['HealthMonitor'].woundedColor, aura1_square: false, showplayers_aura1: true});
                    else obj.set({aura2_radius: '0.5', aura2_color: state['HealthMonitor'].woundedColor, aura2_square: false, showplayers_aura2: true});
    			}
    			if (curHP < (maxHP * state['HealthMonitor'].dyingLevel)) {
                    if (state['HealthMonitor'].useAura1) obj.set({aura1_radius: '0.5', aura1_color: state['HealthMonitor'].dyingColor, aura1_square: false, showplayers_aura1: true});
                    else obj.set({aura2_radius: '0.5', aura2_color: state['HealthMonitor'].dyingColor, aura2_square: false, showplayers_aura2: true});

    			}
    			if (curHP > (maxHP * state['HealthMonitor'].woundedLevel)) {
                    if (state['HealthMonitor'].useAura1) obj.set('aura1_radius', '');
                    else obj.set('aura2_radius', '');
    			}
    		}

    		// Enforce max on bar1 (Health)
    		if (state['HealthMonitor'].enforceMax && curHP > maxHP) {
                obj.set(state['HealthMonitor'].healthBar + '_value', maxHP);
    		}
    	}
    },

    handleBar1Change = function (obj) { if (state['HealthMonitor'].healthBar == 'bar1') handleTokenChange(obj); },
    handleBar2Change = function (obj) { if (state['HealthMonitor'].healthBar == 'bar2') handleTokenChange(obj); },
    handleBar3Change = function (obj) { if (state['HealthMonitor'].healthBar == 'bar3') handleTokenChange(obj); },

    handleDeath = function (obj) {
        // Remove aura indicator if dead
    	if (obj.get("represents") !== '' && obj.get("status_" + state['HealthMonitor'].deadMarker)) {
            if (state['HealthMonitor'].useAura1) obj.set('aura1_radius', '');
            else obj.set('aura2_radius', '');
            if (state['HealthMonitor'].showLastWord) showLastWord(obj);
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
		registerEventHandlers: registerEventHandlers,
        updateToken: updateToken
	};
}());

on("ready", function () {
    HealthMonitor.checkInstall();
    HealthMonitor.registerEventHandlers();
});
