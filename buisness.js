/* ==========================================================================
   3B PRINTERS - Interactive Application Scripts
   Packaging Cost Estimator & Showcase
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroTilt();
  initQuoteCalculator();
  initPortfolioFilters();
  initSampleKitModal();
  initContactForms();
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   1. NAVIGATION & SCROLL EFFECTS
   -------------------------------------------------------------------------- */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

/* --------------------------------------------------------------------------
   2. HERO 3D TILT & MOUSE LIGHTING EFFECT
   -------------------------------------------------------------------------- */
function initHeroTilt() {
  const packCard = document.querySelector('.interactive-pack-card');
  if (!packCard) return;

  packCard.addEventListener('mousemove', (e) => {
    const rect = packCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Percentage for lighting
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    packCard.style.setProperty('--mouse-x', `${xPercent}%`);
    packCard.style.setProperty('--mouse-y', `${yPercent}%`);

    // Subtle 3D tilt
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -9;
    const rotateY = ((x - centerX) / centerX) * 9;
    packCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  packCard.addEventListener('mouseleave', () => {
    packCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

/* --------------------------------------------------------------------------
   3. INSTANT PACKAGING COST ESTIMATOR & QUOTE CALCULATOR
   -------------------------------------------------------------------------- */
const PRODUCT_BASE_RATES = {
  'pharma-mono': { name: 'Medicine Mono Carton', basePrice: 0.12, leadTime: '3-5 Business Days' },
  'syrup-bottle': { name: 'Syrup / Drop Outer Box', basePrice: 0.16, leadTime: '4-6 Business Days' },
  'blister-outer': { name: 'Tablet Blister Box', basePrice: 0.14, leadTime: '3-5 Business Days' },
  'cosmetic-box': { name: 'Cosmetic & Serum Box', basePrice: 0.22, leadTime: '4-6 Business Days' },
  'rigid-box': { name: 'Luxury Rigid Gift Box', basePrice: 0.75, leadTime: '6-8 Business Days' },
  'commercial-print': { name: 'Brochure / Catalog', basePrice: 0.28, leadTime: '2-4 Business Days' }
};

const BOARD_MULTIPLIERS = {
  'sbs-300': { name: 'SBS Virgin Board 300 GSM', mult: 1.0 },
  'fbb-350': { name: 'FBB Pharma Board 350 GSM', mult: 1.18 },
  'duplex-300': { name: 'Greyback Duplex 300 GSM', mult: 0.85 },
  'kraft-320': { name: 'Virgin Kraft Board 320 GSM', mult: 1.05 },
  'art-400': { name: 'Premium Art Card 400 GSM', mult: 1.30 }
};

const FINISH_RATES = {
  'finish-matte': { name: 'Thermal Matte Lamination', cost: 0.022 },
  'finish-gloss': { name: 'High-Gloss Lamination', cost: 0.020 },
  'finish-spot-uv': { name: 'High-Precision Spot UV', cost: 0.038 },
  'finish-3d-uv': { name: '3D Raised Embossed UV', cost: 0.055 },
  'finish-gold-foil': { name: 'Hot Gold Foil Stamping', cost: 0.045 },
  'finish-braille': { name: 'Pharma Braille Embossing', cost: 0.025 },
  'finish-tamper-seal': { name: 'Tamper-Evident Security Strip', cost: 0.030 }
};

function calculatePackagingQuote() {
  // 1. Get Selected Product
  const selectedProductInput = document.querySelector('input[name="quote-product"]:checked');
  const productKey = selectedProductInput ? selectedProductInput.value : 'pharma-mono';
  const productData = PRODUCT_BASE_RATES[productKey] || PRODUCT_BASE_RATES['pharma-mono'];

  // 2. Get Selected Stock / GSM
  const selectedStockInput = document.querySelector('input[name="quote-stock"]:checked');
  const stockKey = selectedStockInput ? selectedStockInput.value : 'sbs-300';
  const stockData = BOARD_MULTIPLIERS[stockKey] || BOARD_MULTIPLIERS['sbs-300'];

  // 3. Get Selected Finishes
  const selectedFinishes = [];
  let totalFinishCost = 0;
  const finishCheckboxes = document.querySelectorAll('input[name="quote-finishes"]:checked');
  finishCheckboxes.forEach(cb => {
    const fData = FINISH_RATES[cb.value];
    if (fData) {
      selectedFinishes.push(fData.name);
      totalFinishCost += fData.cost;
    }
  });

  // 4. Get Quantity
  const qtySlider = document.getElementById('calcQuantitySlider');
  const qtyValue = qtySlider ? parseInt(qtySlider.value, 10) : 5000;

  // Quantity Volume Discount Multiplier
  let volumeDiscount = 1.0;
  if (qtyValue >= 50000) volumeDiscount = 0.38;
  else if (qtyValue >= 25000) volumeDiscount = 0.46;
  else if (qtyValue >= 10000) volumeDiscount = 0.55;
  else if (qtyValue >= 5000) volumeDiscount = 0.68;
  else if (qtyValue >= 2500) volumeDiscount = 0.78;
  else if (qtyValue >= 1000) volumeDiscount = 0.88;

  // Final Calculations
  const rawUnitPrice = (productData.basePrice * stockData.mult) + totalFinishCost;
  const finalUnitPrice = Math.max(0.04, rawUnitPrice * volumeDiscount);
  const totalPrice = finalUnitPrice * qtyValue;

  // Update DOM Elements
  const displayQty = document.getElementById('calcQtyDisplay');
  const displayProduct = document.getElementById('summaryProduct');
  const displayStock = document.getElementById('summaryStock');
  const displayFinishes = document.getElementById('summaryFinishes');
  const displayLeadTime = document.getElementById('summaryLeadTime');
  const displayUnitPrice = document.getElementById('summaryUnitPrice');
  const displayTotalPrice = document.getElementById('summaryTotalPrice');

  if (displayQty) displayQty.textContent = qtyValue.toLocaleString() + ' pcs';
  if (displayProduct) displayProduct.textContent = productData.name;
  if (displayStock) displayStock.textContent = stockData.name;
  if (displayFinishes) {
    displayFinishes.textContent = selectedFinishes.length > 0 ? selectedFinishes.join(', ') : 'Standard Print Only';
  }
  if (displayLeadTime) displayLeadTime.textContent = productData.leadTime;
  if (displayUnitPrice) displayUnitPrice.textContent = `$${finalUnitPrice.toFixed(3)} / unit`;
  if (displayTotalPrice) displayTotalPrice.textContent = `$${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Update WhatsApp Quote Link
  updateWhatsAppQuoteLink({
    product: productData.name,
    stock: stockData.name,
    finishes: selectedFinishes.length > 0 ? selectedFinishes.join(', ') : 'None',
    quantity: qtyValue.toLocaleString(),
    unitPrice: `$${finalUnitPrice.toFixed(3)}`,
    totalEst: `$${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    leadTime: productData.leadTime
  });
}

function updateWhatsAppQuoteLink(spec) {
  const waBtn = document.getElementById('btnExportWhatsApp');
  if (!waBtn) return;

  const phone = '923001234567'; // 3B Printers official contact number
  const message = `*INQUIRY FROM 3B PRINTERS ESTIMATOR*
━━━━━━━━━━━━━━━━━━━━
📦 *Product:* ${spec.product}
📄 *Material Stock:* ${spec.stock}
✨ *Finishing:* ${spec.finishes}
📊 *Quantity:* ${spec.quantity} Units
💵 *Estimated Unit Price:* ${spec.unitPrice}
💰 *Total Estimate:* ${spec.totalEst}
⏱️ *Lead Time:* ${spec.leadTime}
━━━━━━━━━━━━━━━━━━━━
Please confirm formal quotation, sample availability, and die-line template.`;

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  waBtn.setAttribute('href', waUrl);
}

function initQuoteCalculator() {
  const inputs = document.querySelectorAll('input[name="quote-product"], input[name="quote-stock"], input[name="quote-finishes"]');
  const qtySlider = document.getElementById('calcQuantitySlider');

  inputs.forEach(input => {
    input.addEventListener('change', calculatePackagingQuote);
  });

  if (qtySlider) {
    qtySlider.addEventListener('input', calculatePackagingQuote);
  }

  // Initial Calculation
  calculatePackagingQuote();
}

/* --------------------------------------------------------------------------
   4. PORTFOLIO FILTERING & LIGHTBOX MODAL
   -------------------------------------------------------------------------- */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      portfolioCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter || category.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. SAMPLE KIT REQUEST MODAL
   -------------------------------------------------------------------------- */
function initSampleKitModal() {
  const modal = document.getElementById('sampleKitModal');
  const openButtons = document.querySelectorAll('.btn-open-sample-modal');
  const closeBtn = document.querySelector('.modal-close-btn');

  if (!modal) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Modal Form Submission
  const sampleForm = document.getElementById('sampleKitForm');
  if (sampleForm) {
    sampleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const company = document.getElementById('sampleCompany')?.value || 'Valued Client';
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
      sampleForm.reset();
      showToast(`🎉 Thank you, ${company}! Your Free 3B Printers Sample Packaging Kit is being processed.`);
    });
  }
}

/* --------------------------------------------------------------------------
   6. CONTACT & INQUIRY FORMS
   -------------------------------------------------------------------------- */
function initContactForms() {
  const mainContactForm = document.getElementById('mainContactForm');
  if (mainContactForm) {
    mainContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName')?.value || 'Client';
      mainContactForm.reset();
      showToast(`✅ Thank you, ${name}! Your packaging request has been received. Our press estimator will contact you within 2 hours.`);
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterForm.reset();
      showToast('📩 Subscribed! You will receive packaging print trends and seasonal discount bulletins.');
    });
  }
}

/* --------------------------------------------------------------------------
   7. TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10B981; font-size: 1.2rem;"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-100%)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

/* --------------------------------------------------------------------------
   8. SCROLL SPY NAVIGATION
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}