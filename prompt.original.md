Here is the exact original text of [prompt.md](file:///Users/allochka/Documents/Code/agy2-Projects/BuilderBuddy/prompt.md) from when we first viewed it at the start of our session (45 lines):

```markdown
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

The application should be accessible and usable on either device, keep this in mind when designing user pages. 

## Application flow:

1. Welcome page, explain what the application can do.  Start building button - call to action.
2. Ask the user to provide the measurement through a graphical interface.
    1. ask the user to pick whether they are measuring in inches or cm.
    2. allow the user to draw out the space - side view and top view - and to indicate measurements
    3. Allow the user to toggle between side view and top view
    4. Allow the user to name walls for reference
    5. Once the user provides measurements, scale the drawing so that the space fits on the screen and the sides / walls are correctly proportional to each other based on the measurements given
3. Ask the user about the types of stuff the space will store. The user should be able to expand each category and select a sub-category via a multi-select checkbox.  These are the categories, I want you to come up with additional categories along the same lines and 1-3 levels of subcategories for each.  In the application, order these alphabetically.  It's ok to have subcategories displayed in multiple categories, but if the user selects the subcategory in one category, it should be selected in all categories.  Allow the user to offer "other" if they don't find their stuff listed.  Allow the user to search and show them the category / subcategory in the tree if it's found:
    1. Tools
    2. Cleaning Supplies
        1. Car
        2. Home
    3. Textiles
        1. Clothes
        2. Towels
        3. Bedding
    4. Leisure
        1. Travel
        2. Games
        3. Sports Equipment
    6. Food
4. Backend logic before this screen: search available systems via Home Depot, Container Store, Ikea, Lowes - other storage system suppliers and identify system variations based on weight load, mouting, and measurements.  Tell the user the weight load capacity range likely needed based on their input so far; let them confirm it.
5. Once the user confirms the weight load for the system, propose a few design ideas and let the user select each to visualize it in the space.  For each design brand selected
    1. present up to 5 design variations to the user and let them review each design variation.
    2. For each design variation: show how the skeleton of the storage system would line up in their space.  no need to place shelves yet - just the general frame
    3. Let the user pick one to work through the design 
6. Detailed design work - once the user selects the design, show them options of shelving from the selected brand / system.  Let the user add / remove shelves in the visual tool.
