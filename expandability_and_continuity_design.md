# Expandability and Continuity Design Document

This document outlines strategies for game growth, focusing on content expansion and enhancing narrative continuity for the Property Management Game.

## 1. Content Expansion Strategy

The goal is to enable straightforward addition of new content by game designers/writers using the established `scenarios.json` format and JavaScript engine.

### 1.1. Adding New Scenarios

*   **Unique IDs:** Each new scenario must have a unique `id` string (e.g., `"LEAKY_ROOF_01"`, `"TENANT_DISPUTE_02"`). This ID is crucial for scenario loading and potentially for future direct scenario jumping or event triggering.
*   **Structure:** New scenarios will follow the same structure as existing ones:
    *   `id`: Unique identifier.
    *   `title`: Player-facing title.
    *   `involvedNPCs`: (Optional) Array of NPC IDs relevant to this scenario.
    *   `startNode`: The `nodeId` of the first node in this scenario.
    *   `nodes`: An array of node objects, each with a unique `nodeId` within that scenario.
*   **Best Practice:** Add new scenarios as new objects within the main `scenarios` array in `data/scenarios.json`. The game currently loads the first scenario by default; a future enhancement would be a scenario selection/progression system.

### 1.2. Introducing New NPCs and Managing Relationship Scores

*   **NPC IDs:** When a new NPC is conceptualized (e.g., a new tenant "NPC_SARAH_MILLER", a new vendor "NPC_RELIABLE_PLUMBERS"), they should be given a unique string ID.
*   **Automatic Initialization:** The existing JavaScript (`js/main.js`) is designed to automatically initialize any NPC found in a scenario's `involvedNPCs` array into the `gameState.relationshipScores` object with a default score (e.g., 0 for Neutral) if they don't already exist. This means a designer only needs to:
    1.  Define the new NPC ID.
    2.  Include this ID in the `involvedNPCs` array of any relevant scenario.
    3.  Use the full `relationship_NPC_ID_XYZ` key in `effects` objects to modify their score.
*   **No Manual `gameState` Edits Needed:** Designers don't need to manually edit `js/main.js` to add NPCs to the tracking system.
*   **Best Practice:** Maintain a separate document (outside the JSON) listing all created NPC IDs and their intended roles/personalities for consistency.

### 1.3. Integrating Existing QTE Types into New Scenarios

*   The "StopTheMovingBar" QTE is the only type currently implemented.
*   **Integration:** To use this QTE in a new scenario node:
    1.  Create a node that will serve as the QTE trigger.
    2.  Within this node, add a `qte` object.
    3.  Set `qte.type` to `"StopTheMovingBar"`.
    4.  Populate `qte.parameters` with values for `targetZoneStart`, `targetZoneEnd`, `barSpeed`, and `attempts` (though `attempts` is currently hardcoded to 1 in `main.js` for simplicity, the parameter is there).
    5.  Define `qte.successEffects`, `qte.failureEffects`, `qte.successNextNode`, and `qte.failureNextNode` as appropriate for the scenario's narrative and mechanical outcomes.
    6.  Optionally, provide `qte.instructionText` and a specific `qte.image`.
*   **Best Practice:** Test QTE parameters thoroughly to ensure they are fair and achievable. Consider the narrative context when defining success/failure effects and subsequent nodes.

### 1.4. Ideas for New QTE Type JSON Structure (General Thoughts)

If new QTE types are added (e.g., "TimedButtonMash", "ClickSequenceOnImage"), their JSON structure within the `qte` object would follow a similar pattern:

*   **`type`:** A new unique string identifier (e.g., `"ButtonMash"`, `"ClickSequence"`).
*   **`parameters`:** This object would contain fields specific to the new QTE type.
    *   For `"ButtonMash"`:
        *   `durationSeconds`: How long the player has to mash.
        *   `targetClicks`: How many clicks are needed for success.
        *   `buttonLabel`: (Optional) Text for the mash button.
    *   For `"ClickSequence"`:
        *   `targetHotspots`: An array of objects, each defining a hotspot's coordinates (e.g., `[{x:10, y:20, radius:5}, {x:50, y:60, radius:5}]`) on the `qte.image`.
        *   `sequenceOrderImportant`: Boolean, if true, hotspots must be clicked in array order.
        *   `timePerClickSeconds`: (Optional) Time limit for each click in the sequence.
*   **`successEffects`, `failureEffects`, `successNextNode`, `failureNextNode`:** These would remain structurally the same, defining outcomes.
*   **`instructionText`, `image`:** Would also remain the same.

**JavaScript Implementation:** The `startQTE` function in `js/main.js` would need a new `case` or `if/else if` block to handle the new `type`, and corresponding new functions (like `moveBar` for "StopTheMovingBar") would be needed to manage the new QTE's specific logic and UI interaction.

## 2. Continuity System Design

This section details how game state persists within a session and proposes a "story flags" system for narrative continuity.

### 2.1. In-Session Persistence

*   **Confirmation:** The current `gameState` object in `js/main.js` (which holds `gameState.metrics` and `gameState.relationshipScores`) is designed to persist throughout a single, continuous play session.
*   **Mechanism:** As scenarios are loaded and completed:
    *   `gameState.metrics` (Tenant Satisfaction, Manager Stress, etc.) are updated by the `effects` of choices and QTEs. These changes carry over to subsequent scenarios initiated within the same session.
    *   `gameState.relationshipScores` are also updated similarly. When a new scenario involves an NPC whose score has already been modified, that existing score is used, not a default one (unless the NPC is entirely new to the `gameState`).
