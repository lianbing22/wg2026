# Property Management Game - Mechanics Design

This document outlines the basic game mechanics for a text-based property management game enhanced with 2D graphics, based on the scenarios detailed in `property_management_game_scenarios.md`. It also includes selected enhanced engagement mechanics.

## 1. Player Interaction

*   **Primary Interaction:** The player will primarily interact with the game by selecting from a list of 2-4 choices presented in response to a situation. These choices will be displayed as text buttons.
*   **Mini-Games (QTEs):** Certain scenarios may trigger Quick Time Events (QTEs) for tasks like simple repairs, requiring timed or sequential input from the player. (See section 5.2 for details).
*   **Simple Text Input:** Occasionally, the game might require simple text input for specific information, such as:
    *   Entering a monetary value (e.g., setting a rental price, approving an expense amount within a range).
    *   Naming something (e.g., a new policy initiative, though this would be rare).
    *   No complex parsing, mostly numeric or very short predefined string inputs.
*   **Clicking on 2D Image Areas:**
    *   Limited use for initial prototype. Could be used for:
        *   Selecting a building or unit on a simple map to get more information or initiate an interaction.
        *   Clicking on a highlighted part of an image that corresponds to an issue (e.g., clicking on a "leaky pipe" in an image of a room to acknowledge it).
        *   Interacting with certain QTE mini-games (e.g., click sequence on an image).
*   **Direct Manipulation:**
    *   No direct manipulation (e.g., dragging and dropping items) is planned for the initial prototype to maintain simplicity.

## 2. Scenario Progression & Outcomes

*   **Scenario Start:**
    *   Scenarios will typically start with an "event notification." This could be an email, a phone call pop-up, a tenant walking into the office, or an observation made by the player.
    *   The notification will present the initial situation and context (text + relevant image), potentially influenced by existing relationship scores with involved NPCs.
*   **Scenario End:**
    *   A scenario ends when the immediate issue is resolved, a decision path is completed, a QTE concludes, or a point of temporary conclusion is reached.
    *   Some scenarios might be short (2-3 decision steps), while others might be longer and branch.
    *   An outcome summary will be presented, detailing the results of the player's choices within that scenario, including any changes to relationship scores.
*   **Immediate Outcome of Choices:**
    *   Each choice leads to an immediate textual feedback explaining the consequence of that action.
    *   This might also trigger an update to the 2D graphic (e.g., a messy room becoming clean, a happy/unhappy tenant portrait reflecting a change in relationship score).
    *   Choices can unlock new options, trigger QTEs, or lead to different branches within the scenario.
    *   Choices will often impact relationship scores with involved NPCs (see section 5.1).
*   **Longer-Term Game Metrics:** Player choices will influence 2-4 key metrics:
    1.  **Tenant Satisfaction (0-100%):** Reflects overall happiness of tenants. Influenced by response times, problem resolution, fairness, communication, and aggregated relationship scores. Low satisfaction can lead to more complaints, difficulty leasing, and negative reviews.
    2.  **Property Financial Health ($$):** Represents the property's profitability and budget status. Influenced by rent collection, repair costs (including QTE outcomes), vacancy rates, fines, capital expenditures. Poor financial health can limit options and lead to game over if it becomes critical (e.g., bankruptcy).
    3.  **Building Condition (0-100%):** Represents the physical state of the property. Influenced by maintenance decisions, addressing repairs promptly (including QTE outcomes), pest control, etc. Poor condition leads to more frequent/costly repairs and lower tenant satisfaction.
    4.  **Manager Stress/Reputation (0-100%):** Reflects the player character's personal well-being and professional standing. High stress (from overwork, difficult tenants, poor outcomes, failed QTEs) can lead to negative consequences. Reputation affects interactions and potentially NPC relationship score baselines.
*   **Win/Lose Conditions:**
    *   **Scenarios:** Individual scenarios won't typically have hard "win/lose" conditions but rather a spectrum of outcomes. QTEs within scenarios will have clear success/failure outcomes.
    *   **Game:** Overall "win" conditions could be achieving certain metric targets and positive relationship scores with key NPCs. "Lose" conditions could be bankruptcy, being "fired" (due to extremely low metrics/relationships), or major legal/safety failures.

## 3. Role of 2D Graphics

*   **Static Illustrations:**
    *   Locations, Character Portraits (expressions may reflect relationship scores), Event Icons.
