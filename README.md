# BuilderBuddy — Smart Storage & Space Planner

**BuilderBuddy** is a responsive web application (designed for both desktop computers and tablets) that helps homeowners design optimal modular storage solutions for standard and non-standard spaces—including sloped under-stairs ceilings and stepped garage floors.

> 📖 Looking for the **original inspiration** and home organization story? See [how-it-started.md](./how-it-started.md).  
> 📋 Looking for the **product requirements** and prompt specifications? See [PRD.md](./PRD.md) and [prompt.md](./prompt.md).

---

## Key Features

1. **Interactive Parametric Space Designer (Step 2):**
   - Measure in **Inches (`in`)** or **Centimeters (`cm`)** with instant unit conversion.
   - Start from quick templates (*Standard Flat Wall*, *Sloped Ceiling / Under-Stairs*, *Stepped Floor / Foundation Curb*, or *Start from Scratch*).
   - Toggle between **Side / Elevation View** and **Top / Plan View**, name your wall, and click any measurement badge on the auto-scaled canvas to edit dimensions inline.
2. **Alphabetical Multi-Level Inventory Tree (Step 3):**
   - Expandable 1–3 level category tree (*Automotive & Garage*, *Cleaning Supplies*, *Food & Pantry*, *Holiday & Seasonal*, *Home Office & Crafts*, *Leisure*, *Textiles*, *Tools*).
   - **Cross-Category Sync:** Selecting a shared subcategory in one branch automatically syncs across all categories where it appears.
   - **Live Search & Custom "Other" Items:** Filter categories in real time or add custom items with a 3-tier weight selector (`Light <15 lbs`, `Medium 15–40 lbs`, `Heavy 40+ lbs`).
3. **Automated Weight Load & Mounting Matcher (Step 4):**
   - Calculates required shelf/bay weight capacity from your selected items and lets you confirm or override target weight tier and mounting preference (*Off-the-Floor Wall-Hung* vs. *Freestanding*).
   - Assumes heavy-duty drywall hollow-wall anchors where studs do not align—no stud-spacing constraints required.
4. **Multi-Brand Comparison & Up to 5 Skeleton Variations (Step 5):**
   - Matches against standardized JSON catalogs in `/data/catalog/*.json` (**The Container Store Elfa Classic**, interchangeable **Elfa Décor+ & Garage+**, **IKEA BOAXEL**, **IKEA PAX**, **IKEA BROR**, **Rubbermaid FastTrack & ClosetMaid Pro**).
   - Generates up to **5 structural frame variations** per brand (*Maximum Coverage*, *Wider Bays / Lower Cost*, *High Load Density*, *Slope & Step Hugging*, and *Centered Symmetrical*).
5. **Interactive Visual Shelf & Component Builder (Step 6):**
   - Place shelves, enclosed drawers, pull-out mesh baskets, clothes rods, and pegboard panels into any bay.
   - Drag components vertically along uprights (snapping to each system's real slot intervals) with live vertical clearance readouts.
   - Automatically resolves required brackets and anchor packs in the background Bill of Materials.
6. **Itemized Shopping List & 8.5" × 11" Portrait Print Blueprint (Steps 7 & 8):**
   - Complete parts list with SKUs, measurements, designations, descriptions, quantities, and pricing.
   - Dedicated **8.5" × 11" portrait print stylesheet** featuring a Page 1 2D elevation blueprint diagram, multi-page SKU table, brand summary, and authorized retail stores list.
7. **Local Persistence, Folders & Branching ("My Designs" Sidebar):**
   - Organize saved designs into room folders (*Pantry*, *Garage*, *Closets*), overwrite saves, or fork new design branches.
   - Includes **Cascade Protection** when modifying upstream measurements or weight tiers after downstream shelf work exists.

---

## Prerequisites

- **Node.js** (v18+ recommended; tested with v26)
- **npm** (v9+ recommended)

---

## Installation & Execution

1. **Navigate to the project directory:**
   ```bash
   cd /Users/allochka/Documents/Code/agy2-Projects/BuilderBuddy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Once started, open the local URL shown in your terminal (by default **`http://localhost:5173`**) in any desktop or tablet browser.

4. **Build for production (optional):**
   ```bash
   npm run build
   npm run preview
   ```

---

## Project Structure

```text
BuilderBuddy/
├── data/
│   └── catalog/                     # Standardized decimal-inch JSON catalogs (BuilderMiner compatible)
│       ├── elfa-classic.json
│       ├── elfa-decor-garage.json   # Interchangeable Elfa Décor+ & Garage+ lines
│       ├── ikea-boaxel.json
│       ├── ikea-pax.json
│       ├── ikea-bror.json
│       └── hardware-retailers.json  # Rubbermaid FastTrack & ClosetMaid Pro (Lowe's / Home Depot)
├── src/
│   ├── components/
│   │   ├── canvas/SpaceCanvas.tsx   # Proportional 2D Elevation & Top-View SVG Canvas
│   │   ├── steps/                   # Workflow Steps 1 through 8
│   │   ├── CascadeModal.tsx         # Upstream parameter change protection modal
│   │   ├── MyDesignsSidebar.tsx     # Right-hand room folders & design branching drawer
│   │   └── NavbarStepper.tsx        # Non-linear step navigation & unit switcher
│   ├── data/
│   │   ├── catalogLoader.ts         # Loads JSON systems from /data/catalog/
│   │   └── categories.ts            # Alphabetical multi-level inventory taxonomy
│   ├── types/builder.ts             # TypeScript domain contracts
│   ├── utils/
│   │   ├── layoutEngine.ts          # Weight heuristics, 5-variation solver & BOM generator
│   │   └── units.ts                 # Decimal inches <-> centimeters conversion
│   ├── App.tsx                      # Application state & localStorage persistence
│   └── main.tsx                     # Application entry point
├── PRD.md                           # Product Requirements Document (Markdown)
├── PRD.docx                         # Product Requirements Document (Word)
├── prompt.md                        # Refined application prompt specification
└── how-it-started.md                # Original story & photos
```
