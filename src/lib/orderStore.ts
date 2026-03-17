// Simple in-memory store for order-user mapping
// In production, use Redis or a database
const orderStore = new Map<string, { userId?: string; token: string; amount: number }>();

export const saveOrder = (orderId: string, data: { userId?: string; token: string; amount: number }) => {
  orderStore.set(orderId, data);
  console.log(`✅ Order saved: ${orderId}`, { 
    amount: data.amount, 
    hasToken: !!data.token,
    userId: data.userId || 'N/A'
  });
  
  // Auto-cleanup after 24 hours
  setTimeout(() => {
    orderStore.delete(orderId);
    console.log(`🗑️ Order expired and removed: ${orderId}`);
  }, 24 * 60 * 60 * 1000);
};

export const getOrder = (orderId: string) => {
  const order = orderStore.get(orderId);
  if (order) {
    console.log(`📦 Order retrieved: ${orderId}`, {
      amount: order.amount,
      hasToken: !!order.token
    });
  } else {
    console.log(`❌ Order not found: ${orderId}`);
  }
  return order;
};

export const deleteOrder = (orderId: string) => {
  const deleted = orderStore.delete(orderId);
  if (deleted) {
    console.log(`🗑️ Order deleted: ${orderId}`);
  }
  return deleted;
};

// For debugging - check how many orders are stored
export const getOrderCount = () => {
  console.log(`📊 Total orders in store: ${orderStore.size}`);
  return orderStore.size;
};

// For debugging - list all orders
export const getAllOrders = () => {
  const orders: Array<{ orderId: string; amount: number }> = [];
  orderStore.forEach((value, key) => {
    orders.push({ orderId: key, amount: value.amount });
  });
  return orders;
};
