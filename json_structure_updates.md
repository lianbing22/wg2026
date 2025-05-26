# Proposed Updates to scenarios.json Structure

This document outlines the necessary modifications to the `scenarios.json` structure to support the newly integrated mechanics: "Recurring Characters & Relationship Scores" and "'Repair It' QTE Mini-Game," as detailed in the updated `game_mechanics_design.md`.

## 1. Supporting "Recurring Characters & Relationship Scores"

To implement this mechanic, the JSON structure needs ways to identify NPCs, track scenarios they are involved in, and define how choices affect relationships with them.

### 1.1. NPC Identification

*   **Proposal:** A global list of NPCs could be defined outside the `scenarios` array, or simply rely on unique string identifiers for NPCs directly within scenarios. For simplicity in `scenarios.json`, we'll assume unique string IDs are used directly.
*   **Example NPC IDs:** `"NPC_MRS_DAVIS"`, `"NPC_TENANT_10A"`, `"NPC_HANDYMAN_JOE"`.

### 1.2. Linking NPCs to Scenarios (Optional but Recommended)

*   **Proposal:** Add an optional `involvedNPCs` array at the scenario's top level. This helps in quickly identifying which NPCs play a role in a scenario, potentially for pre-loading character assets or for future logic.
*   **Structure:**
    ```json
    {
      "id": "SCENARIO_ID_EXAMPLE",
      "title": "Example Scenario Title",
      "involvedNPCs": ["NPC_MRS_DAVIS", "NPC_OTHER_CHARACTER"], // Array of NPC IDs
      "startNode": "NODE_01",
      "nodes": [ /* ... */ ]
    }
    ```

### 1.3. Modifying Relationship Scores via Choices

*   **Proposal:** Extend the `effects` object within a `choice` to include relationship score modifications.
*   **Structure:**
    *   Use a prefix like `relationship_` followed by the NPC ID as the key.
    *   The value would be the numerical change to the relationship score.
*   **Example:**
    ```json
    "choices": [
      {
        "text": "Agree to help Mrs. Davis immediately.",
        "effects": {
          "tenantSatisfaction": 5,
          "managerStress": 1,
          "relationship_NPC_MRS_DAVIS": 2 // Increases relationship with Mrs. Davis by 2
        },
        "nextNode": "HELP_DAVIS_NODE"
      },
      {
        "text": "Politely decline to help Mrs. Davis right now.",
        "effects": {
          "tenantSatisfaction": -2,
          "relationship_NPC_MRS_DAVIS": -1 // Decreases relationship with Mrs. Davis by 1
        },
        "nextNode": "DECLINE_DAVIS_NODE"
      }
    ]
    ```

### 1.4. Conditional Branching based on Relationship Scores (Advanced)

*   **Proposal (Future Consideration):** While not for initial prototype, scenario nodes could eventually include `conditions` for choices or branching, based on relationship scores.
*   **Example (Conceptual):**
    ```json
    // In a node:
    "choices": [
      {
        "text": "Ask for a big favor (Requires Friendly)",
        "condition": { // This choice only appears if condition is met
          "relationship_NPC_HANDYMAN_JOE": { "greaterThan": 5 }
        },
        "effects": { /* ... */ },
        "nextNode": "FAVOR_REQUESTED_NODE"
      }
    ]
    ```

## 2. Supporting "'Repair It' QTE Mini-Game"

To implement QTEs, scenario nodes need to define the QTE type, its parameters, and the outcomes based on success or failure.

### 2.1. Defining a QTE in a Scenario Node

