// ==========================
// STATE
// ==========================
let menu = [];
let currentCategory = 'all';
let searchTerm = '';

const cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

const menuContainer = document.getElementById('menuContainer');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const orderTable = document.getElementById('orderTable');
const searchInput = document.getElementById('searchInput');
const deliveryOption = document.getElementById('deliveryOption');

const fallbackMenu = [
  { id: 1, name: 'Cheese Burger', category: 'burger', price: 120, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000' },
  { id: 2, name: 'Double Burger', category: 'burger', price: 180, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000' },
  { id: 3, name: 'Fried Chicken', category: 'chicken', price: 150, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=1000' },
  { id: 4, name: 'Chicken Meal', category: 'chicken', price: 190, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1000' },
  { id: 5, name: 'Iced Tea', category: 'drinks', price: 60, image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=1000' },
  { id: 6, name: 'Milk Tea', category: 'drinks', price: 90, image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?q=80&w=1000' },
  { id: 7, name: 'Chocolate Cake', category: 'dessert', price: 110, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000' },
  { id: 8, name: 'Ice Cream', category: 'dessert', price: 80, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1000' }
];

// ==========================
// FETCH MENU DATA
// ==========================
async function fetchMenu() {
  try {
    const response = await fetch('./menu.json');
    if (!response.ok) throw new Error('Menu file not available');
    menu = await response.json();
  } catch (error) {
    console.warn('Using fallback menu data', error);
    menu = fallbackMenu;
  }
  renderMenu(filterMenu());
}

function filterMenu() {
  return menu.filter(item => {
    const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function setActiveFilterButton() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === currentCategory);
  });
}

// ==========================
// RENDER MENU
// ==========================
function renderMenu(items) {
  menuContainer.innerHTML = '';
  if (!items.length) {
    menuContainer.innerHTML = '<div class="col-12 text-center text-muted">No menu items found.</div>';
    return;
  }

  items.forEach(food => {
    menuContainer.innerHTML += `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="card food-card">
          <img src="${food.image}" class="card-img-top" alt="${food.name}">
          <div class="card-body">
            <h5>${food.name}</h5>
            <p>Fresh and delicious meal.</p>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="price-tag">₱${food.price}</span>
              <span class="badge bg-secondary text-capitalize">${food.category}</span>
            </div>
            <button class="btn btn-success add-btn w-100" onclick="addToCart(${food.id})">Add To Cart</button>
          </div>
        </div>
      </div>
    `;
  });
}

// ==========================
// CART HELPERS
// ==========================
function addToCart(id) {
  const item = menu.find(food => food.id === id);
  if (!item) return;

  const existing = cart.find(food => food.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;
  let count = 0;

  if (!cart.length) {
    cartItems.innerHTML = '<div class="text-center text-muted">Your cart is empty.</div>';
  }

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    count += item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="text-muted">₱${item.price} each</div>
          </div>
          <div class="cart-item-price">₱${subtotal}</div>
        </div>
        <div class="qty-box mt-3">
          <button class="qty-btn qty-minus" onclick="decreaseQty(${item.id})">-</button>
          <span class="qty-number">${item.qty}</span>
          <button class="qty-btn qty-plus" onclick="increaseQty(${item.id})">+</button>
        </div>
      </div>
    `;
  });

  cartTotal.textContent = total;
  cartCount.textContent = count;
}

function increaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += 1;
  saveCart();
  renderCart();
}

function decreaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) {
    const index = cart.indexOf(item);
    if (index !== -1) cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getNextOrderNumber() {
  const current = Number(localStorage.getItem('orderCounter')) || 0;
  const next = current + 1;
  localStorage.setItem('orderCounter', next);
  return next;
}

// ==========================
// FILTER + SEARCH
// ==========================
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    currentCategory = button.dataset.category;
    setActiveFilterButton();
    renderMenu(filterMenu());
  });
});

searchInput.addEventListener('keyup', () => {
  searchTerm = searchInput.value;
  renderMenu(filterMenu());
});

// ==========================
// CUSTOMER INFO + DELIVERY
// ==========================
function loadCustomer() {
  const customer = JSON.parse(localStorage.getItem('customer')) || {};
  if (customer.name) document.getElementById('customerName').value = customer.name;
  if (customer.phone) document.getElementById('customerPhone').value = customer.phone;
  if (customer.address) document.getElementById('customerAddress').value = customer.address;
}

const customerForm = document.getElementById('customerForm');
customerForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!cart.length) {
    alert('Cart is empty. Add items before placing an order.');
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const delivery = deliveryOption.checked;
  const orderTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = {
    orderNumber: getNextOrderNumber(),
    id: Date.now(),
    name,
    phone,
    address,
    delivery,
    total: orderTotal,
    status: 'Pending',
    items: cart.map(item => ({ id: item.id, name: item.name, qty: item.qty, price: item.price }))
  };

  localStorage.setItem('customer', JSON.stringify({ name, phone, address }));
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  cart.splice(0, cart.length);
  saveCart();
  renderCart();
  renderOrders();
  customerForm.reset();

  const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
  if (checkoutModal) checkoutModal.hide();

  const successModal = new bootstrap.Modal(document.getElementById('successModal'));
  successModal.show();
});

// ==========================
// ADMIN ORDER MANAGEMENT
// ==========================
function renderOrders() {
  if (!orderTable) return;
  orders = JSON.parse(localStorage.getItem('orders')) || [];
  orderTable.innerHTML = '';

  if (!orders.length) {
    orderTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No orders yet.</td></tr>';
    return;
  }

  orders.forEach((order, index) => {
    orderTable.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${order.name}</td>
        <td>${order.phone}</td>
        <td>${order.address}</td>
        <td>₱${order.total}</td>
        <td><span class="${order.status === 'Pending' ? 'status-pending' : order.status === 'Confirmed' ? 'status-confirmed' : 'status-cancelled'}">${order.status}</span></td>
        <td>
          <button class="btn btn-success btn-sm me-1" onclick="confirmOrder(${order.id})">Confirm</button>
          <button class="btn btn-danger btn-sm" onclick="cancelOrder(${order.id})">Cancel</button>
        </td>
      </tr>
    `;
  });
}

function confirmOrder(id) {
  orders = orders.map(order => {
    if (order.id === id) order.status = 'Confirmed';
    return order;
  });
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
}

function cancelOrder(id) {
  orders = orders.map(order => {
    if (order.id === id) order.status = 'Cancelled';
    return order;
  });
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
}

window.addToCart = addToCart;
window.decreaseQty = decreaseQty;
window.increaseQty = increaseQty;
window.confirmOrder = confirmOrder;
window.cancelOrder = cancelOrder;

window.addEventListener('load', () => {
  fetchMenu();
  loadCustomer();
  renderCart();
  renderOrders();
  setActiveFilterButton();

  if (deliveryOption) {
    deliveryOption.addEventListener('change', () => {
      const routeContainer = document.getElementById('routeContainer');
      if (deliveryOption.checked) {
        loadRouteMap();
      } else if (routeContainer) {
        routeContainer.style.display = 'none';
      }
    });
  }
});
