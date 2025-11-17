const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

router.get('/', async (req, res) => {
  const list = await Order.findAll({ order: [['createdAt', 'DESC']] });
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const o = await Order.findByPk(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  const items = await OrderItem.findAll({ where: { orderId: o.id } });
  res.json({ order: o, items });
});

router.post('/', async (req, res) => {
  const payload = req.body;
  try {
    const o = await Order.create({ id: payload.id, total: payload.total, status: payload.status || 'Pending', paid: !!payload.paid });
    if (Array.isArray(payload.items)) {
      for (const it of payload.items) {
        await OrderItem.create({ orderId: o.id, productId: it.productId, name: it.name, qty: it.qty, price: it.price });
      }
    }
    res.status(201).json({ id: o.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const o = await Order.findByPk(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  await o.update(req.body);
  res.json(o);
});

router.delete('/:id', async (req, res) => {
  const o = await Order.findByPk(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  await OrderItem.destroy({ where: { orderId: o.id } });
  await o.destroy();
  res.json({ success: true });
});

module.exports = router;
