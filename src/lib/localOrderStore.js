const fs = require('fs');
const path = require('path');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? '/tmp' : path.join(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'local_orders.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {}
  }
}

function loadOrders() {
  try {
    ensureDataDir();
    if (!fs.existsSync(ORDERS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[LocalOrderStore] Could not read orders file:', err.message);
    return [];
  }
}

function saveOrders(orders) {
  try {
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[LocalOrderStore] Could not save orders file:', err.message);
    return false;
  }
}

function createOrder(orderData) {
  const orders = loadOrders();
  const newOrder = {
    id: 'ord_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    orderCode: orderData.orderCode,
    userId: orderData.userId || null,
    customerEmail: orderData.customerEmail || '',
    customerName: orderData.customerName || '',
    customerPhone: orderData.customerPhone || '',
    planCode: orderData.planCode,
    planName: orderData.planName || (orderData.planCode === 'PREMIUM_1Y' ? 'Sophia Premium - Gói Năm' : 'Sophia Premium - Gói Tháng'),
    amountVnd: orderData.amountVnd,
    provider: orderData.provider || 'VIETQR',
    status: orderData.status || 'PENDING',
    transactionRef: orderData.transactionRef || null,
    notes: orderData.notes || '',
    createdAt: new Date().toISOString(),
    expiresAt: orderData.expiresAt ? new Date(orderData.expiresAt).toISOString() : new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    paidAt: null,
    verifiedAt: null
  };

  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

function findByCode(orderCode) {
  if (!orderCode) return null;
  const orders = loadOrders();
  return orders.find(o => String(o.orderCode).toUpperCase() === String(orderCode).toUpperCase()) || null;
}

function updateOrder(orderCode, updates) {
  if (!orderCode) return null;
  const orders = loadOrders();
  const idx = orders.findIndex(o => String(o.orderCode).toUpperCase() === String(orderCode).toUpperCase());
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveOrders(orders);
  return orders[idx];
}

function listOrders(filter = {}) {
  const orders = loadOrders();
  if (!filter || Object.keys(filter).length === 0) return orders;

  return orders.filter(o => {
    if (filter.userId && o.userId !== filter.userId) return false;
    if (filter.status && o.status !== filter.status) return false;
    if (filter.customerEmail && o.customerEmail !== filter.customerEmail) return false;
    return true;
  });
}

module.exports = {
  createOrder,
  findByCode,
  updateOrder,
  listOrders
};
