document.addEventListener('DOMContentLoaded', () => {
    // Game State Variables
    let currentScenario;
    let currentNodeId;
    let scenariosData;
    let activeQTE = false; // Flag to indicate if a QTE is active

    // Initial Game State
    let gameState = {
        metrics: {
            tenantSatisfaction: 70,
            managerStress: 10,
            buildingCondition: 80,
            financialHealth: 5000
        },
        relationshipScores: {} // E.g., { "NPC_MRS_DAVIS": 0, "NPC_TENANT_LEAKY_SINK": 0 }
    };

    // UI Elements
    const scenarioTextElement = document.getElementById('scenario-text');
    const scenarioImageElement = document.getElementById('scenario-image');
    const locationImageElement = document.getElementById('location-image');
    const choicesAreaElement = document.getElementById('choices-area');
    const feedbackTextElement = document.getElementById('feedback-text');

    // Metrics Display Elements
    const tenantSatisfactionDisplay = document.getElementById('tenantSatisfaction');
    const managerStressDisplay = document.getElementById('managerStress');
    const buildingConditionDisplay = document.getElementById('buildingCondition');
    const financialHealthDisplay = document.getElementById('financialHealth');

    // Relationship Score Display Elements
    const npcRelationshipContainer = document.getElementById('npc-relationship-display');
    const npcNameDisplay = document.getElementById('npc-name');
    const npcRelationshipScoreDisplay = document.getElementById('npc-relationship-score');

    // QTE UI Elements
    const qteContainer = document.getElementById('qte-container');
    const qteInstructionTextElement = document.getElementById('qte-instruction-text');
    const qteTrackElement = document.getElementById('qte-track'); // Renamed for clarity
    const qteMovingBarElement = document.getElementById('qte-moving-bar');
    const qteTargetZoneElement = document.getElementById('qte-target-zone');
    const qteActionButton = document.getElementById('qte-action-button');
    let qteAnimationId;
    let qteCurrentPosition = 0;
    let qteDirection = 1; // 1 for right, -1 for left


    // Function to update metrics display
    function updateMetricsDisplay() {
        tenantSatisfactionDisplay.textContent = gameState.metrics.tenantSatisfaction;
        managerStressDisplay.textContent = gameState.metrics.managerStress;
        buildingConditionDisplay.textContent = gameState.metrics.buildingCondition;
        financialHealthDisplay.textContent = gameState.metrics.financialHealth;
    }

    // Function to update relationship score display
    function updateRelationshipDisplay(npcId) {
        if (npcId && gameState.relationshipScores.hasOwnProperty(npcId)) {
            npcNameDisplay.textContent = npcId.replace("NPC_", "").replace("_", " "); // Basic formatting
            npcRelationshipScoreDisplay.textContent = gameState.relationshipScores[npcId];
            npcRelationshipContainer.style.display = 'block';
        } else {
            npcRelationshipContainer.style.display = 'none';
        }
    }
    
    // Function to initialize NPCs in relationshipScores
    function initializeScenarioNPCs(scenario) {
        if (scenario.involvedNPCs && Array.isArray(scenario.involvedNPCs)) {
            scenario.involvedNPCs.forEach(npcId => {
                if (!gameState.relationshipScores.hasOwnProperty(npcId)) {
                    gameState.relationshipScores[npcId] = 0; // Default to neutral
                }
            });
            // Display first NPC's relationship by default if involved
            if (scenario.involvedNPCs.length > 0) {
                updateRelationshipDisplay(scenario.involvedNPCs[0]);
            } else {
                 updateRelationshipDisplay(null); // Hide if no NPCs
            }
        } else {
            updateRelationshipDisplay(null); // Hide if no involvedNPCs array
        }
    }


    // Function to load scenarios from JSON
    async function loadScenarios() {
        try {
            const response = await fetch('data/scenarios.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            scenariosData = await response.json();
            startGame();
        } catch (error) {
            console.error("Could not load scenarios:", error);
            scenarioTextElement.textContent = "Error loading game scenarios. Please try again later.";
        }
    }

    // Function to start the game
    function startGame() {
        activeQTE = false; // Reset QTE flag
        qteContainer.style.display = 'none'; // Hide QTE container

        if (scenariosData && scenariosData.scenarios && scenariosData.scenarios.length > 0) {
            currentScenario = scenariosData.scenarios[0]; // Start with the first scenario for now
            currentNodeId = currentScenario.startNode;
            initializeScenarioNPCs(currentScenario);
            renderNode(currentNodeId);
            feedbackTextElement.textContent = ""; 
        } else {
            scenarioTextElement.textContent = "No scenarios found.";
        }
        updateMetricsDisplay();
    }

    // Function to start game with a specific scenario (called from scenario selector)
    window.startGameWithScenario = function(scenarioId) {
        activeQTE = false;
        qteContainer.style.display = 'none';
        
        if (scenariosData && scenariosData.scenarios) {
            const selectedScenario = scenariosData.scenarios.find(s => s.id === scenarioId);
            if (selectedScenario) {
                currentScenario = selectedScenario;
                currentNodeId = currentScenario.startNode;
                initializeScenarioNPCs(currentScenario);
                renderNode(currentNodeId);
                feedbackTextElement.textContent = "";
                updateMetricsDisplay();
            } else {
                scenarioTextElement.textContent = "Selected scenario not found.";
            }
        } else {
            scenarioTextElement.textContent = "No scenarios loaded.";
        }
    };

    // Function to render a scenario node
    function renderNode(nodeId) {
        const node = currentScenario.nodes.find(n => n.nodeId === nodeId);
        if (!node) {
            console.error("Node not found:", nodeId);
            scenarioTextElement.textContent = "Error: Scenario progression error.";
            return;
        }

        currentNodeId = nodeId;
        scenarioTextElement.textContent = node.text;
        
        scenarioImageElement.src = node.image || 'assets/images/placeholder.svg';
        scenarioImageElement.alt = node.image || "Scenario Image";
        locationImageElement.src = node.location_image || 'assets/images/placeholder_location.svg';
        locationImageElement.alt = node.location_image || "Location Image";
        
        // Update relationship display if primary NPC changes or is notable for this node
        // For simplicity, using the first involved NPC of the scenario. Could be more specific.
        if (currentScenario.involvedNPCs && currentScenario.involvedNPCs.length > 0) {
            updateRelationshipDisplay(currentScenario.involvedNPCs[0]);
        } else {
            updateRelationshipDisplay(null);
        }


        choicesAreaElement.innerHTML = ''; 

        if (node.qte) {
            activeQTE = true;
            startQTE(node.qte);
        } else {
            activeQTE = false;
            qteContainer.style.display = 'none';
            if (node.endsScenario) {
                feedbackTextElement.textContent = node.endText || "Scenario Ended.";
                const restartButton = document.createElement('button');
                restartButton.textContent = "Choose Another Scenario";
                restartButton.addEventListener('click', () => {
                    // Reset game state
                    gameState.metrics = {
                        tenantSatisfaction: 70,
                        managerStress: 10,
                        buildingCondition: 80,
                        financialHealth: 5000
                    };
                    gameState.relationshipScores = {};
                    updateMetricsDisplay();
                    updateRelationshipDisplay(null);
                    
                    // Show scenario selector
                    if (window.showScenarioSelector) {
                        window.showScenarioSelector();
                    }
                });
                choicesAreaElement.appendChild(restartButton);
            } else if (node.choices && node.choices.length > 0) {
                node.choices.forEach(choice => {
                    const button = document.createElement('button');
                    button.textContent = choice.text;
                    button.addEventListener('click', () => handleChoice(choice));
                    choicesAreaElement.appendChild(button);
                });
                feedbackTextElement.textContent = ""; 
            } else {
                 feedbackTextElement.textContent = "Scenario ended or no choices available.";
            }
        }
    }
    
    // Function to apply effects (for choices and QTEs)
    function applyEffects(effects) {
        if (effects) {
            for (const key in effects) {
                if (gameState.metrics.hasOwnProperty(key)) {
                    gameState.metrics[key] += effects[key];
                } else if (key.startsWith("relationship_")) {
                    const npcId = key.substring("relationship_".length);
                    if (gameState.relationshipScores.hasOwnProperty(npcId)) {
                        gameState.relationshipScores[npcId] += effects[key];
                    } else {
                        // Initialize if somehow not pre-initialized
                        gameState.relationshipScores[npcId] = effects[key];
                    }
                    // Update display if this NPC is the one currently shown
                    if (npcRelationshipContainer.style.display === 'block' && npcNameDisplay.textContent === npcId.replace("NPC_", "").replace("_", " ")) {
                         updateRelationshipDisplay(npcId);
                    }
                } else {
                    console.warn(`Unknown metric or effect key: ${key}`);
                }
            }
            updateMetricsDisplay();
        }
    }

    // Function to handle a player's choice
    function handleChoice(choice) {
        if (activeQTE) return; // Prevent choices during QTE

        applyEffects(choice.effects);

        if (choice.nextNode) {
            renderNode(choice.nextNode);
        } else if (!currentScenario.nodes.find(n => n.nodeId === currentNodeId).endsScenario) {
            console.error("Choice does not lead to a next node and is not an end node:", choice);
            feedbackTextElement.textContent = "Error in scenario flow.";
        }
    }

    // --- QTE Engine ("StopTheMovingBar") ---
    let qteConfig; // To store current QTE settings

    function startQTE(qteData) {
        qteConfig = qteData; // Store QTE data
        qteContainer.style.display = 'block';
        choicesAreaElement.innerHTML = ''; // Hide standard choices
        feedbackTextElement.textContent = "";

        qteInstructionTextElement.textContent = qteConfig.instructionText || "Stop the bar in the target zone!";
        
        // Set up target zone visuals (example positioning)
        const targetStartPercent = qteConfig.parameters.targetZoneStart || 30;
        const targetEndPercent = qteConfig.parameters.targetZoneEnd || 70;
        qteTargetZoneElement.style.left = `${targetStartPercent}%`;
        qteTargetZoneElement.style.width = `${targetEndPercent - targetStartPercent}%`;

        qteMovingBarElement.style.left = '0%';
        qteCurrentPosition = 0;
        qteDirection = 1;

        qteActionButton.onclick = () => stopBar(); // Assign click handler

        // Start the animation loop
        moveBar();
    }

    function moveBar() {
        if (!activeQTE) return; // Stop animation if QTE is no longer active

        const speed = qteConfig.parameters.barSpeed || 50; // Higher is slower (delay in ms)
        qteCurrentPosition += qteDirection * 2; // Move 2% each step

        if (qteCurrentPosition >= 100-5) { // 100% minus bar width (assuming 5%)
            qteCurrentPosition = 100-5;
            qteDirection = -1;
        } else if (qteCurrentPosition <= 0) {
            qteCurrentPosition = 0;
            qteDirection = 1;
        }
        qteMovingBarElement.style.left = `${qteCurrentPosition}%`;
        qteAnimationId = setTimeout(moveBar, speed); // Using setTimeout for speed control
    }

    function stopBar() {
        if (!activeQTE) return;
        clearTimeout(qteAnimationId); // Stop animation

        const barFinalPosition = qteCurrentPosition; // Percentage
        const targetStart = qteConfig.parameters.targetZoneStart;
        const targetEnd = qteConfig.parameters.targetZoneEnd -5; // Adjust for bar width (5%)

        let success = (barFinalPosition >= targetStart && barFinalPosition <= targetEnd);

        // For simplicity, using only one attempt as per updated scenario
        // qteConfig.parameters.attempts = (qteConfig.parameters.attempts || 1) - 1;

        if (success) {
            feedbackTextElement.textContent = "Success!";
            applyEffects(qteConfig.successEffects);
            renderNode(qteConfig.successNextNode);
        } else {
            feedbackTextElement.textContent = "Missed!";
             // if (qteConfig.parameters.attempts > 0) {
            //    qteInstructionTextElement.textContent = `Missed! ${qteConfig.parameters.attempts} attempts left. Try again!`;
            //    moveBar(); // Restart bar for another attempt
            // } else {
            applyEffects(qteConfig.failureEffects);
            renderNode(qteConfig.failureNextNode);
            // }
        }
        activeQTE = false; // QTE concluded
        // qteContainer.style.display = 'none'; // Hide QTE on conclusion, handled by renderNode
    }

    // Initialize the game
    loadScenarios();
});
```
