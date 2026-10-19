# Product Requirements Document (PRD): BuilderBuddy (V1.0)

## 1. Executive Summary & Vision
* **Product Name:** BuilderBuddy
* **Problem Statement:** Homeowners face significant friction when planning storage solutions because spaces vary widely in purpose, shape, and dimensions (including uneven floors/steps and sloped under-stairs ceilings). Finding an off-the-shelf modular system that fits their exact geometry and supports the weight of their items requires tedious manual calculations across multiple retailer catalogs.
* **Product Vision:** A responsive, browser-based visual planning application (desktop and tablet) that guides homeowners from measuring their space and cataloging their storage needs to interactively designing a physically valid, SKU-accurate modular storage system and printing a ready-to-buy shopping list.

---

## 2. Target Audience & Device Support
* **Target Users:** Homeowners, DIY organizers, and renters planning closets, garages, pantries, laundry rooms, or under-stairs storage.
* **Supported Platforms:** Modern desktop and tablet web browsers (responsive touch + mouse/trackpad ergonomics).
* **Authentication & Privacy:** Zero-login guest access; all session state, saved designs, and folders are persisted locally in the browser (`localStorage` / `IndexedDB`).

---

## 3. Global Navigation, State & Branching ("My Designs")

### 3.1 Non-Linear Stepper & Cascade Protection
* Users can navigate freely between Steps 1 through 8 via a top step-progress bar.
* **Cascade Protection Modal:** If a user modifies upstream parameters in **Step 2 (Measurements)** or **Step 4 (Weight/Mounting)** after downstream layout decisions exist in **Steps 5–6**, the application intercepts the change with a modal:
  > *"Changing these parameters will reset or reflow your downstream layout. Would you like to save your current progress as a new design branch first, overwrite, or cancel and return to your previous step?"*
  * **Actions:** `Save as New Design Branch` | `Overwrite Current Design` | `Cancel (Return to Previous Step)`.

### 3.2 "My Designs" Right-Hand Sidebar
* Persistent, collapsible right-hand drawer displaying all saved designs.
* **Folder Organization:** Users can create, rename, and delete folders to group designs by room (e.g., *"Garage"*, *"Master Closet"*, *"Under Stairs"*).
* **Save & Branch Actions:**
  * **Save (Overwrite):** Updates the currently active saved design snapshot.
  * **Save as New Design (Branch):** Forks the current state into a new named entry within a chosen folder.

---

## 4. Functional Requirements by Workflow Step

### Step 1: Welcome Page
* **Goal:** Introduce BuilderBuddy's capabilities (custom wall shapes, weight estimation, multi-brand comparison, visual builder, and printable SKU shopping list).
* **Primary CTA:** Prominent **"Start Building"** button (plus quick resume from the "My Designs" sidebar if saved designs exist).

### Step 2: Space Measurement & Constrained Parametric Canvas
* **Unit Selector:** Instant toggle between **Inches (`in`)** and **Centimeters (`cm`)**. Internal data is normalized to decimal inches.
* **Space Initialization Templates:** Fast-loading 4-card selector:
  1. **Standard Wall:** Flat floor and flat ceiling (default `96" W × 84" H × 24" D`).
  2. **Sloped Ceiling / Under-Stairs:** Independent `Left Height` and `Right Height`.
  3. **Stepped Floor:** Configurable floor curb/step (`Step Width` and `Step Height` anchored left or right).
  4. **Start from Scratch:** Minimal canvas with immediate numeric entry.
* **Dual View Modes (1-Tap Toggle):**
  * **Side / Elevation View (Primary):** Front-facing wall geometry showing width, left/right heights, ceiling slope, and floor steps.
  * **Top / Plan View:** Shows wall width, usable room depth (clearance into the room), and an editable **Wall Name** field (e.g., *"Garage North Wall"*).
* **Interactive Canvas Mechanics:**
  * Tapping/clicking any dimension label opens an inline numeric keypad/input bubble.
  * Direct canvas feature toggles for *Flat vs. Sloped Ceiling* and *+ Add / Remove Floor Step*.
  * Auto-centering and proportional scaling so the drawing always occupies ~80% of the canvas viewport without distortion.

### Step 3: Inventory & "Stuff to Store" Selection
* **Alphabetical Multi-Select Category Tree:** Expandable 1–3 level hierarchy.
* **Cross-Category Synchronization:** Shared subcategories appearing under multiple parent categories share a canonical ID; checking/unchecking in one branch immediately updates all occurrences.
* **Live Tree Search:** Instant filter bar that expands and highlights matching categories/subcategories.
* **Custom "Other" Items:** Users can add custom items not found in the tree, paired with a mandatory 3-tier weight selector:
  * `Light (<15 lbs)` | `Medium (15–40 lbs)` | `Heavy (40+ lbs)`
* **Seed Taxonomy (Alphabetical):**
  1. **Automotive & Garage:** *Car Care & Fluids*, *Tires & Racks*, *Auto Parts*
  2. **Cleaning Supplies:** *Car*, *Home* (*Vacuums & Mops*, *Buckets & Detergents*)
  3. **Food & Pantry:** *Canned Goods*, *Dry Bulk*, *Small Appliances*, *Beverage Crates*
  4. **Holiday & Seasonal:** *Storage Totes*, *Decorations*, *Artificial Trees*, *Patio Cushions*
  5. **Home Office & Crafts:** *Paper & Archives*, *Craft Bins*, *Sewing & Hobby*
  6. **Leisure:** *Games*, *Sports Equipment* (*Bikes/Gear*, *Camping*, *Weights/Fitness*), *Travel / Luggage*
  7. **Textiles:** *Bedding*, *Clothes* (*Hanging Garments*, *Folded Clothes*), *Shoes & Accessories*, *Towels*
  8. **Tools:** *Garden & Outdoor*, *Hand Tools*, *Power Tools*, *Toolboxes & Hardware*

