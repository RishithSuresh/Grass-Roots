const express = require('express');
const router = express.Router();
const db = require('../config/database').promisePool;

// Demo products fallback (25 items matching frontend)
const DEMO_PRODUCTS = [
  // Vegetables (10 items)
  { id: 'demo-0', name: 'Tomato (Cherry)', price: 45.0, stock: 120, description: 'Fresh cherry tomatoes, sweet and juicy.' },
  { id: 'demo-1', name: 'Potato', price: 25.0, stock: 300, description: 'Farm-fresh potatoes, perfect for all dishes.' },
  { id: 'demo-2', name: 'Onion (Red)', price: 35.0, stock: 250, description: 'Premium red onions, locally sourced.' },
  { id: 'demo-3', name: 'Green Chilli', price: 30.0, stock: 200, description: 'Spicy green chillies, fresh from farm.' },
  { id: 'demo-4', name: 'Carrot', price: 40.0, stock: 180, description: 'Crunchy orange carrots, rich in vitamins.' },
  { id: 'demo-5', name: 'Cabbage', price: 20.0, stock: 150, description: 'Fresh green cabbage, crisp and healthy.' },
  { id: 'demo-6', name: 'Cauliflower', price: 35.0, stock: 100, description: 'White cauliflower, perfect for curries.' },
  { id: 'demo-7', name: 'Spinach', price: 30.0, stock: 90, description: 'Fresh spinach leaves, iron-rich greens.' },
  { id: 'demo-8', name: 'Brinjal (Eggplant)', price: 28.0, stock: 140, description: 'Purple brinjal, great for bharta.' },
  { id: 'demo-9', name: 'Cucumber', price: 25.0, stock: 160, description: 'Fresh cucumbers, cool and refreshing.' },

  // Grains & Pulses (8 items)
  { id: 'demo-10', name: 'Organic Basmati Rice', price: 80.0, stock: 500, description: 'Premium organic rice, long grain aromatic.' },
  { id: 'demo-11', name: 'Brown Rice', price: 70.0, stock: 400, description: 'Healthy brown rice, high in fiber.' },
  { id: 'demo-12', name: 'Wheat Flour (Atta)', price: 45.0, stock: 600, description: 'Stone-ground whole wheat flour.' },
  { id: 'demo-13', name: 'Toor Dal (Pigeon Pea)', price: 120.0, stock: 200, description: 'Premium quality toor dal, protein-rich.' },
  { id: 'demo-14', name: 'Moong Dal (Green Gram)', price: 110.0, stock: 180, description: 'Split moong dal, easy to digest.' },
  { id: 'demo-15', name: 'Chana Dal (Bengal Gram)', price: 100.0, stock: 220, description: 'Yellow chana dal, rich in protein.' },
  { id: 'demo-16', name: 'Rajma (Kidney Beans)', price: 130.0, stock: 150, description: 'Red kidney beans, perfect for curry.' },
  { id: 'demo-17', name: 'Chickpeas (Kabuli Chana)', price: 90.0, stock: 170, description: 'White chickpeas, versatile legume.' },

  // Fruits (7 items)
  { id: 'demo-18', name: 'Banana (Robusta)', price: 50.0, stock: 200, description: 'Fresh robusta bananas, naturally sweet.' },
  { id: 'demo-19', name: 'Apple (Shimla)', price: 150.0, stock: 100, description: 'Crisp Shimla apples, premium quality.' },
  { id: 'demo-20', name: 'Mango (Alphonso)', price: 200.0, stock: 80, description: 'King of mangoes, sweet and juicy.' },
  { id: 'demo-21', name: 'Papaya', price: 40.0, stock: 120, description: 'Ripe papayas, rich in vitamins.' },
  { id: 'demo-22', name: 'Watermelon', price: 30.0, stock: 150, description: 'Sweet watermelons, perfect for summer.' },
  { id: 'demo-23', name: 'Grapes (Green)', price: 80.0, stock: 90, description: 'Seedless green grapes, fresh and sweet.' },
  { id: 'demo-24', name: 'Pomegranate', price: 120.0, stock: 70, description: 'Ruby red pomegranates, antioxidant-rich.' }
];

// GET all products (alias columns to API shape expected by frontend)
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        product_id AS id,
        product_name AS name,
        selling_price AS price,
        quantity_in_stock AS stock,
        description,
        status
      FROM products
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);

    // If no products in DB, return demo products
    if (!rows || rows.length === 0) {
      console.log('No products in database, returning demo products');
      return res.json(DEMO_PRODUCTS);
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    // Return demo products on error
    console.log('Database error, returning demo products');
    res.json(DEMO_PRODUCTS);
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    // Check if it's a demo product ID
    if (req.params.id.startsWith('demo-')) {
      const product = DEMO_PRODUCTS.find(p => p.id === req.params.id);
      if (product) {
        return res.json(product);
      }
      return res.status(404).json({ error: 'Product not found' });
    }

    const sql = `
      SELECT
        product_id AS id,
        product_name AS name,
        selling_price AS price,
        quantity_in_stock AS stock,
        description,
        status
      FROM products
      WHERE product_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    // Try to find in demo products as fallback
    const product = DEMO_PRODUCTS.find(p => p.id === req.params.id);
    if (product) {
      return res.json(product);
    }
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product
router.post('/', async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;

    // Insert with minimal required fields (product_id is auto-increment)
    // Using retailer_id = 1 as default (you can change this based on logged-in user)
    const sql = `
      INSERT INTO products
      (retailer_id, product_name, selling_price, quantity_in_stock, description, status, created_at)
      VALUES (1, ?, ?, ?, ?, 'in_stock', NOW())
    `;
    const [result] = await db.query(sql, [name, price || 0, stock || 0, description || '']);

    res.status(201).json({
      message: 'Product created',
      id: result.insertId.toString()
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('product_name = ?');
      values.push(name);
    }
    if (price !== undefined) {
      updates.push('selling_price = ?');
      values.push(price);
    }
    if (stock !== undefined) {
      updates.push('quantity_in_stock = ?');
      values.push(stock);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    await db.query(`UPDATE products SET ${updates.join(', ')} WHERE product_id = ?`, values);

    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;

