# Forest Antler Tracker

A precise, live resource/crafting tracker for FarmRPG Forest, supporting the Resource Saver perk (multi-step, matches true game mechanics).

- Tracks Antlers, Straw, Clicks (session)
- Calculates *actual* maximum Large Net production in real time (considers every bottleneck: Antlers, Straw, all sub-crafting chains)
- Supports 45% Resource Saver (or any other rate, configurable)
- Responsive, minimal, clean UI
- **Does NOT automate, does not send requests, and does not break FarmRPG rules!**

## What does it do?
- Counts your Forest drops (Antlers, Straw) and Clicks
- Shows your true Large Net crafting potential, at every point
- All calculations match the official Resource Saver perk (applied at every step in the crafting chain)

## Is this allowed in FarmRPG?
> **YES!**
> This script is 100% FarmRPG-legal.
>
> - It only reads visible information from the web page (DOM parsing)
> - It does NOT send server requests, automate gameplay, click for you, or interact with the backend
> - No data is ever sent anywhere or used to gain an unfair advantage
>
> It simply displays better/more transparent numbers to help you plan your crafting and understand your true output.

## Installation
1. Install [Tampermonkey](https://tampermonkey.net/) (or any userscript manager)
2. Click [here to install the script](https://github.com/LiquidTokyo/forest-antler-tracker/blob/main/Forest%20Antler%20Tracker-1.0.user.js)
3. Visit the Forest area in FarmRPG, start exploring!

## License
MIT
