---
name: initiation-prompt
description: The original prompt to create the BuilderBuddy Application
context: You are the builder buddy to a home owner - you are aware of all storage solutions on the market, where they can be purchased, their mounting needs, their measurements, and weight limitations. You will ask your user to tell you in detail about their project. You need to offer as much flexibility as possible in designing the designated space including uneven floor (ex: steps) and uneven ceiling (ex: space under stairs)
---
# Problem Statement
Home improvement and organization is challenging because there are many space purpose variations and many different space shapes and measurements.  The main challenge is for home owners to find the organizational solution that would use up the space in an optimal way and offer the best storage for the type of stuff they want to store.

# Purpose
Builder Buddy will help the user decide on the storage system and components based on the user's space measurements, stuff to store, weight load requirement, and building skills.

# Prompt
Design an application that can be launched in any browser via a computer or a tablet. Prompt me when additional MCPs, Skills, and Tools are used to accomplis your task.  Do not limit your design by the MCPs, skills, and tools available to you now: let's discuss the tools you need and what I can give you. 

The application should be accessible and usable on either device, keep this in mind when designing user pages. Anyone can access it - the session should be stored locally.

--- 

## Application Flow

### Navigation, State Persistence & Branching ("My Designs")
* **Local Session Storage:** Anyone can access the application without login; all state is persisted locally in the browser.
* **Non-Linear Navigation & Cascade Protection:** The user can jump back to any previous step of the design process to view or change parameters. If the user modifies upstream parameters (such as wall measurements in Step 2 or weight/system selections in Step 4) after already configuring downstream layout steps (Steps 5–6), the app displays a confirmation modal:
  * *"Changing these parameters will reset or reflow your downstream layout. Would you like to save your current progress as a new design branch first, overwrite, or cancel and return to your previous step?"*
* **"My Designs" Right-Hand Sidebar:**
  * Displays all saved designs organized into user-created **Folders** (e.g., organized by room: *"Garage"*, *"Master Closet"*, *"Pantry"*).
  * Supports saving on top of an existing save (**Overwrite**) or creating a new branch (**Save as New Design**).

### Step-by-Step Workflow

1. **Welcome Page:**
   * Explains what BuilderBuddy does, supported space types, and how it matches real-world retail systems to custom dimensions.
   * Prominent **"Start Building"** call-to-action button.

2. **Space Measurement & Graphical Interface:**
   * Ask the user to select their measurement unit (**inches** or **cm**).
   * Allow the user to initialize from a quick template (*Standard Wall*, *Sloped Ceiling / Under-Stairs*, *Stepped Floor*, or *Start from Scratch*) and customize measurements on the interactive canvas.
   * Allow the user to toggle between **Side/Elevation View** (front-facing wall profile) and **Top/Plan View** (wall width and usable room depth).
   * Allow the user to name the wall for reference (e.g., *"Garage North Wall"*).
   * Auto-scale and center the drawing proportionally so the space fits ~80% of the viewport on both desktop and tablet screens.

3. **Inventory & "Stuff to Store" Selection:**
   * Present an alphabetical, expandable multi-select checkbox tree (1–3 subcategory levels deep).
   * **Cross-Category Sync:** If a subcategory appears under multiple parent categories, selecting/deselecting it in one place automatically syncs its state across all occurrences.
   * **Live Search:** Allow the user to search items and highlight/expand matching categories in the tree.
   * **Custom "Other" Items with Weight Tier:** Allow the user to add custom "Other" items if not listed, paired with a mandatory 3-option weight selector for each custom item:
     * `Light (<15 lbs)` | `Medium (15–40 lbs)` | `Heavy (40+ lbs)`
   * **Seed Categories (expand with additional relevant categories & 1–3 levels of subcategories, ordered alphabetically):**
     * Automotive & Garage
     * Cleaning Supplies (*Car*, *Home*)
     * Food & Pantry (*Canned Goods*, *Dry Bulk*, *Small Appliances*)
     * Holiday & Seasonal
     * Home Office & Crafts
     * Leisure (*Games*, *Sports Equipment*, *Travel / Luggage*)
     * Textiles (*Bedding*, *Clothes*, *Shoes & Accessories*, *Towels*)
     * Tools (*Garden & Outdoor*, *Hand Tools*, *Power Tools*, *Toolboxes & Hardware*)

