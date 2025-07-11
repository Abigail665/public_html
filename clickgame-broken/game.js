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
}

function changeScore(amount) {
    gameState.score += amount;
    updateUI(); // Centralize all UI updates
    checkAchievements();
}

function updateUI() {
    // Update score element
    score_element.innerHTML = "Score: " + gameState.score;

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
function buy(store) {
    const cost = parseInt(store.getAttribute("cost"));

    // check available to buy
    if (gameState.score < cost) return; // Exit if can't afford

    // change score
    changeScore(-cost); // Use changeScore to keep UI in sync

    if (store.getAttribute("name") === "Super-Gompei") {
        const super_gompei = document.querySelector("#widget-container #super-gompei")?.parentElement;
    //If Super-Gompei already exists
        if (super_gompei) {
            super_gompei.setAttribute("reap", (parseInt(super_gompei.getAttribute("reap")) + 100));
            return;
        }
    }

    // Track widget counts in our gameState
    const name = store.getAttribute("name");
    if (!gameState.widgets[name]) {
        gameState.widgets[name] = 0;
    }
    gameState.widgets[name]++;

    document.body.style.setProperty('--gompei-count', gameState.widgets['Super-Gompei'] || 0);

    // clone node for widget, and add to container
    const widget = store.firstElementChild.cloneNode(true);
    widget.onclick = () => {
        harvest(widget);
    }
    widget_container.appendChild(widget);
    addUpgradeability(widget); // Add upgrade functionality

    if (widget.getAttribute("auto") == 'true') {
        widget.setAttribute("harvesting", "");
        setup_end_harvest(widget);
    }
    updateUI(); // Ensure new widget's upgrade button state is correct
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

    // If manual, collect points now
    changeScore(parseInt(widget.getAttribute("reap")));
    showPoint(widget);

    setup_end_harvest(widget);
}


function showPoint(widget) {
    let number = document.createElement("span");
    number.className = "point";
    number.innerHTML = "+" + widget.getAttribute("reap");
    number.onanimationend = () => {
        widget.removeChild(number);
    }
    widget.appendChild(number);
}

updateUI(); // Initial call to set up the UI correctly on page load

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
