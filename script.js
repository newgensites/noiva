/* Noiva (Basic) — Modern Luxury JS
   - smooth scroll
   - mobile nav
   - reveal on scroll
   - product filter + search
   - quick view modal
   - cart drawer (simple)
   - contact/newsletter forms (mailto + demo toast)
*/

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // dynamic layout offsets
  const root = document.documentElement;
  const topbar = $(".topbar");

  function updateOffsets() {
    if (!topbar) return;
    const h = topbar.getBoundingClientRect().height;
    root.style.setProperty("--topbar-height", `${h}px`);
  }

  updateOffsets();
  window.addEventListener("resize", updateOffsets);
  window.addEventListener("load", updateOffsets);

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll
  function scrollToTarget(target) {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $$("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-scroll");
      if (target) scrollToTarget(target);
      closeMobileNav();
      closeCart();
      closeModal();
      closeSearch();
    });
  });

  // Reveal on scroll
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  // Mobile nav
  const navToggle = $("#navToggle");
  const navClose = $("#navClose");
  const navBackdrop = $("#navBackdrop");
  const mobileNav = $("#mobileNav");

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    navToggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  navToggle?.addEventListener("click", openMobileNav);
  navClose?.addEventListener("click", closeMobileNav);
  navBackdrop?.addEventListener("click", closeMobileNav);

  // Filter chips
  const chips = $$(".chip");
  const productGrid = $("#productGrid");
  const products = $$(".product");

  function setActiveChip(chip) {
    chips.forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-selected", c === chip ? "true" : "false");
    });
  }

  function applyFilter(category) {
    products.forEach((p) => {
      const c = p.getAttribute("data-category");
      const show = category === "all" || c === category;
      p.style.display = show ? "" : "none";
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const cat = chip.getAttribute("data-filter") || "all";
      setActiveChip(chip);
      applyFilter(cat);
      // Clear search if active
      if ($("#searchInput")) $("#searchInput").value = "";
    });
  });

  // Quick view modal data (basic demo)
  const productData = {
    1: {
      title: "Signature Jacket",
      price: 160,
      desc: "Structured fit with a clean silhouette. Luxury black finish designed for premium layering.",
      img: "https://images.unsplash.com/photo-1520975680112-9a02e7435e44?auto=format&fit=crop&w=1600&q=80",
    },
    2: {
      title: "Baby Blue Tee",
      price: 68,
      desc: "Soft hand-feel with minimal branding. Premium baby blue tone built for everyday wear.",
      img: "https://images.unsplash.com/photo-1520975958225-2a29f9c36f42?auto=format&fit=crop&w=1600&q=80",
    },
    3: {
      title: "Essential Set",
      price: 140,
      desc: "Matching set with elevated comfort. Clean lines and premium texture for a luxury look.",
      img: "https://images.unsplash.com/photo-1520975685579-3f3fe8b0e0d0?auto=format&fit=crop&w=1600&q=80",
    },
    4: {
      title: "Oversized Coat",
      price: 220,
      desc: "Statement outerwear with premium structure. Designed to elevate the full outfit instantly.",
      img: "https://images.unsplash.com/photo-1520975732131-0f5f0a6cc211?auto=format&fit=crop&w=1600&q=80",
    },
  };

  // Modal
  const quickModal = $("#quickModal");
  const modalClose = $("#modalClose");
  const modalBackdrop = $("#modalBackdrop");

  const modalImg = $("#modalImg");
  const modalTitle = $("#modalTitle");
  const modalPrice = $("#modalPrice");
  const modalDesc = $("#modalDesc");
  const modalAdd = $("#modalAdd");
  const qtySelect = $("#qtySelect");

  let modalActiveId = null;

  function openModal(id) {
    const data = productData[id];
    if (!data || !quickModal) return;

    modalActiveId = id;
    modalImg.src = data.img;
    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalPrice.textContent = `$${data.price}`;
    modalDesc.textContent = data.desc;

    quickModal.classList.add("is-open");
    quickModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!quickModal) return;
    quickModal.classList.remove("is-open");
    quickModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalActiveId = null;
  }

  modalClose?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", closeModal);

  // Open quick view (buttons + media)
  $$("[data-quickview]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-quickview");
      if (id) openModal(id);
    });
  });

  // Cart
  const cartDrawer = $("#cartDrawer");
  const cartBtn = $("#cartBtn");
  const cartClose = $("#cartClose");
  const cartBackdrop = $("#cartBackdrop");
  const cartCount = $("#cartCount");
  const cartList = $("#cartList");
  const cartEmpty = $("#cartEmpty");
  const cartSubtotal = $("#cartSubtotal");
  const checkoutBtn = $("#checkoutBtn");
  const shopFromCart = $("#shopFromCart");

  const cart = new Map(); // name -> {price, qty}

  function formatMoney(n) {
    return `$${Number(n).toFixed(0)}`;
  }

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  cartBtn?.addEventListener("click", () => {
    closeMobileNav();
    closeModal();
    closeSearch();
    openCart();
  });
  cartClose?.addEventListener("click", closeCart);
  cartBackdrop?.addEventListener("click", closeCart);
  shopFromCart?.addEventListener("click", () => {
    closeCart();
    scrollToTarget("#new");
  });

  function renderCart() {
    const items = Array.from(cart.entries());
    const count = items.reduce((acc, [, v]) => acc + v.qty, 0);
    const subtotal = items.reduce((acc, [, v]) => acc + v.qty * v.price, 0);

    if (cartCount) cartCount.textContent = String(count);

    if (!cartList || !cartEmpty || !cartSubtotal) return;

    cartSubtotal.textContent = formatMoney(subtotal);

    if (count === 0) {
      cartEmpty.hidden = false;
      cartList.hidden = true;
      cartList.innerHTML = "";
      return;
    }

    cartEmpty.hidden = true;
    cartList.hidden = false;
    cartList.innerHTML = "";

    for (const [name, v] of items) {
      const row = document.createElement("div");
      row.className = "cartItem";

      const left = document.createElement("div");
      left.innerHTML = `
        <div class="cartItem__name">${escapeHtml(name)}</div>
        <div class="cartItem__meta">${formatMoney(v.price)} each</div>
      `;

      const right = document.createElement("div");
      right.className = "cartItem__right";

      const qty = document.createElement("div");
      qty.className = "qty";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.addEventListener("click", () => {
        updateQty(name, v.qty - 1);
      });

      const num = document.createElement("span");
      num.textContent = String(v.qty);

      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.addEventListener("click", () => {
        updateQty(name, v.qty + 1);
      });

      qty.append(minus, num, plus);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        cart.delete(name);
        renderCart();
      });

      right.append(qty, remove);

      row.append(left, right);
      cartList.appendChild(row);
    }
  }

  function updateQty(name, newQty) {
    if (!cart.has(name)) return;
    if (newQty <= 0) cart.delete(name);
    else cart.set(name, { ...cart.get(name), qty: newQty });
    renderCart();
  }

  function addToCart(name, price, qty = 1) {
    const curr = cart.get(name);
    if (curr) cart.set(name, { price, qty: curr.qty + qty });
    else cart.set(name, { price, qty });
    renderCart();
  }

  // Add buttons on cards
  $$("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-add") || "";
      const [name, priceStr] = raw.split("|");
      const price = Number(priceStr || 0);
      if (!name || !price) return;
      addToCart(name, price, 1);
      openCart();
    });
  });

  // Add from modal
  modalAdd?.addEventListener("click", () => {
    if (!modalActiveId) return;
    const data = productData[modalActiveId];
    if (!data) return;
    const qty = Number(qtySelect?.value || "1");
    addToCart(data.title, data.price, qty);
    closeModal();
    openCart();
  });

  checkoutBtn?.addEventListener("click", () => {
    toast("Checkout is a demo in the Basic version. Upgrade later to Shopify/Stripe.");
  });

  renderCart();

  // Search modal
  const searchBtn = $("#searchBtn");
  const searchModal = $("#searchModal");
  const searchClose = $("#searchClose");
  const searchBackdrop = $("#searchBackdrop");
  const searchInput = $("#searchInput");

  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add("is-open");
    searchModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => searchInput?.focus(), 50);
  }
  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove("is-open");
    searchModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  searchBtn?.addEventListener("click", () => {
    closeMobileNav();
    closeCart();
    closeModal();
    openSearch();
  });
  searchClose?.addEventListener("click", closeSearch);
  searchBackdrop?.addEventListener("click", closeSearch);

  // Search filtering in grid
  function applySearch(q) {
    const query = (q || "").trim().toLowerCase();
    if (!query) {
      // restore chip filter selection
      const active = $(".chip.is-active");
      applyFilter(active?.getAttribute("data-filter") || "all");
      return;
    }

    // Set chips to All (visually)
    const allChip = chips.find((c) => (c.getAttribute("data-filter") || "") === "all");
    if (allChip) setActiveChip(allChip);

    products.forEach((p) => {
      const name = $(".product__name", p)?.textContent?.toLowerCase() || "";
      const desc = $(".product__desc", p)?.textContent?.toLowerCase() || "";
      const show = name.includes(query) || desc.includes(query);
      p.style.display = show ? "" : "none";
    });
  }

  searchInput?.addEventListener("input", () => {
    applySearch(searchInput.value);
  });

  // Contact form: mailto fallback
  const contactForm = $("#contactForm");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = $("#name")?.value?.trim() || "";
    const phone = $("#phone")?.value?.trim() || "";
    const email = $("#email")?.value?.trim() || "";
    const message = $("#message")?.value?.trim() || "";

    const subject = encodeURIComponent(`Noiva Website Message — ${name || "Customer"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}\n\n— Sent from Noiva (Basic) website`
    );

    // Change this later to your real business inbox
    const to = "noiva@example.com";

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    toast("Opening your email app to send this message.");
    contactForm.reset();
  });

  // Newsletter form demo
  const newsletterForm = $("#newsletterForm");
  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    toast("You’re on the list (demo). Upgrade later to store emails in a real system.");
    newsletterForm.reset();
  });

  // ESC closes overlays
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileNav();
      closeCart();
      closeModal();
      closeSearch();
    }
  });

  // Helpers
  function toast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.position = "fixed";
    t.style.left = "50%";
    t.style.bottom = "18px";
    t.style.transform = "translateX(-50%)";
    t.style.background = "rgba(11,11,11,.90)";
    t.style.color = "rgba(249,250,251,.95)";
    t.style.border = "1px solid rgba(255,255,255,.12)";
    t.style.borderRadius = "16px";
    t.style.padding = "12px 14px";
    t.style.boxShadow = "0 18px 40px rgba(0,0,0,.25)";
    t.style.zIndex = "999";
    t.style.maxWidth = "min(720px, calc(100% - 24px))";
    t.style.textAlign = "center";
    t.style.fontWeight = "800";
    t.style.fontSize = "13px";
    t.style.opacity = "0";
    t.style.transition = "opacity .2s ease, transform .2s ease";
    document.body.appendChild(t);

    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateX(-50%) translateY(-2px)";
    });

    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(-50%) translateY(2px)";
      setTimeout(() => t.remove(), 250);
    }, 2400);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
