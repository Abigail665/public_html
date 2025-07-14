const widget_container = document.getElementById("widget-container");
const notification_container = document.getElementById("notification-container");
const stores = document.getElementsByClassName("store");
const score_element = document.getElementById("score");

const achievements = {
    greenThumb: {
        name: "Green Thumb",
        description: "Earn a total of 10,000 sqft.",
        unlocked: false,
        condition: (state) => state.score >= 10000,
    },
    masterGardener: {
        name: "Master Gardener",
        description: "Earn a total of 1,000,000 sqft.",
        unlocked: false,
        condition: (state) => state.score >= 1000000,
    },
    gompeiArmy: {
        name: "Gompei's Army",
        description: "Own 10 Gompeis.",
        unlocked: false,
        // Check for undefined in case no Gompeis are owned yet
        condition: (state) => (state.widgets.Gompei || 0) >= 10,
    },
}

let gameState = {
    score: 5,
    widgets: {},
    boosts: {},
    prestigePoints: 0,
}

function getPrestigeBonus() {
    // Each prestige point gives a 2% bonus to all gains.
    return 1 + (gameState.prestigePoints * 0.02);
}

function changeScore(amount) {
    // Apply prestige bonus only to positive score changes (earnings)
    if (amount > 0) {
        amount *= getPrestigeBonus();
    }
    gameState.score += Math.ceil(amount); // Use Math.ceil to avoid fractional scores
    updateUI(); // Centralize all UI updates
    checkAchievements();
}

function updateUI() {
    // Update score element
    score_element.innerHTML = "Score: " + gameState.score.toLocaleString();

    // Update store availability
    for (let store of stores) {
        let cost = parseInt(store.getAttribute("cost"));
        if (gameState.score < cost) {
            store.setAttribute("broke", "");
        } else {
            store.removeAttribute("broke");
        }
    }

    // Update all widget upgrade buttons
    const upgradeableWidgets = document.querySelectorAll(".widget[reap]");
    for (const widget of upgradeableWidgets) {
        // Skip super-gompei as it has a different upgrade path
        if (widget.id === 'super-gompei') continue;

        const reapDisplay = widget.querySelector('.reap-display');
        const upgradeBtn = widget.querySelector('.upgrade-button');
        if (!reapDisplay || !upgradeBtn) continue; // Skip if elements aren't created yet

        const currentReap = parseInt(widget.getAttribute("reap"));
        const upgradeCost = Math.ceil(currentReap * 5);

        reapDisplay.textContent = `+${currentReap}`;
        upgradeBtn.textContent = `Upgrade (${upgradeCost})`;

        if (gameState.score < upgradeCost) {
            upgradeBtn.setAttribute("disabled", "");
        } else {
            upgradeBtn.removeAttribute("disabled");
        }
    }
}

/**
 * Creates a new widget element in the DOM based on its name.
 * This is used for both buying new widgets and loading saved ones.
 * @param {string} name - The name of the widget to create (e.g., "Lawn").
 * @returns {HTMLElement|null} The created widget element or null if not found.
 */
function createWidgetElement(name) {
    const storeElement = Array.from(stores).find(s => s.getAttribute("name") === name);
    if (!storeElement) return null;

    const widget = storeElement.firstElementChild.cloneNode(true);
    widget.onclick = () => harvest(widget);
    widget_container.appendChild(widget);
    addUpgradeability(widget);

    if (widget.getAttribute("auto") == 'true') {
        widget.setAttribute("harvesting", "");
        setup_end_harvest(widget);
    }
    return widget;
}

function buy(store) {
    const cost = parseInt(store.getAttribute("cost"));
    if (gameState.score < cost) return;

    changeScore(-cost);

    const name = store.getAttribute("name");
    const itemType = store.dataset.type;

    // Always track the count of items purchased
    if (!gameState.widgets[name]) {
        gameState.widgets[name] = 0;
    }
    gameState.widgets[name]++;

    // Handle booster items (they don't create a physical widget)
    if (itemType === 'booster') {
        const target = store.dataset.boostTarget;
        const amount = parseFloat(store.dataset.boostAmount);

        if (!gameState.boosts[target]) {
            gameState.boosts[target] = 1.0; // Base multiplier
        }
        gameState.boosts[target] += amount;

        showNotification("Boost Purchased!", `${name} now boosts all ${target}s by an additional ${amount * 100}%!`);
        updateUI();
        return; // Exit after handling the boost
    }

    // Handle special upgrade logic for an existing Super-Gompei
    if (name === "Super-Gompei") {
        const super_gompei = document.querySelector("#widget-container #super-gompei")?.parentElement;
        if (super_gompei) {
            super_gompei.setAttribute("reap", (parseInt(super_gompei.getAttribute("reap")) + 100));
            document.body.style.setProperty('--gompei-count', gameState.widgets['Super-Gompei'] || 0);
            updateUI();
            return;
        }
    }

    // This part now only runs for creating NEW physical widgets
    if (name === 'Super-Gompei') {
        document.body.style.setProperty('--gompei-count', gameState.widgets['Super-Gompei'] || 0);
    }

    createWidgetElement(name);
    updateUI();
}

function addUpgradeability(widget) {
    // Super-Gompei has its own unique upgrade system, so we skip it.
    if (widget.id === 'super-gompei') return;

    // Create a display for the widget's current reap value
    const reapDisplay = document.createElement("p");
    reapDisplay.className = "reap-display";
    widget.appendChild(reapDisplay);

    // Create the upgrade button
    const upgradeBtn = document.createElement("button");
    upgradeBtn.className = "upgrade-button";
    widget.appendChild(upgradeBtn);

    upgradeBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent the harvest() click from firing
        const currentReap = parseInt(widget.getAttribute("reap"));
        const upgradeCost = Math.ceil(currentReap * 5);

        if (gameState.score < upgradeCost) return;
        changeScore(-upgradeCost);
        widget.setAttribute("reap", Math.ceil(currentReap * 1.2)); // Increase reap by 20%
        updateUI(); // Update all UI elements after the change
    };
}