*   **Proposal:** Introduce a `qte` object within a scenario node. When the game engine encounters a node with a `qte` object, it will trigger the QTE interface instead of immediately presenting choices (if any).
*   **Structure for `qte` object:**
    *   `type`: A string identifying the QTE type (e.g., `"StopTheMovingBar"`, `"ClickSequence"`, `"ButtonMash"`).
    *   `parameters`: An object containing specific settings for that QTE type (e.g., speed, target zones for "StopTheMovingBar"; sequence of clicks for "ClickSequence").
    *   `successEffects`: An `effects` object (similar to choices) applied if the QTE is successfully completed. This can include metric changes and relationship score changes.
    *   `failureEffects`: An `effects` object applied if the QTE is failed.
    *   `successNextNode`: The `nodeId` to proceed to if the QTE is successful.
    *   `failureNextNode`: The `nodeId` to proceed to if the QTE is failed.
    *   `instructionText` (Optional): Text to display as instructions for the QTE. If not provided, generic instructions for the QTE type might be used.
    *   `image` (Optional): Specific image to display during this QTE (e.g., the item being repaired).

### 2.2. Example QTE Definition:

```json
// Inside a scenario node:
{
  "nodeId": "ATTEMPT_SINK_REPAIR_NODE",
  "text": "You decide to try fixing the leaky sink in Unit 5B yourself. It looks like a worn-out washer.",
  "image": "locations/unit_5b_kitchen_sink_leaking.png", // Image before QTE
  "qte": {
    "type": "StopTheMovingBar", // Identifies the QTE logic
    "instructionText": "Try to tighten the valve just right. Stop the bar in the green zone!",
    "image": "ui/qte_valve_interface.png", // Specific image for the QTE interface
    "parameters": {
      "targetZoneStart": 40, // Target is between 40-60 on a 0-100 scale
      "targetZoneEnd": 60,
      "barSpeed": "medium", // Or a numerical value
      "attempts": 2 // Player gets 2 tries
    },
    "successEffects": {
      "buildingCondition": 2,
      "tenantSatisfaction": 3, // Assuming tenant of 5B is happy
      "relationship_NPC_TENANT_5B": 1, // If NPC_TENANT_5B is defined
      "managerStress": -2,
      "financialHealth": 10 // Saved $10 by not calling plumber
    },
    "failureEffects": {
      "buildingCondition": -1, // Made it slightly worse or no change
      "tenantSatisfaction": -2,
      "relationship_NPC_TENANT_5B": -1,
      "managerStress": 3
    },
    "successNextNode": "SINK_REPAIRED_SUCCESS_NODE",
    "failureNextNode": "SINK_REPAIR_FAILED_NODE"
  }
  // No "choices" here, as the QTE determines the next step.
}

// Subsequent nodes:
{
  "nodeId": "SINK_REPAIRED_SUCCESS_NODE",
  "text": "Success! You tightened the valve perfectly and the leak has stopped. The tenant seems pleased.",
  "image": "locations/unit_5b_kitchen_sink_fixed.png",
  "endsScenario": true // Or leads to other choices/nodes
},
{
  "nodeId": "SINK_REPAIR_FAILED_NODE",
  "text": "Oops! You either over-tightened it or didn't get it right. The leak persists, maybe even a bit worse. The tenant looks disappointed.",
  "image": "locations/unit_5b_kitchen_sink_still_leaking.png",
  "choices": [
    {
      "text": "Apologize and call a professional plumber immediately.",
      "effects": { "financialHealth": -75, "managerStress": 2 },
      "nextNode": "CALL_PLUMBER_NODE"
    },
    {
      "text": "Tell the tenant you'll try again later.",
      "effects": { "tenantSatisfaction": -5, "relationship_NPC_TENANT_5B": -1 },
      "nextNode": "DELAY_FURTHER_REPAIR_NODE"
    }
  ]
}
```

## Summary of Changes:

*   **Scenario Level:**
    *   Optional `involvedNPCs`: `["NPC_ID_1", "NPC_ID_2"]`
*   **Choice Level (within `effects` object):**
    *   `relationship_NPC_ID`: `value` (e.g., `relationship_NPC_MRS_DAVIS: 1`)
*   **Node Level (for QTEs):**
    *   `qte`: `{ type, parameters, successEffects, failureEffects, successNextNode, failureNextNode, instructionText?, image? }`

These proposed changes allow for the definition of NPC-specific relationship impacts and the integration of various QTE mini-games directly within the scenario flow, providing a structured way to implement the enhanced mechanics.
```
