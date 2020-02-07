# HealthMonitor
This [Roll20](http://roll20.net/) script automatically adds a color aura to tokens to indicate a "wounded" or "dying" status based on a percentage of the token's HP to it's max HP. It only affects tokens for characters that are not controlled by a player, i.e. NPCs and monsters. This provides an alternative to using token markers for this purpose if you already use a number of token markers and want to avoid crowding and confusion.

HealthMonitor will remove the aura when the token receives a marker to indicate death. This marker can be changed to match your game.

## Options
In the config menu (`!hm config`) you can change various options to suit your game, including
- Customizing the threshold for both "wounded" and "dying" statuses. These are percentages, with the "wounded" threshold being larger than the "dying" one. The script *will enforce* keeping the "wounded" threshold the larger of the two. The defaults are 50% and 25%.
- Customizing the aura color for both "wounded" and "dying" statuses. These must be hexadecimal color values. The defaults are a yellow (#FFCC00) and a red (#CC0000). Three digit hexes are allowed.
- The token marker being used to indicate death. The default is the "dead" (big red X) marker, but you can set it to any token marker desired. The Config Menu provides a "Choose Marker" button to display all token markers *including custom token markers* for easy selection, or you can use the "set manually" link to provide the name or name::ID combo for any valid token markers.
- Which bar is being used to indicate character health for *all tokens*. The default is Bar 1. The bar you choose must be using a max HP for HealthMonitor to work.
- In case the default Aura 1 is in use for another purpose in your game, you may switch to using Aura 2.
- Set whether to allow HealthMonitor to enforce the max value on your health bar to prevent the current HP from being higher than the max. Default is Off.