function setup_end_harvest(widget) {
    setTimeout(() => {
        // Remove the harvesting flag
        widget.removeAttribute("harvesting");
        // If automatic, start again
        if (widget.getAttribute("auto") == 'true') {
            harvest(widget);
        }
    // Cooldown needs to be multiplied by 1000 to convert seconds to milliseconds
    }, parseFloat(widget.getAttribute("cooldown")) * 1000);
}

function harvest(widget) {
    // Only run if currently not harvesting
    if (widget.hasAttribute("harvesting")) return;
    // Set harvesting flag
    widget.setAttribute("harvesting", "");
    
    // Calculate the score to add
    const baseReap = parseInt(widget.getAttribute("reap"));
    const widgetName = widget.getAttribute("name");

    // Apply boost if one exists for this widget type
    const boostMultiplier = gameState.boosts[widgetName] || 1.0;
    const finalReap = Math.ceil(baseReap * boostMultiplier);
    
    // If manual, collect points now
    changeScore(finalReap);
    showPoint(widget, finalReap);

    setup_end_harvest(widget);
}


function showPoint(widget, points) {
    let number = document.createElement("span");
    number.className = "point";
    number.innerHTML = `+${points}`;
    number.onanimationend = () => number.remove();
    widget.appendChild(number);
}

function showNotification(title, message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
    notification_container.appendChild(notification);

    // Remove the notification from the DOM after its animation finishes
    setTimeout(() => {
        notification.remove();
    }, 4000); // Matches the animation duration
}

function checkAchievements() {
    for (const key in achievements) {
        const achievement = achievements[key];
        // Check if the achievement condition is met and it hasn't been unlocked yet
        if (!achievement.unlocked && achievement.condition(gameState)) {
            achievement.unlocked = true;
            console.log(`Achievement Unlocked: ${achievement.name}`);
            showNotification("Achievement Unlocked!", achievement.name);
        }
    }
}


// --- Save/Load System ---

function saveGame() {
    try {
        localStorage.setItem('gompeiClickerSave', JSON.stringify(gameState));
    } catch (e) {
        console.error("Could not save game state:", e);
        showNotification("Error", "Could not save game progress.");
    }
}

function loadGame() {
    const savedStateJSON = localStorage.getItem('gompeiClickerSave');
    if (!savedStateJSON) return; // No save file exists

    try {
        const savedState = JSON.parse(savedStateJSON);
        // Use Object.assign to safely merge the loaded state.
        // This prevents errors if you add new properties to the default gameState later.
        Object.assign(gameState, savedState);
        rebuildUIFromState();
        showNotification("Welcome Back!", "Your progress has been loaded.");
    } catch (e) {
        console.error("Could not load or parse save file:", e);
        localStorage.removeItem('gompeiClickerSave'); // Clear corrupted save data
    }
}

/**
 * Reconstructs the visual widgets on the screen based on the loaded gameState.
 * Note: This system does not save individual widget upgrades (e.g., for Lawns)
 * because that state is currently stored only in the DOM, not in gameState.
 */
function rebuildUIFromState() {
    widget_container.innerHTML = ''; // Clear any default/existing widgets

    for (const name in gameState.widgets) {
        const count = gameState.widgets[name];
        if (count === 0) continue;

        if (name === 'Super-Gompei') {
            // Super-Gompei is a single entity whose power is based on its purchase count.
            const storeElement = Array.from(stores).find(s => s.getAttribute("name") === name);
            if (!storeElement) continue;

            const baseReap = parseInt(storeElement.getAttribute("reap"));
            const calculatedReap = baseReap + (100 * (count - 1));

            const widget = createWidgetElement(name);
            if (widget) widget.setAttribute("reap", calculatedReap);
            document.body.style.setProperty('--gompei-count', count);
        } else {
            // For other widgets, create one for each in the count.
            for (let i = 0; i < count; i++) {
                createWidgetElement(name);
            }
        }
    }
}

loadGame(); // Load progress as soon as the script runs
updateUI(); // Set up the UI correctly on page load
setInterval(saveGame, 15000); // Autosave every 15 seconds

function prestige() {
    const prestigeRequirement = 1_000_000_000; // 1 billion score
    if (gameState.score < prestigeRequirement) {
        showNotification("Not yet!", `You need at least ${prestigeRequirement.toLocaleString()} sqft to prestige.`);
        return;
    }

    // This formula can be adjusted for balance. e.g., Math.floor(Math.cbrt(gameState.score / 1e9))
    const pointsGained = Math.floor(Math.sqrt(gameState.score / prestigeRequirement));
    if (pointsGained < 1) {
        showNotification("Not enough!", `You need more score to gain at least 1 prestige point.`);
        return;
    }

    // Reset the game state
    gameState.score = 5;
    gameState.widgets = {};
    gameState.boosts = {};
    gameState.prestigePoints += pointsGained;

    // Reset the UI
    widget_container.innerHTML = ''; // Clear all widgets
    document.body.style.setProperty('--gompei-count', 0);

    // Reset achievements
    for (const key in achievements) {
        achievements[key].unlocked = false;
    }

    const bonusPercent = (getPrestigeBonus() - 1) * 100;
    showNotification("Rebirth!", `You prestiged for ${pointsGained} point(s). All future gains are now boosted by ${bonusPercent.toFixed(0)}%!`);
    updateUI();
}
