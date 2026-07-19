const products = [
  { id: 1, name: "The Salt Path", author: "", category: "English", price: 18, stock: true, img: "images/book1.jpg" },
  { id: 2, name: "Midnight in the Garden", author: "", category: "English", price: 15, stock: true, img: "images/book2.jpg" },
  { id: 3, name: "The Quiet Room", author: "", category: "English", price: 20, stock: true, img: "images/book3.jpg" },
  { id: 4, name: "Atomic Habits", author: "James Clear", category: "Self-Help", price: 22, stock: true, img: "images/book4.jpg" },
  { id: 5, name: "Raja Gidh", author: "Bano Qudsia", category: "Urdu", price: 15, stock: true, img: "images/book5.jpg" },
  { id: 6, name: "Peer-e-Kamil", author: "Umera Ahmad", category: "Urdu", price: 16, stock: false, img: "images/book6.jpg" },
  { id: 7, name: "Deep Work", author: "Cal Newport", category: "Self-Help", price: 24, stock: true, img: "images/book7.jpg" },
  { id: 8, name: "Umrao Jaan Ada", author: "Mirza Hadi Ruswa", category: "Urdu", price: 17, stock: true, img: "images/book8.jpg" },
  { id: 9, name: "Don't Be Sad", author: "Aaidh ibn Abdullah al-Qarni", category: "Islamic", price: 19, stock: true, img: "images/book9.jpg" },
  { id: 10, name: "Wren and the Whale", author: "", category: "Children's", price: 12, stock: true, img: "images/book10.jpg" },
  { id: 11, name: "The Paper Lantern", author: "", category: "Children's", price: 11, stock: true, img: "images/book11.jpg" },
  { id: 12, name: "The Sealed Nectar", author: "Safiur Rahman Mubarakpuri", category: "Islamic", price: 21, stock: true, img: "images/book12.jpg" }
];

let cart = JSON.parse(localStorage.getItem("inkwell-cart") || "[]");

let state = {
  category: "all",
  search: "",
  maxPrice: 500,
  sort: "default"
};

const grid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");
const cartCount = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

function formatPrice(n){
  return "$" + n.toFixed(2);
}

function saveCart(){
  localStorage.setItem("inkwell-cart", JSON.stringify(cart));
}

function getFilteredProducts(){
  let list = products.filter(p => {
    const matchCategory = state.category === "all" || p.category === state.category;
    const matchSearch = p.name.toLowerCase().includes(state.search.toLowerCase());
    const matchPrice = p.price <= state.maxPrice;
    return matchCategory && matchSearch && matchPrice;
  });

  if(state.sort === "price-asc") list.sort((a,b) => a.price - b.price);
  if(state.sort === "price-desc") list.sort((a,b) => b.price - a.price);
  if(state.sort === "name-asc") list.sort((a,b) => a.name.localeCompare(b.name));

  return list;
}

function renderProducts(){
  const list = getFilteredProducts();
  resultsCount.textContent = `${list.length} product${list.length !== 1 ? "s" : ""}`;

  if(list.length === 0){
    grid.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  grid.innerHTML = list.map(p => `
    <div class="card">
      <img class="card-image" src="${p.img}" alt="${p.name}">
      <div class="card-body">
        <div class="card-top">
          <div>
            <h3 class="card-name">${p.name}</h3>
            ${p.author ? `<p class="card-author">${p.author}</p>` : ""}
          </div>
          <span class="card-category">${p.category}</span>
        </div>
        <div class="card-status">
          <span class="status-led" style="${p.stock ? "" : "background:#C05C48;"}"></span>
          ${p.stock ? "In stock" : "Out of stock"}
        </div>
        <div class="card-footer">
          <span class="card-price">${formatPrice(p.price)}</span>
          <button class="add-btn" data-id="${p.id}" ${p.stock ? "" : "disabled style='opacity:0.4;cursor:not-allowed;'"}>
            ${p.stock ? "Add to cart" : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id), btn));
  });
}

function addToCart(id, btn){
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if(existing){
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`);

  if(btn){
    btn.classList.add("added");
    btn.textContent = "Added";
    setTimeout(() => {
      btn.classList.remove("added");
      btn.textContent = "Add to cart";
    }, 900);
  }
}

function updateQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeItem(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function renderCart(){
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalItems;

  if(cart.length === 0){
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    cartTotalEl.textContent = formatPrice(0);
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <span class="cart-item-price">${formatPrice(item.price)}</span>
        <div class="qty-controls">
          <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotalEl.textContent = formatPrice(total);

  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const delta = btn.dataset.action === "plus" ? 1 : -1;
      updateQty(id, delta);
    });
  });
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeItem(parseInt(btn.dataset.id)));
  });
}

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

document.getElementById("categoryChips").addEventListener("click", (e) => {
  if(!e.target.classList.contains("chip")) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  e.target.classList.add("active");
  state.category = e.target.dataset.category;
  renderProducts();
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  state.search = e.target.value;
  renderProducts();
});

document.getElementById("priceRange").addEventListener("input", (e) => {
  state.maxPrice = parseInt(e.target.value);
  document.getElementById("priceValue").textContent = "$" + state.maxPrice;
  renderProducts();
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});

document.getElementById("resetFilters").addEventListener("click", () => {
  state = { category: "all", search: "", maxPrice: 500, sort: "default" };
  document.getElementById("searchInput").value = "";
  document.getElementById("priceRange").value = 500;
  document.getElementById("priceValue").textContent = "$500";
  document.getElementById("sortSelect").value = "default";
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  document.querySelector('.chip[data-category="all"]').classList.add("active");
  renderProducts();
});

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart(){
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}
function closeCart(){
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.querySelector(".checkout-btn").addEventListener("click", () => {
  if(cart.length === 0){
    showToast("Your cart is empty");
    return;
  }
  showToast("Checkout is a UI demo — no payment is processed");
});

const contactForm = document.getElementById("contactForm");
if(contactForm){
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Message sent — we'll reply within 24 hours");
    contactForm.reset();
  });
}

const newsletterForm = document.getElementById("newsletterForm");
if(newsletterForm){
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Subscribed — welcome to the reading club");
    newsletterForm.reset();
  });
}

renderProducts();
renderCart();
