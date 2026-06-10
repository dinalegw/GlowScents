// Glow Scents Cart Manager
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('glow_scents_cart') || '[]');
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: product.size,
      category: product.category,
      qty: 1
    });
  }
  localStorage.setItem('glow_scents_cart', JSON.stringify(cart));
  updateCartBadge();
  showCartToast(product.name);
}

function updateCartBadge() {
  const cartEl = document.getElementById('nav-cart-count');
  if (!cartEl) return;
  try {
    const cart = JSON.parse(localStorage.getItem('glow_scents_cart') || '[]');
    const count = cart.reduce((s, i) => s + i.qty, 0);
    cartEl.textContent = count;
  } catch(e) {}
}

function showCartToast(name) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:9999;
      background:#1a0a00;color:#d4a843;
      padding:14px 20px;border-radius:10px;
      font-family:'Jost',sans-serif;font-size:14px;
      box-shadow:0 8px 32px rgba(0,0,0,0.3);
      border:1px solid rgba(212,168,67,0.3);
      transform:translateY(80px);opacity:0;
      transition:all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `✓ <strong>${name}</strong> added to cart &nbsp;<a href="/cart" style="color:#e8c87a;text-decoration:underline;">View →</a>`;
  setTimeout(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; }, 10);
  setTimeout(() => { toast.style.transform = 'translateY(80px)'; toast.style.opacity = '0'; }, 3000);
}

// Update badge on every page load
updateCartBadge();