*   **UI Elements:**
    *   Buttons, Status Bars/Dials, Notification Pop-ups.
    *   **QTE Interface Elements:** Specific UI overlays for QTEs, such as timers, target areas on images, or visual cues for sequences (see section 5.2).
*   **Graphics Changes based on State:**
    *   Location Condition, Character Expressions (potentially tied to relationship scores), Item Representation.

## 4. Core Game Loop (Conceptual)

1.  **Event Trigger:** An event occurs.
2.  **Information Presentation:** Text + Image (NPC portraits may reflect relationship score).
3.  **Player Decision/Interaction:**
    *   Player chooses from text buttons.
    *   OR, a QTE mini-game is initiated.
4.  **Outcome & Feedback:**
    *   Text description of result.
    *   Image Update (Optional).
    *   Metric Changes (including relationship scores).
    *   QTE success/failure feedback.
5.  **Next Step/Event:** Scenario progresses, concludes, or a new event is triggered.

## 5. Enhanced Engagement Mechanics

### 5.1. Recurring Characters & Relationship Scores

This system aims to create continuity and make interactions with non-player characters (NPCs) more meaningful.

*   **Storage:**
    *   Relationship scores will be stored globally in the game state, associated with unique NPC identifiers (e.g., `NPC_MRS_DAVIS`, `NPC_HANDYMAN_JOE`).
    *   Example structure in game state: `relationshipScores: { "NPC_MRS_DAVIS": 5, "NPC_HANDYMAN_JOE": -2 }`.
*   **Scale/Range:**
    *   A simple numerical scale, for example, -10 (Hostile) to +10 (Friendly/Loyal), with 0 being Neutral.
    *   Alternatively, descriptive tiers: Hostile -> Unfriendly -> Neutral -> Amicable -> Friendly -> Loyal. For prototyping, a numerical score is easier to implement.
*   **Gameplay Influence & Display:**
    *   **Dialogue & Choice Modification:** Relationship scores can alter available dialogue options, change NPC responses (e.g., a friendly NPC might offer a discount or extra help, an unfriendly one might be curt or uncooperative), or even unlock specific scenario branches. For instance, a choice "Ask for a favor" might only appear if the relationship score with that NPC is above a certain threshold.
    *   **QTE Difficulty:** Relationship scores could subtly influence QTEs involving that NPC. For example, a friendly handyman might give you slightly more time on a repair QTE, or a disgruntled tenant might make a "negotiation" QTE harder. (This is an advanced integration).
    *   **Visual Cues:** NPC portraits could have subtle visual changes based on relationship tiers (e.g., slight smile for positive, slight frown for negative). Scores might not be directly displayed to the player constantly but could be hinted at through dialogue or summarized in a "contacts" or "logbook" screen if such a feature is added.
*   **Score Updates:**
    *   **Scenario Choices:** Specific choices within scenarios will be the primary way to update scores. The `effects` object of a choice can include relationship score changes (e.g., `{"relationship_NPC_MRS_DAVIS": "+2"}`).
    *   **QTE Outcomes:** Successfully completing a QTE that benefits an NPC could improve the relationship (e.g., fixing their appliance quickly). Failing might decrease it.
    *   **Neglect/Positive Actions:** Global game events or inaction could also modify scores. For example, consistently failing to address an NPC's complaints (even if not directly a choice in a scenario) could lead to a gradual decline. Conversely, positive global events you trigger might give slight boosts.

### 5.2. "Repair It" QTE Mini-Game

This system introduces interactive mini-games for common, simple repair tasks to make them more engaging.

*   **QTE Types (Web Implementation Focus):**
    1.  **Timed Button Mash/Hold:**
        *   *Description:* A bar appears and needs to be filled by rapidly clicking a button or holding a button down for a specific duration within a time limit.
        *   *Example Use:* "Unclogging a tough drain" (mashing), "Applying pressure to seal a pipe" (holding).
    2.  **Click Sequence on Image:**
        *   *Description:* An image of the item to be repaired is shown. Small, numbered circles or highlighted areas appear sequentially. The player must click them in the correct order within a time limit for each click or for the overall sequence.
        *   *Example Use:* "Resetting a complex breaker panel," "Assembling a simple component."
    3.  **Stop the Moving Bar:**
        *   *Description:* A bar moves back and forth (or up and down) across a target zone. The player must click a button when the moving bar is within the highlighted "success" zone.
        *   *Example Use:* "Tightening a bolt to the right pressure," "Cutting a wire at the precise point."
