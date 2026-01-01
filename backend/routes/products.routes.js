const express = require('express');
const router = express.Router();
const db = require('../config/database').promisePool;

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
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
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
      WHERE product_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
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