### Step 4: Weight Load Estimation & Mounting Confirmation
* **Weight Heuristics Engine:** Calculates the estimated weight load requirement (lbs per linear foot / per shelf tier) from Step 3 selections and custom items.
* **User Confirmation & Overrides:** Displays the recommended load tier (`Light`, `Medium`, `Heavy-Duty`), explains why it was selected, and lets the user confirm or override both:
  * **Target Weight Capacity Tier**
  * **Mounting Preference:** *Any*, *Wall-Mounted (Tracks/Uprights)*, or *Freestanding Frame*
  * **Skill Level Comfort:** *Beginner / No-Drill*, *Intermediate (Drywall Anchors/Leveling)*

### Step 5: Candidate Systems & Skeleton Design Variations
* **System Matching:** Filters the local JSON catalog (`/data/catalog/*.json`) by confirmed weight capacity, mounting type, room depth (`standardDepthsInches <= roomDepth`), and category suitability (e.g., Elfa Classic restricted to clothes/linen closets; Elfa Décor+ and Garage interchangeable).
* **Up to 5 Skeleton Variations per System:** When a user selects a candidate brand/system, the layout engine generates up to 5 structural frame variations (tracks, uprights, or frames only—no shelves yet) with optimization badges:
  1. **Maximum Wall Coverage (Balanced Bays):** Maximizes horizontal utilization with balanced bay widths.
  2. **Wider Bays (Fewer Uprights / Lower Cost):** Uses the widest valid bays to minimize upright/bracket hardware cost.
  3. **High Load Density (Narrower Bays / More Uprights):** Uses narrower bay widths to increase upright count and total load capacity.
  4. **Slope / Step Hugging:** Steps upright heights along sloped ceilings or raised floor curbs to capture awkward vertical zones.
  5. **Centered / Symmetrical Layout:** Prioritizes aesthetic symmetry on the wall.
* **Interactive Preview:** Clicking any variation renders the structural skeleton directly onto the scaled Elevation Canvas.

### Step 6: Detailed Design Work (Interactive Component Placement)
* **Component Palette:** Filtered to components compatible with the selected system line and bay widths:
  * **Supported Visual Components:** Flat shelves (wire, melamine/wood, solid metal), modular drawers, pull-out mesh/wire baskets, clothes hanging rods, and pegboard panels (*individual pegboard hooks/accessories are excluded from canvas placement*).
* **Canvas Manipulation (Touch & Mouse):**
  * Tap/click or drag-and-drop a component into a target bay.
  * Drag placed components vertically; placement snaps to `verticalSlotIntervalInches` (e.g., every `1.0"` or `1.25"`) while respecting ceiling slope and floor step bounds.
  * **Live Clearance Readouts:** Displays real-time vertical distance (in `in` or `cm`) between adjacent components in the same bay.
  * **Automatic Dependency Resolution:** Adding a shelf, basket, or rod automatically adds required mounting hardware (e.g., matching-depth left/right brackets, rod holders) to the underlying Bill of Materials.
  * 1-tap remove button on any placed component.

### Step 7: Parts Shopping List (Bill of Materials)
* **Grouped Itemized Table:** Aggregates all structural skeleton parts from Step 5 and interior components + auto-resolved hardware from Step 6, grouped by role:
  * `Structural Frame / Tracks` | `Uprights` | `Brackets & Hardware` | `Shelves` | `Drawers & Baskets` | `Rods & Panels`
* **Columns:** SKU / Part Number, Component Name, Dimensions (`in`/`cm`), Role Designation, Description, Quantity, Unit Price, and Line Total, plus Grand Total.

### Step 8: Print View (8.5" × 11" Portrait Layout)
* **Dedicated `@media print` & Print Preview View:** Formatted strictly for **8.5" × 11" portrait** paper with clean multi-page pagination (`break-inside: avoid` on table rows and headers).
* **Page 1 Blueprint Header:**
  * Project / Save Name, Wall Name, Date, Selected Brand & System Line, and Overall Wall Dimensions.
  * **Clean 2D Elevation Diagram:** High-contrast vector blueprint showing the wall outline, bay widths, upright positions, and placed components with vertical height labels.
* **Itemized Parts List & Retail Footer:** Complete shopping table followed by Brand Name, Total Estimated Cost, and the list of retail stores/vendors where the components can be purchased.

---

## 5. Non-Functional & Architectural Specifications
1. **No Stud Alignment Constraint:** Uprights are spaced strictly by manufacturer bay widths; heavy-duty drywall anchors are assumed where studs do not align.
2. **Catalog Architecture:** Consumes standardized decimal-inch JSON files from `/data/catalog/*.json` (compatible with **BuilderMiner** output) with a rich built-in seed catalog for Elfa (`Classic`, `Décor+`, `Garage`), IKEA (`BOAXEL`, `PAX`, `BROR`), and Lowe's/Home Depot (`ClosetMaid`, `Rubbermaid FastTrack`, `Husky`).