*   **Reset:** This persistence is only for the current play session. If the player closes the browser or refreshes the page, the `gameState` (including metrics and relationship scores) will reset to its initial hardcoded values in `js/main.js` because no cross-session persistence is implemented yet.

### 2.2. Story Flags System

This system enables basic narrative continuity by allowing scenario outcomes to set flags that can be checked by later scenarios to alter text, choices, or even entire branches.

*   **Storage:**
    *   Story flags will be stored in the `gameState` object, similar to metrics and relationship scores.
    *   **Proposed Structure:** `gameState.storyFlags = {}`
    *   **Example:** `gameState.storyFlags = { "MET_MRS_DAVIS_FIRST_TIME": true, "RESOLVED_MAJOR_LEAK_BUILDING_A": true, "HAS_STAFF_KEY_CARD": false }`
    *   Flags are boolean (true/false). By default, any undefined flag is considered `false`.

*   **Setting Flags:**
    *   Flags can be set or modified within the `effects` object of a choice or a QTE's `successEffects`/`failureEffects`.
    *   **Proposed Structure (within `effects`):** An optional `storyFlags` object.
    *   **Example:**
        ```json
        // In a choice's effects:
        "effects": {
          "tenantSatisfaction": 5,
          "storyFlags": {
            "WARNED_TENANT_10A_NOISE": true, // Sets this flag to true
            "OFFERED_MRS_DAVIS_DISCOUNT": false // Explicitly sets to false (or removes)
          }
        }
        ```
    *   **JavaScript Logic:** The `applyEffects` function in `js/main.js` will need to be updated to iterate through the `storyFlags` sub-object in `effects` and update `gameState.storyFlags` accordingly.

*   **Checking Flags (Conditional Logic):**
    *   Scenario nodes or individual choices within them can be made conditional based on the state of story flags.
    *   **Proposal:** Introduce a new optional `conditions` object at the `node` level (to gate access to the entire node) or at the `choice` level (to make a specific choice appear/disappear).
    *   **Structure for `conditions` object:**
        *   It would contain keys corresponding to flag names.
        *   The value would specify the required state of the flag (e.g., `true` or `false`).
        *   Multiple flag conditions can be listed. By default, ALL conditions in the object must be met (AND logic).
    *   **JSON Snippet Example (Conditional Choice):**
        ```json
        // In a scenario node:
        "nodeId": "FOLLOW_UP_NOISE_COMPLAINT",
        "text": "You are considering how to follow up on the noise from Unit 10A.",
        "choices": [
          {
            "text": "Issue a formal warning (standard choice).",
            "effects": { /* ... */ },
            "nextNode": "ISSUE_FORMAL_WARNING_NODE"
          },
          {
            "text": "Issue a 'Final Warning' (only if previously warned).",
            "conditions": { // This choice only appears if the flag is true
              "storyFlags": {
                "WARNED_TENANT_10A_NOISE": true
              }
            },
            "effects": { /* ... */ },
            "nextNode": "ISSUE_FINAL_WARNING_NODE"
          },
          {
            "text": "Offer a soundproofing consultation (if Building Condition is good).",
            "conditions": { // Example of multiple conditions (though metrics are not flags)
                            // This hints at how metric conditions could also be structured
              "metric_buildingCondition": { "greaterThan": 70 }, // Conceptual
              "storyFlags": {
                 "SOUNDPROOFING_BUDGET_APPROVED": true
              }
            },
            "effects": { /* ... */ },
            "nextNode": "OFFER_SOUNDPROOFING_NODE"
          }
        ]
        ```
    *   **JSON Snippet Example (Conditional Node Access - Advanced):**
        ```json
        // Node definition
        {
          "nodeId": "SECRET_MEETING_NODE",
          "conditions": { // This node is only accessible if this flag is true
            "storyFlags": {
              "UNLOCKED_SECRET_PATH": true
            }
          },
          "text": "You found the secret meeting!",
          // ... rest of node structure
        }
        ```
    *   **JavaScript Logic:** The `renderNode` function in `js/main.js` would need to:
        1.  When deciding which choices to display, first check if a `choice.conditions.storyFlags` object exists. If so, evaluate its conditions against `gameState.storyFlags`. Only display the choice if all conditions are met.
        2.  (More advanced) When navigating to a `nextNode`, if the target node has a `conditions.storyFlags` object, evaluate it. If conditions are not met, the game could redirect to an alternative node or display a generic "path blocked" message. This requires careful scenario design to ensure no dead ends.

### 2.3. Cross-Session Persistence (Brief Mention)

*   **Acknowledgement:** The current design ensures persistence of `gameState` (metrics, relationship scores, and the proposed story flags) only within a single, continuous browser session.
*   **Future Enhancement:** To allow players to close their browser and resume later with their progress intact, a mechanism like browser `localStorage` would be necessary.
    *   The game would need to:
        1.  Serialize `gameState` to a JSON string and save it to `localStorage` whenever significant changes occur (e.g., after each choice, QTE, or scenario completion).
        2.  On game load (`DOMContentLoaded`), attempt to retrieve and deserialize this JSON string from `localStorage`. If found, this saved state would be used to populate `gameState` instead of the hardcoded initial values.
*   **Scope:** Full implementation of `localStorage` persistence is considered out of scope for the current design phase but is a logical next step for a more complete player experience.

This design provides a solid foundation for expanding game content and enhancing narrative continuity, building directly upon the existing prototype's structure and mechanics.
```