4. **Weight Load Estimation & Mounting Confirmation:**
   * **Backend Catalog Query:** Query the local structured JSON storage catalog (populated via BuilderMiner for IKEA, The Container Store Elfa, Lowe's, Home Depot) to identify candidate systems that fit the user's space dimensions, room depth, and storage categories.
   * **Weight Load & Mounting Confirmation:** Present the calculated weight load capacity range needed based on the user's Step 3 selections, and allow the user to confirm or adjust the target load tier and mounting preference (e.g., *Wall-Mounted* vs. *Freestanding*).

5. **Candidate Systems & Skeleton Design Variations:**
   * Present all matching storage systems/brands that satisfy the confirmed weight load and space constraints.
   * Allow the user to select and explore any matching brand/system to visualize it in their space:
     1. For each selected brand/system, generate and present **up to 5 skeleton design variations** (showing only the structural frame: top tracks, vertical uprights, or freestanding frames aligned against their wall geometry—no shelves placed yet).
     2. Each variation includes a concise optimization badge and description explaining what it optimizes for:
        * *Variation 1 — Maximum Wall Coverage (Balanced Bays)*
        * *Variation 2 — Wider Bays (Fewer Uprights / Lower Cost)*
        * *Variation 3 — High Load Density (Narrower Bays / More Uprights)*
        * *Variation 4 — Slope / Step Hugging (Stepped Upright Heights for Irregular Walls)*
        * *Variation 5 — Centered / Symmetrical Layout*
     3. Allow the user to click through and preview each skeleton variation directly on their scaled wall canvas, then pick one to advance to detailed design.

6. **Detailed Design Work (Interactive Component Placement):**
   * Display the compatible interior components for the chosen system and bay widths:
     * **Supported Components:** Flat shelves (wire, solid melamine/wood, metal), drawers, pull-out mesh/wire baskets, clothes hanging rods, and pegboard panels (*individual pegboard hooks/accessories are out of scope for visual placement*).
   * **Visual Canvas Controls (Desktop & Tablet Friendly):**
     * Add components to a bay via tap/click or drag-and-drop from the component palette.
     * Drag placed components vertically along the uprights, snapping to the system's real vertical slot/notch intervals, with live vertical clearance readouts between components.
     * Automatically include required mounting hardware (such as matching-depth left/right brackets) in the background Bill of Materials whenever a shelf, basket, or rod is placed.
     * Remove components with a single tap/click.

7. **Parts Shopping List (Bill of Materials):**
   * Generate a complete, itemized shopping list grouped by component role (`Structural Frame / Tracks`, `Uprights`, `Brackets & Hardware`, `Shelves`, `Drawers & Baskets`, `Rods & Panels`).
   * Display for each line item: Part Number (SKU), Component Name, Measurements, Role Designation, Description, Quantity, Unit Price, and Line Total.

8. **Print View (8.5" × 11" Portrait Layout):**
   * Provide a dedicated print stylesheet and print preview optimized for **8.5" × 11" portrait sheets** (cleanly paginating across multiple pages if needed).
   * **Page 1 Header & Visual Blueprint:** Includes the project/wall name, selected Brand & System Line, overall wall dimensions, and a clean **2D elevation diagram of the final design** with bay widths and vertical shelf heights labeled.
   * **Itemized Parts Table:** Full SKU and quantity table.
   * **Footer / End of List:** Displays the Brand Name, total estimated cost, and the list of retail stores/vendors that carry the materials.

## Graphical Interface for Space Design

The space measurement interface allows users on both desktop computers and tablets to define their space accurately without requiring complex CAD skills. For V1, the focus is strictly on **single-wall space planning** (multi-wall corner arrangements are deferred to V2).

### 1. Space Initialization
Users are presented with an instant-loading, lightweight selection card grid:
* **Standard Wall:** Rectangular floor-to-ceiling surface (default 96" W × 84" H).
* **Sloped Ceiling / Under-Stairs:** Angled ceiling profile with independent left and right height limits.
* **Stepped Floor:** Accommodates raised concrete garage curbs, steps, or foundation offsets.
* **Start from Scratch:** Minimal canvas allowing immediate entry of custom dimensions.

### 2. View Modes & Representation
* **Elevation View (Primary):** The direct front-facing view of the wall where vertical upright tracks, brackets, and shelves are mounted.
* **Top View (Plan View):** Displays wall width and usable room depth (clearance into the room), allowing the user to name the wall for reference (e.g., *"Garage South Wall"*, *"Main Closet"*).
* **View Toggle:** A clean, 1-tap switcher between Elevation View and Top View.

### 3. Constrained Parametric Canvas Mechanics
To ensure high tablet usability and prevent geometrically invalid shapes:
* **Interactive Dimension Labels:** Clicking or tapping any dimension line (e.g., width or height) highlights the value and opens an inline numeric keypad / input bubble.
* **Direct Feature Modifiers:** Users can toggle geometric features directly from the canvas:
  * **Ceiling Geometry:** Toggle between *Flat Ceiling* and *Sloped Ceiling* (exposing `Left Height` and `Right Height`).
  * **Floor Geometry:** Toggle *+ Add Step* (exposing `Step Width` and `Step Height` from the left or right edge).
* **Responsive Proportional Scaling:** As numbers are entered or modified, the SVG/Canvas auto-centers and proportionally scales to fit ~80% of the viewport on both tablets and desktop screens.
* **Unit System:** Primary measurements are captured in decimal inches, with an instantaneous toggle to centimeters (`in` ↔ `cm`).

## Specifications

### Simplified Mounting Constraints (No Stud Alignment Required)
* We will remove the stud-alignment requirement from the layout engine.
* All top-track and upright calculations will assume standard heavy-duty drywall anchor / wall-plug mounting capability, allowing uprights to be spaced exactly according to the manufacturer's bay widths (e.g., 24", 32", 36") anywhere along the wall.


## Storage System Data Catalog (Consumed from BuilderMiner)

BuilderBuddy consumes a local, standardized JSON catalog (`/data/catalog/*.json`) generated by the sibling **BuilderMiner** ingestion pipeline, paired with a built-in seed catalog so the application works out of the box.

### 1. Supported Systems & Compatibility Rules
* **The Container Store — Elfa:**
  * **Elfa Classic:** Dedicated to clothing closets and linen storage.
  * **Elfa Décor+ & Elfa Garage:** Modular systems tailored for living areas, pantries, and heavy-duty garage/workshop storage. *Components between Décor+ and Garage lines are flagged as mutually compatible and interchangeable.*
* **IKEA:**
  * **BOAXEL:** Wall-mounted suspension rail and upright system for closets, laundry, and utility.
  * **PAX:** Modular freestanding wardrobe frames and interior organizers.
  * **BROR:** Heavy-duty freestanding/modular steel shelving for garage and workshop storage.
* **Home Depot / Lowe's (Multi-Brand):**
  * **ClosetMaid / Rubbermaid / Husky:** Wall-mounted wire shelving, FastTrack rail/upright systems, and heavy-duty steel garage shelving.

### 2. Dimensional & Physical Constraints Rules
* **Unit Storage:** All catalog dimensions (`width`, `height`, `depth`, `thickness`) are stored in **decimal inches** and converted dynamically on the frontend when the user selects `cm`.
* **Mounting Assumptions:** Layout calculations assume heavy-duty drywall anchors are used where studs do not align; uprights are spaced according to the system's exact bay widths rather than fixed 16"/24" stud intervals.
* **System Physics Enforced by the Layout Engine:**
  * `standardBayWidthsInches`: Valid bay widths supported by the system (e.g., `[18, 24, 30, 36]` or `[23.625, 31.5]`).
  * `standardDepthsInches`: Valid component depths that must fit within the user's Top-View room depth.
  * `verticalSlotIntervalInches`: Vertical notch spacing on uprights for snapping shelves/drawers in Step 6.
  * `maxWeightLbs`: Per-component and per-bay weight ratings used to validate against the user's confirmed load in Step 4.
  * `requires`: Automatic hardware dependency resolution (e.g., placing 1 shelf automatically adds 2 matching-depth brackets to the Step 7 shopping list).