const CART_KEY = 's2ugar_cart';

// Stored shape: { cakeId, name, image, quantity }
// Price is intentionally excluded — always fetched from the server.

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cartUpdated'));
};

const addItem = (cake, qty = 1) => {
  const items = getCart();
  const existing = items.find(i => i.cakeId === cake._id);
  if (existing) {
    existing.quantity += qty;
  } else {
    items.push({
      cakeId: cake._id,
      name: cake.name,
      image: cake.image || null,
      quantity: qty,
    });
  }
  saveCart(items);
  return items;
};

const removeItem = (cakeId) => {
  const items = getCart().filter(i => i.cakeId !== cakeId);
  saveCart(items);
  return items;
};

const updateQuantity = (cakeId, quantity) => {
  const items = quantity <= 0
    ? getCart().filter(i => i.cakeId !== cakeId)
    : getCart().map(i => i.cakeId === cakeId ? { ...i, quantity } : i);
  saveCart(items);
  return items;
};

const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
};

const getCount = () => getCart().reduce((sum, i) => sum + i.quantity, 0);

// Use this when submitting an order — never send price from the client.
const getOrderItems = () => getCart().map(({ cakeId, quantity }) => ({ cakeId, quantity }));

export default { getCart, addItem, removeItem, updateQuantity, clearCart, getCount, getOrderItems };
