const widget_container = document.getElementById("widget-container");
const stores = document.getElementsByClassName("store");
const score_element = document.getElementById("score");
let score = 5;
let super_gompei_count = 0;

function changeScore(amount) {
    score += amount;
    updateUI(); // Centralize all UI updates
}

function updateUI() {
    // Update score element
    score_element.innerHTML = "Score: " + score;

    // Update store availability
    for (let store of stores) {
        let cost = parseInt(store.getAttribute("cost"));
        if (score < cost) {
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

        if (score < upgradeCost) {
            upgradeBtn.setAttribute("disabled", "");
        } else {
            upgradeBtn.removeAttribute("disabled");
        }
    }
}
function buy(store) {
    const cost = parseInt(store.getAttribute("cost"));

    // check available to buy
    if (score < cost) return; // Exit if can't afford

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

    super_gompei_count += 1;
    document.body.style = "--gompei-count: " + super_gompei_count + ";"

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

        if (score < upgradeCost) return;
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
    }, parseFloat(widget.getAttribute("cooldown")) * 100);
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