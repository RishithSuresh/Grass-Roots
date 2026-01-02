const express = require('express');
const router = express.Router();
const db = require('../config/database').promisePool;
const fs = require('fs');
const path = require('path');
const FALLBACK_FILE = path.join(__dirname, '..', '_tmp_payload.json');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        order_id AS id,
        order_number AS orderNumber,
        subtotal AS subtotal,
        total_amount AS total,
        order_status AS status,
        payment_status AS paid,
        created_at AS createdAt
      FROM orders
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);

    // Fetch items for each order
    for (const order of rows) {
      const itemsSql = `
        SELECT
          order_item_id AS id,
          product_id AS productId,
          product_name AS name,
          quantity AS qty,
          unit_price AS price,
          total_price AS total
        FROM order_items
        WHERE order_id = ?
      `;
      const [items] = await db.query(itemsSql, [order.id]);
      order.items = items;
    }

    // also include any fallback orders stored in file
    try {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
      const parsed = JSON.parse(raw || '[]');
      const fallback = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      return res.json([...fallback, ...rows]);
    } catch (e) {
      return res.json(rows);
    }
  } catch (err) {
    console.error('Error fetching orders from DB, falling back to file:', err.message || err);
    // fallback to local file storage
    try {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
      const data = JSON.parse(raw || '[]');
      return res.json(data);
    } catch (e) {
      console.error('Failed to read fallback orders file:', e.message || e);
      return res.json([]);
    }
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const sql = `
      SELECT
        order_id AS id,
        order_number AS orderNumber,
        subtotal AS subtotal,
        total_amount AS total,
        order_status AS status,
        payment_status AS paid,
        created_at AS createdAt
      FROM orders
      WHERE order_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.id]);
    if (rows.length === 0) {
      // try fallback file
      try {
        const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
        const data = JSON.parse(raw || '[]');
        const o = data.find(x => String(x.id) === String(req.params.id));
        if (!o) return res.status(404).json({ error: 'Order not found' });
        return res.json({ order: o, items: o.items || [] });
      } catch (e) {
        return res.status(404).json({ error: 'Order not found' });
      }
    }

    // Get order items (map DB columns to API shape)
    const itemsSql = `
      SELECT
        order_item_id AS id,
        product_id AS productId,
        product_name AS name,
        quantity AS qty,
        unit_price AS price,
        total_price AS total
      FROM order_items
      WHERE order_id = ?
    `;
    const [items] = await db.query(itemsSql, [req.params.id]);

    res.json({ order: rows[0], items });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST create new order
router.post('/', async (req, res) => {
  try {
    const { id, items, total, status, paid } = req.body;

    // Try to insert into DB using order_number (client id) and best-effort fields
    try {
      const insertSql = `INSERT INTO orders (retailer_id, customer_name, customer_phone, delivery_address_line1, delivery_city, delivery_state, delivery_pincode, order_number, subtotal, total_amount, order_status, payment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
      // Provide minimal placeholder values for required fields
      const placeholders = [1, 'Guest', '0000000000', 'N/A', 'City', 'State', '000000', id || ('o_' + Date.now()), total || 0, total || 0, status || 'pending', (paid ? 'paid' : 'pending')];
      const [result] = await db.query(insertSql, placeholders);

      const orderId = result.insertId;
      if (items && items.length > 0) {
        for (const item of items) {
          const itemSql = `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
          await db.query(itemSql, [orderId, item.productId || 0, item.name || '', item.qty || 0, item.price || 0, (item.qty || 0) * (item.price || 0)]);
        }
      }

      return res.status(201).json({ message: 'Order created', id: orderId });
    } catch (dbErr) {
      console.error('DB insert failed, falling back to file store:', dbErr.message || dbErr);
      // Fallback: append to file (robust parsing)
      try {
        let arr = [];
        try {
          const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
          const parsed = JSON.parse(raw || '[]');
          if (Array.isArray(parsed)) arr = parsed;
          else if (parsed) arr = [parsed];
        } catch (parseErr) {
          arr = [];
        }
        arr.push(req.body);
        fs.writeFileSync(FALLBACK_FILE, JSON.stringify(arr, null, 2));
        return res.status(201).json({ message: 'Order stored in fallback', id: req.body.id });
      } catch (fe) {
        console.error('Failed to write fallback file:', fe.message || fe);
        return res.status(500).json({ error: 'Failed to create order' });
      }
    }
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order
router.put('/:id', async (req, res) => {
  try {
    const { status, paid } = req.body;
    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('order_status = ?');
      values.push(status);
    }
    if (paid !== undefined) {
      updates.push('payment_status = ?');
      values.push(paid ? 'paid' : 'pending');
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const [result] = await db.query(`UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`, values);

    res.json({ message: 'Order updated' });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    // Delete order items first
    await db.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    // Delete order
    await db.query('DELETE FROM orders WHERE order_id = ?', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;

