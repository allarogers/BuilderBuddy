import { InventoryNode } from '../types/builder';

/**
 * Alphabetical 1-3 level inventory category tree.
 * Note: Subcategories that appear in multiple parent categories share the same `canonicalId`
 * (for example, `car-cleaning-fluids`, `paper-products-towels`, `storage-totes-bins`, `small-appliances`)
 * so checking/unchecking in one category automatically syncs across all occurrences.
 */
export const INVENTORY_CATEGORIES: InventoryNode[] = [
  {
    id: 'cat-automotive',
    canonicalId: 'cat-automotive',
    name: 'Automotive & Garage',
    weightLbsPerShelf: 45,
    weightTier: 'heavy',
    tag: 'automotive',
    children: [
      {
        id: 'auto-car-care',
        canonicalId: 'car-cleaning-fluids',
        name: 'Car Care, Wash & Detailing Supplies (Shared)',
        weightLbsPerShelf: 35,
        weightTier: 'medium',
        tag: 'cleaning-car',
        children: [
          {
            id: 'auto-fluids',
            canonicalId: 'motor-oil-fluids',
            name: 'Motor Oil, Coolant & Wiper Fluids',
            weightLbsPerShelf: 55,
            weightTier: 'heavy',
            tag: 'automotive'
          },
          {
            id: 'auto-detail-kits',
            canonicalId: 'car-wax-polish-buckets',
            name: 'Buckets, Wash Mitts & Polishes',
            weightLbsPerShelf: 25,
            weightTier: 'medium',
            tag: 'cleaning-car'
          }
        ]
      },
      {
        id: 'auto-parts',
        canonicalId: 'auto-parts-accessories',
        name: 'Auto Parts, Jacks & Ramps',
        weightLbsPerShelf: 75,
        weightTier: 'heavy',
        tag: 'automotive'
      },
      {
        id: 'auto-tires',
        canonicalId: 'tires-roof-racks',
        name: 'Spare Tires, Chains & Roof Cargo Boxes',
        weightLbsPerShelf: 95,
        weightTier: 'heavy',
        tag: 'automotive'
      },
      {
        id: 'auto-totes',
        canonicalId: 'storage-totes-bins',
        name: 'Heavy Plastic Storage Totes & Bins (Shared)',
        weightLbsPerShelf: 50,
        weightTier: 'heavy',
        tag: 'holiday'
      }
    ]
  },
  {
    id: 'cat-cleaning',
    canonicalId: 'cat-cleaning',
    name: 'Cleaning Supplies',
    weightLbsPerShelf: 30,
    weightTier: 'medium',
    tag: 'cleaning-home',
    children: [
      {
        id: 'clean-car-branch',
        canonicalId: 'car-cleaning-fluids',
        name: 'Car (Shared with Automotive)',
        weightLbsPerShelf: 35,
        weightTier: 'medium',
        tag: 'cleaning-car',
        children: [
          {
            id: 'clean-car-wax',
            canonicalId: 'car-wax-polish-buckets',
            name: 'Buckets, Wash Mitts & Polishes',
            weightLbsPerShelf: 25,
            weightTier: 'medium',
            tag: 'cleaning-car'
          },
          {
            id: 'clean-car-vac',
            canonicalId: 'shop-hand-vacuums',
            name: 'Portable & Shop Vacuums',
            weightLbsPerShelf: 30,
            weightTier: 'medium',
            tag: 'cleaning-car'
          }
        ]
      },
      {
        id: 'clean-home-branch',
        canonicalId: 'clean-home',
        name: 'Home',
        weightLbsPerShelf: 30,
        weightTier: 'medium',
        tag: 'cleaning-home',
        children: [
          {
            id: 'clean-home-detergents',
            canonicalId: 'bulk-detergents-bleach',
            name: 'Bulk Laundry Detergents, Bleach & Sprays',
            weightLbsPerShelf: 45,
            weightTier: 'heavy',
            tag: 'cleaning-home'
          },
          {
            id: 'clean-home-paper',
            canonicalId: 'paper-products-bulk',
            name: 'Bulk Paper Towels & Toilet Paper Packs (Shared)',
            weightLbsPerShelf: 15,
            weightTier: 'light',
            tag: 'cleaning-home'
          },
          {
            id: 'clean-home-vacuums',
            canonicalId: 'home-vacuums-mops',
            name: 'Vacuums, Steamers, Brooms & Mops',
            weightLbsPerShelf: 28,
            weightTier: 'medium',
            tag: 'cleaning-home'
          }
        ]
      }
    ]
  },
  {
    id: 'cat-food',
    canonicalId: 'cat-food',
    name: 'Food & Pantry',
    weightLbsPerShelf: 55,
    weightTier: 'heavy',
    tag: 'food',
    children: [
      {
        id: 'food-beverages',
        canonicalId: 'beverage-crates-water',
        name: 'Beverage Cases, Sparkling Water & Wine Bottles',
        weightLbsPerShelf: 75,
        weightTier: 'heavy',
        tag: 'food'
      },
      {
        id: 'food-canned',
        canonicalId: 'canned-goods-glass-jars',
        name: 'Canned Goods, Pickles & Glass Mason Jars',
        weightLbsPerShelf: 65,
        weightTier: 'heavy',
        tag: 'food'
      },
      {
        id: 'food-dry-bulk',
        canonicalId: 'dry-bulk-grains-pasta',
        name: 'Dry Bulk (Grains, Buckwheat, Pasta, Flour & Rice)',
        weightLbsPerShelf: 45,
        weightTier: 'heavy',
        tag: 'food'
      },
      {
        id: 'food-paper',
        canonicalId: 'paper-products-bulk',
        name: 'Bulk Paper Towels & Napkins (Shared)',
        weightLbsPerShelf: 15,
        weightTier: 'light',
        tag: 'food'
      },
      {
        id: 'food-appliances',
        canonicalId: 'small-kitchen-appliances',
        name: 'Small Appliances (Stand Mixer, Instant Pot, Air Fryer)',
        weightLbsPerShelf: 50,
        weightTier: 'heavy',
        tag: 'food'
      }
    ]
  },
  {
    id: 'cat-holiday',
    canonicalId: 'cat-holiday',
    name: 'Holiday & Seasonal',
    weightLbsPerShelf: 35,
    weightTier: 'medium',
    tag: 'holiday',
    children: [
      {
        id: 'holiday-trees',
        canonicalId: 'artificial-trees-wreaths',
        name: 'Artificial Trees, Wreaths & Yard Inflatables',
        weightLbsPerShelf: 40,
        weightTier: 'medium',
        tag: 'holiday'
      },
      {
        id: 'holiday-decor',
        canonicalId: 'fragile-ornaments-lights',
        name: 'Ornaments, String Lights & Seasonal Decor',
        weightLbsPerShelf: 20,
        weightTier: 'light',
        tag: 'holiday'
      },
      {
        id: 'holiday-totes',
        canonicalId: 'storage-totes-bins',
        name: 'Heavy Plastic Storage Totes & Bins (Shared)',
        weightLbsPerShelf: 50,
        weightTier: 'heavy',
        tag: 'holiday'
      }
    ]
  },
  {
    id: 'cat-office',
    canonicalId: 'cat-office',
    name: 'Home Office & Crafts',
    weightLbsPerShelf: 30,
    weightTier: 'medium',
    tag: 'office',
    children: [
      {
        id: 'office-crafts',
        canonicalId: 'craft-sewing-organizers',
        name: 'Craft Bins, Yarn, Fabric & Sewing Machines',
        weightLbsPerShelf: 25,
        weightTier: 'medium',
        tag: 'office'
      },
      {
        id: 'office-archives',
        canonicalId: 'file-boxes-books-paper',
        name: 'File Boxes, Books, Reams of Paper & Printers',
        weightLbsPerShelf: 55,
        weightTier: 'heavy',
        tag: 'office'
      }
    ]
  },
  {
    id: 'cat-leisure',
    canonicalId: 'cat-leisure',
    name: 'Leisure',
    weightLbsPerShelf: 30,
    weightTier: 'medium',
    tag: 'leisure',
    children: [
      {
        id: 'leisure-games',
        canonicalId: 'board-games-puzzles',
        name: 'Games (Board Games, Puzzles & Toy Bins)',
        weightLbsPerShelf: 20,
        weightTier: 'light',
        tag: 'leisure'
      },
      {
        id: 'leisure-sports',
        canonicalId: 'sports-equipment',
        name: 'Sports Equipment',
        weightLbsPerShelf: 40,
        weightTier: 'medium',
        tag: 'leisure',
        children: [
          {
            id: 'sports-camping',
            canonicalId: 'camping-coolers-tents',
            name: 'Camping Tents, Sleeping Bags & Heavy Coolers',
            weightLbsPerShelf: 45,
            weightTier: 'heavy',
            tag: 'leisure'
          },
          {
            id: 'sports-ski-bike',
            canonicalId: 'helmets-skis-balls',
            name: 'Helmets, Balls, Rackets & Cycling Gear',
            weightLbsPerShelf: 25,
            weightTier: 'medium',
            tag: 'leisure'
          },
          {
            id: 'sports-weights',
            canonicalId: 'dumbbells-kettlebells',
            name: 'Weights, Kettlebells & Fitness Gear',
            weightLbsPerShelf: 85,
            weightTier: 'heavy',
            tag: 'leisure'
          }
        ]
      },
      {
        id: 'leisure-travel',
        canonicalId: 'travel-luggage-suitcases',
        name: 'Travel (Suitcases, Carry-Ons & Duffel Bags)',
        weightLbsPerShelf: 25,
        weightTier: 'medium',
        tag: 'leisure'
      }
    ]
  },
  {
    id: 'cat-textiles',
    canonicalId: 'cat-textiles',
    name: 'Textiles',
    weightLbsPerShelf: 20,
    weightTier: 'light',
    tag: 'textiles',
    children: [
      {
        id: 'tex-bedding',
        canonicalId: 'bedding-quilts-pillows',
        name: 'Bedding (Comforters, Sheet Sets, Blankets & Pillows)',
        weightLbsPerShelf: 18,
        weightTier: 'light',
        tag: 'textiles'
      },
      {
        id: 'tex-clothes',
        canonicalId: 'clothes-all',
        name: 'Clothes',
        weightLbsPerShelf: 25,
        weightTier: 'light',
        tag: 'textiles',
        children: [
          {
            id: 'clothes-folded',
            canonicalId: 'folded-sweaters-denim',
            name: 'Folded Sweaters, Jeans & Activewear',
            weightLbsPerShelf: 25,
            weightTier: 'light',
            tag: 'textiles'
          },
          {
            id: 'clothes-hanging',
            canonicalId: 'hanging-shirts-coats',
            name: 'Hanging Shirts, Dresses & Heavy Winter Coats',
            weightLbsPerShelf: 35,
            weightTier: 'medium',
            tag: 'textiles'
          },
          {
            id: 'clothes-shoes',
            canonicalId: 'shoes-boots-handbags',
            name: 'Shoes, Boots & Handbags',
            weightLbsPerShelf: 22,
            weightTier: 'light',
            tag: 'textiles'
          }
        ]
      },
      {
        id: 'tex-towels',
        canonicalId: 'bath-beach-towels',
        name: 'Towels (Bath Sheets, Hand Towels & Linens)',
        weightLbsPerShelf: 20,
        weightTier: 'light',
        tag: 'textiles'
      }
    ]
  },
  {
    id: 'cat-tools',
    canonicalId: 'cat-tools',
    name: 'Tools',
    weightLbsPerShelf: 65,
    weightTier: 'heavy',
    tag: 'tools',
    children: [
      {
        id: 'tools-garden',
        canonicalId: 'garden-soil-fertilizer',
        name: 'Garden & Outdoor (Potting Soil, Lawn Tools & Planters)',
        weightLbsPerShelf: 60,
        weightTier: 'heavy',
        tag: 'tools'
      },
      {
        id: 'tools-hand',
        canonicalId: 'hand-tools-wrenches',
        name: 'Hand Tools (Hammers, Socket Sets & Screwdrivers)',
        weightLbsPerShelf: 45,
        weightTier: 'heavy',
        tag: 'tools'
      },
      {
        id: 'tools-power',
        canonicalId: 'power-tools-saws-drills',
        name: 'Power Tools (Drills, Circular Saws, Sanders & Chargers)',
        weightLbsPerShelf: 65,
        weightTier: 'heavy',
        tag: 'tools'
      },
      {
        id: 'tools-boxes',
        canonicalId: 'heavy-toolboxes-hardware',
        name: 'Toolboxes, Metal Chests & Bulk Hardware Organizers',
        weightLbsPerShelf: 80,
        weightTier: 'heavy',
        tag: 'tools'
      }
    ]
  }
];

export function flattenInventoryNodes(nodes: InventoryNode[] = INVENTORY_CATEGORIES): InventoryNode[] {
  const result: InventoryNode[] = [];
  const walk = (list: InventoryNode[]) => {
    for (const n of list) {
      result.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return result;
}
