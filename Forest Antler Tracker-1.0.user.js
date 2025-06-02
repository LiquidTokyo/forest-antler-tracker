// ==UserScript==
// @name         Forest Antler Tracker
// @namespace    FarmRPG Custom
// @version      1.0
// @author       LiquidTokyo feat. ChatGPT
// @description  Shows Antlers per Click & true Large Net production (full crafting chain, Resource Saver 45% on every step!)
// @match        https://farmrpg.com/*
// @match        https://*.farmrpg.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let clickCount = 0;
    let antlerCount = 0;
    let strawCount = 0;
    let displayAntlersPerClick = "0.00";

    // Resource Saver Settings
    const RESOURCE_SAVER = 0.45; // 45% less resources needed per step
    const RS = (x) => x / (1 - RESOURCE_SAVER); // Converts effective to base for backwards calculation

    // Constants for each step (per item)
    // Twine: 2 Straw -> 1 Twine
    // Rope: 3 Twine -> 1 Rope
    // Fishing Net: 1 Antler + 2 Rope -> 1 Fishing Net
    // Large Net: 25 Fishing Nets -> 1 Large Net

    // For backwards calculation:
    // Given: Large Nets, how much of each base resource needed
    // Forwards: Given: Antler, Straw - how many Large Nets possible?

    function isOnForestPage() {
        return location.hash && location.hash.includes('area.php?id=7');
    }

    function insertStatBox() {
        if (document.getElementById('forest-stat-box')) return;
        let statBox = document.createElement('div');
        statBox.id = 'forest-stat-box';
        statBox.style = `
            margin: 18px auto 0 auto;
            padding: 16px 24px;
            background: #24282f;
            color: #e5f6ce;
            border-radius: 14px;
            font-size: 15px;
            max-width: 98vw;
            min-width: 330px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            box-shadow: 0 2px 8px #0005;
            gap: 24px;
        `;
        statBox.innerHTML = `
            <div style="flex:1 1 0; min-width: 220px;">
              <b>Forest Stats (Session)</b>
              <hr style="border:0; border-top:1px solid #3a3a3a; margin:6px 0 10px 0;">
              Clicks: <span id="stat-clicks">0</span><br>
              <u>Finds:</u><br>
              - Antlers: <span id="stat-antlers">0</span><br>
              - Straw: <span id="stat-straw">0</span><br>
              Antlers/Click: <span id="stat-antlers-per-click">0.00</span><br>
              <button id="reset-forest-stats" style="margin-top:12px;font-size:13px;padding:2px 10px;background:#3b3b36;color:#cfeea4;border:1px solid #3b3b36;border-radius:8px;cursor:pointer;">Reset</button>
            </div>
            <div style="flex:1 1 0; min-width: 220px; border-left: 2px solid #404040; padding-left: 24px;">
              <b>Large Net Production</b>
              <hr style="border:0; border-top:1px solid #3a3a3a; margin:6px 0 10px 0;">
              <span style='color:#9be48d'><b>Resource Saver:</b> -45% at every step</span><br>
              Max by Antlers: <span id="stat-maxnet-antler">0</span><br>
              Max by Straw: <span id="stat-maxnet-straw">0</span><br>
              <b>Total Possible Large Nets:</b> <span id="stat-largenets">0</span><br>
              <span style='font-size:12px;color:#cfc;'>Antler/Net: <span id='stat-antler-cost'>-</span><br>Straw/Net: <span id='stat-straw-cost'>-</span></span>
            </div>
        `;
        let optionsList = document.getElementById('exploreoptions');
        if (optionsList) {
            optionsList.parentNode.appendChild(statBox);
            document.getElementById('reset-forest-stats').onclick = function() {
                clickCount = 0;
                antlerCount = 0;
                strawCount = 0;
                displayAntlersPerClick = "0.00";
                updateStatBox();
            }
        }
        window.addEventListener('resize', adjustStatBoxWidth);
        adjustStatBoxWidth();
    }

    function adjustStatBoxWidth() {
        let box = document.getElementById('forest-stat-box');
        if (!box) return;
        if (window.innerWidth < 600) {
            box.style.flexDirection = 'column';
            box.style.padding = '8px 4px';
            let divs = box.querySelectorAll('div');
            if(divs[1]) divs[1].style.borderLeft = '0';
            if(divs[1]) divs[1].style.paddingLeft = '0';
        } else {
            box.style.flexDirection = 'row';
            box.style.padding = '16px 24px';
            let divs = box.querySelectorAll('div');
            if(divs[1]) divs[1].style.borderLeft = '2px solid #404040';
            if(divs[1]) divs[1].style.paddingLeft = '24px';
        }
    }

    function updateStatBox() {
        let c = document.getElementById('stat-clicks');
        let a = document.getElementById('stat-antlers');
        let s = document.getElementById('stat-straw');
        let apc = document.getElementById('stat-antlers-per-click');
        let lna = document.getElementById('stat-maxnet-antler');
        let lns = document.getElementById('stat-maxnet-straw');
        let ln = document.getElementById('stat-largenets');
        let antlerCost = document.getElementById('stat-antler-cost');
        let strawCost = document.getElementById('stat-straw-cost');
        if (!c) return;
        c.textContent = clickCount;
        a.textContent = antlerCount;
        s.textContent = strawCount;
        apc.textContent = displayAntlersPerClick;

        // --- Multi-Step Resource Saver Calculation ---
        // Step 1: Max possible Twine from Straw
        //    2 Straw -> 1 Twine, 45% saved (need only 55%)
        let twine = strawCount / (2 * (1 - RESOURCE_SAVER));
        // Step 2: Max Rope from Twine (3 Twine -> 1 Rope, 45% saved)
        let rope = twine / (3 * (1 - RESOURCE_SAVER));
        // Step 3: Max FNs from Rope (2 Rope -> 1 FN, 45% saved)
        let fn_by_rope = rope / (2 * (1 - RESOURCE_SAVER));
        // Step 4: Max FNs from Antlers (1 Antler -> 1 FN, 45% saved)
        let fn_by_antler = antlerCount / (1 * (1 - RESOURCE_SAVER));
        // Final FNs: bottleneck
        let fishingNets = Math.floor(Math.min(fn_by_rope, fn_by_antler));
        // Step 5: Max Large Nets (25 FNs -> 1 LN, 45% saved)
        let maxLargeNets = Math.floor(fishingNets / (25 * (1 - RESOURCE_SAVER)));
        // Effective cost per Large Net
        let antlerPerNet = (1 * (1 - RESOURCE_SAVER)) * (25 * (1 - RESOURCE_SAVER));
        let strawPerNet = (2 * (1 - RESOURCE_SAVER)) * (3 * (1 - RESOURCE_SAVER)) * (2 * (1 - RESOURCE_SAVER)) * (25 * (1 - RESOURCE_SAVER));
        // Max by resource (theoretical, not including the rope/twine bottleneck)
        let maxByAntlers = Math.floor(antlerCount / antlerPerNet);
        let maxByStraw = Math.floor(strawCount / strawPerNet);

        lna.textContent = maxByAntlers;
        lns.textContent = maxByStraw;
        ln.textContent = maxLargeNets;
        antlerCost.textContent = antlerPerNet.toFixed(2);
        strawCost.textContent = strawPerNet.toFixed(2);
    }

    function setupExploreListener() {
        let exploreBtn = document.querySelector('.item-content.explorebtn');
        if (exploreBtn && !exploreBtn.dataset.hasstatlistener) {
            exploreBtn.addEventListener('click', () => setTimeout(handleExploreClick, 250));
            exploreBtn.dataset.hasstatlistener = "1";
        }
        let mainClickArea = document.getElementById('exploreconsole');
        if (mainClickArea && !mainClickArea.dataset.hasstatlistener) {
            mainClickArea.addEventListener('click', () => setTimeout(handleExploreClick, 250));
            mainClickArea.dataset.hasstatlistener = "1";
        }
    }

    function handleExploreClick() {
        clickCount++;
        let consoleDiv = document.getElementById('exploreconsole');
        let roundAntlers = 0, roundStraw = 0;
        if (consoleDiv) {
            let imgs = consoleDiv.querySelectorAll('img[alt]');
            imgs.forEach(img => {
                let alt = img.getAttribute('alt');
                if (alt === "Antler") roundAntlers++;
                if (alt === "Straw") roundStraw++;
            });
        }
        antlerCount += roundAntlers;
        strawCount += roundStraw;
        if (clickCount % 10 === 0) {
            displayAntlersPerClick = (antlerCount / clickCount).toFixed(2);
        }
        updateStatBox();
    }

    function resetStats() {
        clickCount = 0;
        antlerCount = 0;
        strawCount = 0;
        displayAntlersPerClick = "0.00";
    }

    window.addEventListener('hashchange', () => {
        if (!isOnForestPage()) {
            let box = document.getElementById('forest-stat-box');
            if (box) box.remove();
            resetStats();
        } else {
            setTimeout(() => {
                insertStatBox();
                setupExploreListener();
                updateStatBox();
            }, 350);
        }
    });

    function trySetup() {
        if (isOnForestPage()) {
            insertStatBox();
            setupExploreListener();
            updateStatBox();
        }
    }

    const observer = new MutationObserver(() => {
        if (isOnForestPage()) {
            insertStatBox();
            setupExploreListener();
            updateStatBox();
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});

    window.addEventListener('load', trySetup);
    setTimeout(trySetup, 1000);

})();
