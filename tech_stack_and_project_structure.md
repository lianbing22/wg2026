# Technology Stack and Project Structure Proposal

This document outlines a recommended technology stack and initial project directory structure for the property management game prototype, based on the game mechanics previously designed (primarily text-based, 2D static images, choice-driven, JSON scenario data).

## 1. Technology Stack Recommendation

For the initial prototype, a simple client-side web technology stack is recommended:

*   **Core Language:** JavaScript (ES6+)
*   **Markup:** HTML5
*   **Styling:** CSS3
*   **Scenario Data Format:** JSON
*   **Optional (but recommended for ease of development):**
    *   A simple JavaScript library for DOM manipulation and event handling like **jQuery** (though vanilla JavaScript is also viable and might be preferred to minimize dependencies).
    *   No complex game engine or framework is deemed necessary for the initial prototype described.

### Justification:

*   **Simplicity and Accessibility:** HTML, CSS, and JavaScript are fundamental web technologies. This stack is easy to set up with no complex build tools required for a basic version. Most developers have some familiarity with these technologies.
*   **Text-Based Nature:** HTML is inherently designed for structuring and displaying text, which is the primary mode of information delivery in the game. CSS allows for styling this text and the UI effectively.
*   **2D Static Images:** Standard HTML `<img>` tags and CSS background images are sufficient for displaying the 2D static illustrations and portraits described in the game mechanics.
*   **Choice-Driven Interaction:** JavaScript can easily handle click events on HTML buttons (choices) and update the DOM (Document Object Model) to display new text, images, and scenario outcomes.
*   **JSON Scenario Data:** JavaScript has built-in capabilities to fetch and parse JSON data (`fetch` API and `JSON.parse()`). This makes loading and using the scenario files straightforward.
*   **Cross-Platform:** Being browser-based, the game will run on any device with a modern web browser (desktops, laptops, tablets, and even mobiles with responsive design).
*   **Rapid Prototyping:** This stack allows for quick iteration. Changes can be made and tested directly in the browser.
*   **No Server-Side Logic Needed (Initially):** The game, as described for the prototype (loading scenarios from local JSON, managing state client-side), does not require server-side logic or a database. This significantly simplifies development and deployment for an initial version.

## 2. Initial Project Directory Structure

Here is a proposed basic directory structure:

```
/property-management-game/
|
|-- index.html                // Main HTML file for the game
|
|-- /css/
|   |-- style.css             // Main CSS file for styling
|
|-- /js/
|   |-- main.js               // Core game logic (scenario loading, state management, UI updates)
|   |-- scenarios.js          // Optional: Could handle loading/parsing of scenario data if complex
|   |-- ui.js                 // Optional: For UI specific functions (e.g. rendering choices, updating metrics display)
|   |-- lib/                  // Optional: For third-party libraries (e.g., jQuery)
|
|-- /assets/
|   |-- /images/
|   |   |-- /locations/       // Images for different game locations (office, unit_interior, etc.)
|   |   |-- /characters/      // Character portraits (tenant_happy.png, vendor_neutral.png, etc.)
|   |   |-- /ui/              // UI elements (buttons, icons, etc.)
|   |-- /audio/               // (Future Use) Sound effects, music - not for initial prototype but good to plan
|
|-- /data/
|   |-- scenarios.json        // Main JSON file containing all game scenarios and their structures
|   |-- (other_game_data.json) // e.g., initial game state, configuration
|
|-- README.md                 // Project description, setup instructions
```

### Explanation of Directories:

*   **`index.html`**: The single entry point for the game application. It will contain the basic HTML structure.
*   **`/css/`**: Holds all CSS files.
    *   `style.css`: Primary stylesheet for the game's appearance.
*   **`/js/`**: Contains JavaScript files.
    *   `main.js`: The main script for controlling game flow, loading scenarios, managing game state, and handling player interactions.
    *   `scenarios.js` (Optional): Can be used to abstract the fetching, parsing, and management of scenario data from `scenarios.json`.
    *   `ui.js` (Optional): Can be dedicated to functions that specifically manipulate the user interface, like rendering choice buttons, updating metric displays, showing notifications, etc. This helps in separating concerns.
    *   `lib/` (Optional): If any third-party JavaScript libraries (like jQuery) are used, they would go here.
*   **`/assets/`**: Stores all static assets.
    *   `/images/`: Contains all visual assets, further categorized by type (locations, characters, UI elements).
    *   `/audio/`: Placeholder for future sound assets.
*   **`/data/`**: For game data files, primarily JSON.
    *   `scenarios.json`: The core file defining the game's narrative content, decision trees, and outcomes as described in the game mechanics design.
*   **`README.md`**: Standard file for project information.

This structure provides a clean separation of concerns (markup, styling, logic, assets, data) and is scalable for a small to medium-sized browser-based game.
```