*   **Triggering from Scenario:**
    *   A scenario node can define a QTE. When this node is reached, instead of (or before) presenting choices, the game initiates the QTE interface.
*   **Outcomes of Success/Failure:**
    *   **Metrics:**
        *   *Success:* Positive impact on `Building Condition`, potentially small positive `Tenant Satisfaction` (if tenant is aware/affected), small decrease in `Manager Stress`.
        *   *Failure:* Negative impact on `Building Condition` (or no improvement), potential negative `Tenant Satisfaction`, increase in `Manager Stress`. May lead to increased `FinancialHealth` cost if a follow-up professional repair is needed.
    *   **Item Condition:** The specific item involved in the QTE might have its own condition stat that is improved on success or worsened on failure (leading to future, more complex scenarios if it breaks completely).
    *   **Scenario Progression:**
        *   *Success:* Leads to a "success" node in the scenario (e.g., "You fixed the faucet!").
        *   *Failure:* Leads to a "failure" node (e.g., "You made the leak worse! Now you have to call a plumber."). This node might present new choices, such as calling a professional (costlier).
    *   **Relationship Scores:** Successfully fixing something for a tenant via a QTE could improve your relationship score with them. Failure could decrease it.
*   **UI During QTE (Conceptual):**
    *   The main scenario text area might display instructions for the QTE.
    *   The image area might display the relevant item (especially for "Click Sequence").
    *   A dedicated QTE overlay would appear, potentially dimming the background. This overlay would house:
        *   The QTE elements themselves (the clickable button for mashing, the image with hotspots, the moving bar and target zone).
        *   A visible timer (if applicable).
        *   Clear visual feedback for successful actions (e.g., hotspots lighting up green) or failures (e.g., turning red, a "miss" sound).
    *   Once the QTE is complete, the overlay disappears, and the scenario text/choices update based on the outcome.

## 6. Data Structure for Scenarios (High-Level Suggestion - JSON Example)

Scenarios could be structured in a JSON format. Each scenario would have steps, and each step would have choices leading to different outcomes or next steps. This structure will need to be augmented to support the enhanced mechanics (see `json_structure_updates.md` for details).

```json
// Original example JSON structure remains here for context
// ... (as in the original file) ...
{
  "scenarios": [
    {
      "id": "NOISE_COMPLAINT_01",
      "title": "Noise Complaint - Unit 10A",
      "involvedNPCs": ["NPC_MRS_DAVIS", "NPC_TENANT_10A"], // Example for tracking relevant NPCs
      "startNode": "NODE_01",
      "nodes": [
        {
          "nodeId": "NODE_01",
          // ... text, image ...
          "choices": [
            {
              "text": "Promise to talk to Unit 10A immediately.",
              "effects": {
                "tenantSatisfaction": 5, 
                "managerStress": 2,
                "relationship_NPC_MRS_DAVIS": 1 // Relationship effect
              },
              "nextNode": "NODE_02A"
            }
            // ... other choices ...
          ]
        },
        // ...
        {
          "nodeId": "REPAIR_LEAKY_FAUCET_QTE_TRIGGER",
          "text": "Mrs. Davis also mentions her kitchen faucet is dripping. 'Could you take a quick look while you're here?'",
          "image": "locations/kitchen_faucet.png",
          "qte": { // QTE definition
            "type": "StopTheMovingBar",
            "parameters": {
              "targetZone": [40, 60], // e.g., bar moves from 0-100, success if stopped between 40-60
              "speed": 5,
              "attempts": 3
            },
            "successEffects": {
              "buildingCondition": 1,
              "relationship_NPC_MRS_DAVIS": 1,
              "managerStress": -1
            },
            "failureEffects": {
              "buildingCondition": -1,
              "relationship_NPC_MRS_DAVIS": -1,
              "managerStress": 2
            },
            "successNextNode": "FAUCET_REPAIRED_NODE",
            "failureNextNode": "FAUCET_WORSE_NODE"
          }
        }
        // ... other nodes
      ]
    }
  ]
}
```
This structure allows for branching narratives, direct impact on metrics per choice, QTEs, and references to visual assets. `effects` could target the main game metrics directly. `endsScenario: true` would signify a conclusion point for that branch of the scenario. More complex logic (e.g., conditional branching based on metric or relationship values) could be added later.
```
