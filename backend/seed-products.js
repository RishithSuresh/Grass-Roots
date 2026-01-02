const db = require('./config/database').promisePool;

// Demo products (25 items matching frontend)
const DEMO_PRODUCTS = [
  // Vegetables (10 items)
  { name: 'Tomato (Cherry)', price: 45.0, stock: 120, description: 'Fresh cherry tomatoes, sweet and juicy.' },
  { name: 'Potato', price: 25.0, stock: 300, description: 'Farm-fresh potatoes, perfect for all dishes.' },
  { name: 'Onion (Red)', price: 35.0, stock: 250, description: 'Premium red onions, locally sourced.' },
  { name: 'Green Chilli', price: 30.0, stock: 200, description: 'Spicy green chillies, fresh from farm.' },
  { name: 'Carrot', price: 40.0, stock: 180, description: 'Crunchy orange carrots, rich in vitamins.' },
  { name: 'Cabbage', price: 20.0, stock: 150, description: 'Fresh green cabbage, crisp and healthy.' },
  { name: 'Cauliflower', price: 35.0, stock: 100, description: 'White cauliflower, perfect for curries.' },
  { name: 'Spinach', price: 30.0, stock: 90, description: 'Fresh spinach leaves, iron-rich greens.' },
  { name: 'Brinjal (Eggplant)', price: 28.0, stock: 140, description: 'Purple brinjal, great for bharta.' },
  { name: 'Cucumber', price: 25.0, stock: 160, description: 'Fresh cucumbers, cool and refreshing.' },
  
  // Grains & Pulses (8 items)
  { name: 'Organic Basmati Rice', price: 80.0, stock: 500, description: 'Premium organic rice, long grain aromatic.' },
  { name: 'Brown Rice', price: 70.0, stock: 400, description: 'Healthy brown rice, high in fiber.' },
  { name: 'Wheat Flour (Atta)', price: 45.0, stock: 600, description: 'Stone-ground whole wheat flour.' },
  { name: 'Toor Dal (Pigeon Pea)', price: 120.0, stock: 200, description: 'Premium quality toor dal, protein-rich.' },
  { name: 'Moong Dal (Green Gram)', price: 110.0, stock: 180, description: 'Split moong dal, easy to digest.' },
  { name: 'Chana Dal (Bengal Gram)', price: 100.0, stock: 220, description: 'Yellow chana dal, rich in protein.' },
  { name: 'Rajma (Kidney Beans)', price: 130.0, stock: 150, description: 'Red kidney beans, perfect for curry.' },
  { name: 'Chickpeas (Kabuli Chana)', price: 90.0, stock: 170, description: 'White chickpeas, versatile legume.' },
  
  // Fruits (7 items)
  { name: 'Banana (Robusta)', price: 50.0, stock: 200, description: 'Fresh robusta bananas, naturally sweet.' },
  { name: 'Apple (Shimla)', price: 150.0, stock: 100, description: 'Crisp Shimla apples, premium quality.' },
  { name: 'Mango (Alphonso)', price: 200.0, stock: 80, description: 'King of mangoes, sweet and juicy.' },
  { name: 'Papaya', price: 40.0, stock: 120, description: 'Ripe papayas, rich in vitamins.' },
  { name: 'Watermelon', price: 30.0, stock: 150, description: 'Sweet watermelons, perfect for summer.' },
  { name: 'Grapes (Green)', price: 80.0, stock: 90, description: 'Seedless green grapes, fresh and sweet.' },
  { name: 'Pomegranate', price: 120.0, stock: 70, description: 'Ruby red pomegranates, antioxidant-rich.' }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');

    // Check existing products
    const [existing] = await db.query('SELECT COUNT(*) as count FROM products');
    console.log(`📊 Found ${existing[0].count} existing products`);

    // Only add products that don't exist
    const sql = `
      INSERT INTO products
      (retailer_id, product_name, selling_price, quantity_in_stock, description, status, created_at)
      VALUES (1, ?, ?, ?, ?, 'in_stock', NOW())
    `;

    let added = 0;
    for (const product of DEMO_PRODUCTS) {
      // Check if product already exists
      const [check] = await db.query('SELECT product_id FROM products WHERE product_name = ?', [product.name]);

      if (check.length === 0) {
        await db.query(sql, [
          product.name,
          product.price,
          product.stock,
          product.description
        ]);
        console.log(`✅ Added: ${product.name}`);
        added++;
      } else {
        console.log(`⏭️  Skipped (exists): ${product.name}`);
      }
    }

    console.log(`\n🎉 Successfully added ${added} new products!`);
    console.log(`📦 Total products in database: ${existing[0].count + added}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding products:', err);
    process.exit(1);
  }
}

seedProducts();

