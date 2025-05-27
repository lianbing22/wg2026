// Scenario Selector Module
document.addEventListener('DOMContentLoaded', function() {
    let scenariosData;
    
    // UI Elements for scenario selection
    const scenarioSelectorContainer = document.getElementById('scenario-selector');
    const scenarioListElement = document.getElementById('scenario-list');
    const startSelectedScenarioButton = document.getElementById('start-selected-scenario');
    let selectedScenarioId = null;
    
    // Function to load and display available scenarios
    async function loadScenarioSelector() {
        try {
            const response = await fetch('data/scenarios.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            scenariosData = await response.json();
            displayScenarioList();
        } catch (error) {
            console.error("Could not load scenarios:", error);
            scenarioListElement.innerHTML = '<p>Error loading scenarios. Please try again later.</p>';
        }
    }
    
    // Function to display the list of available scenarios
    function displayScenarioList() {
        scenarioListElement.innerHTML = '';
        
        if (scenariosData && scenariosData.scenarios) {
            scenariosData.scenarios.forEach((scenario, index) => {
                const scenarioItem = document.createElement('div');
                scenarioItem.className = 'scenario-item';
                scenarioItem.innerHTML = `
                    <input type="radio" id="scenario-${index}" name="scenario-selection" value="${scenario.id}">
                    <label for="scenario-${index}">
                        <h3>${scenario.title}</h3>
                        <p>Involved NPCs: ${scenario.involvedNPCs ? scenario.involvedNPCs.join(', ').replace(/NPC_/g, '').replace(/_/g, ' ') : 'None'}</p>
                    </label>
                `;
                
                const radioInput = scenarioItem.querySelector('input[type="radio"]');
                radioInput.addEventListener('change', function() {
                    if (this.checked) {
                        selectedScenarioId = this.value;
                        startSelectedScenarioButton.disabled = false;
                    }
                });
                
                scenarioListElement.appendChild(scenarioItem);
            });
        }
    }
    
    // Function to start the selected scenario
    function startSelectedScenario() {
        if (selectedScenarioId) {
            // Hide scenario selector
            scenarioSelectorContainer.style.display = 'none';
            
            // Show game container
            const gameContainer = document.getElementById('game-container');
            gameContainer.style.display = 'block';
            
            // Start the game with selected scenario
            window.startGameWithScenario(selectedScenarioId);
        }
    }
    
    // Event listener for start button
    if (startSelectedScenarioButton) {
        startSelectedScenarioButton.addEventListener('click', startSelectedScenario);
    }
    
    // Function to show scenario selector (called from main game)
    window.showScenarioSelector = function() {
        scenarioSelectorContainer.style.display = 'block';
        const gameContainer = document.getElementById('game-container');
        gameContainer.style.display = 'none';
        selectedScenarioId = null;
        startSelectedScenarioButton.disabled = true;
        
        // Clear any previous selections
        const radioInputs = scenarioListElement.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => input.checked = false);
    };
    
    // Initialize scenario selector
    loadScenarioSelector();
});