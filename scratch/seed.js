const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newProducts = [
  // Furniture
  {
    name: 'Travertine Coffee Table',
    slug: 'travertine-coffee-table',
    description: 'Crafted from solid Italian travertine stone with a honed finish. Features rounded pillar legs and a soft, tactile surface that highlights natural geological texture.',
    price: 1850.00,
    category_slug: 'furniture',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'],
    stock: 8
  },
  {
    name: 'Minimalist Bouclé Sofa',
    slug: 'minimalist-boucle-sofa',
    description: 'A low-profile modular sofa upholstered in a luxurious, textured cream bouclé fabric. Soft curves meet structured geometric lines for a calm lounge experience.',
    price: 3400.00,
    category_slug: 'furniture',
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1000'],
    stock: 4
  },
  // Lighting
  {
    name: 'Alabaster Sconce',
    slug: 'alabaster-sconce',
    description: 'Carved solid Spanish alabaster cylinder mounted on a brushed brass fixture. Emits a warm, marbled light showing the natural veins of the stone.',
    price: 420.00,
    category_slug: 'lighting',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1000'],
    stock: 18
  },
  {
    name: 'Sculptural Floor Lamp',
    slug: 'sculptural-floor-lamp',
    description: 'Hand-spun steel base with an adjustable matte black arm and dome shade. A functional sculpture providing direct task lighting and indirect ambient reflection.',
    price: 750.00,
    category_slug: 'lighting',
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=1000'],
    stock: 10
  },
  // Accessories
  {
    name: 'Brushed Brass Catchall',
    slug: 'brushed-brass-catchall',
    description: 'Solid cast brass dish, hand-polished with a brushed satin finish. Designed for entryways, desks, or nightstands to hold daily essentials.',
    price: 180.00,
    category_slug: 'accessories',
    images: ['https://images.unsplash.com/photo-1532635211-8ec15f2ce05c?auto=format&fit=crop&q=80&w=1000'],
    stock: 35
  },
  {
    name: 'Leather Desk Mat',
    slug: 'leather-desk-mat',
    description: 'Made from vegetable-tanned full-grain leather that will develop a rich patina over time. Smooth surface with hand-stitched details.',
    price: 220.00,
    category_slug: 'accessories',
    images: ['https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=1000'],
    stock: 20
  },
  // Decor
  {
    name: 'Merino Wool Throw',
    slug: 'merino-wool-throw',
    description: 'Woven from ultra-soft Australian Merino wool in a quiet sand and charcoal grid pattern. Finished with delicate fringed edges.',
    price: 290.00,
    category_slug: 'decor',
    images: ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1000'],
    stock: 30
  },
  {
    name: 'Stoneware Ribbed Vase',
    slug: 'stoneware-ribbed-vase',
    description: 'Wheel-thrown stoneware featuring a deeply ribbed tactile surface and a textured matte white glaze. Beautiful with simple branches or as a standalone piece.',
    price: 145.00,
    category_slug: 'decor',
    images: ['https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&q=80&w=1000'],
    stock: 22
  }
];

async function seed() {
  console.log("Fetching categories from Supabase...");
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error("Error fetching categories:", catError);
    return;
  }

  console.log(`Found ${categories.length} categories.`);
  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.slug] = c.id;
  });

  console.log("Seeding products...");
  for (const prod of newProducts) {
    const categoryId = categoryMap[prod.category_slug];
    if (!categoryId) {
      console.warn(`Category slug '${prod.category_slug}' not found for product '${prod.name}'. Skipping.`);
      continue;
    }

    const { category_slug, ...dbProduct } = prod;
    dbProduct.category_id = categoryId;
    dbProduct.is_active = true;

    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', dbProduct.slug)
      .maybeSingle();

    if (existing) {
      console.log(`Product '${dbProduct.name}' already exists. Updating price & stock.`);
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: dbProduct.price, stock: dbProduct.stock, description: dbProduct.description, images: dbProduct.images })
        .eq('id', existing.id);
      if (updateError) {
        console.error(`Error updating '${dbProduct.name}':`, updateError);
      }
    } else {
      console.log(`Inserting '${dbProduct.name}'...`);
      const { error: insertError } = await supabase
        .from('products')
        .insert(dbProduct);
      if (insertError) {
        console.error(`Error inserting '${dbProduct.name}':`, insertError);
      }
    }
  }

  console.log("Seeding process completed!");
}

seed();
