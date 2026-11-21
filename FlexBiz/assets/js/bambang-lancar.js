/**
 * Bengkel Bambang Lancar Interactive Script
 * - Real-time Cost Calculator & Booking
 * - Sparepart Filter & Search
 * - WhatsApp Automated Direct Integration
 */

document.addEventListener('DOMContentLoaded', function () {
  // ==========================================
  // 1. REAL-TIME SERVICE COST CALCULATOR
  // ==========================================
  const brandSelect = document.getElementById('calc-brand');
  const serviceButtons = document.querySelectorAll('.calc-service-btn');
  const partCheckboxes = document.querySelectorAll('.calc-part-cb');
  const calcSubtotalEl = document.getElementById('calc-subtotal');
  const calcDiscountEl = document.getElementById('calc-discount');
  const calcTotalEl = document.getElementById('calc-total');
  const calcWaBookingBtn = document.getElementById('calc-wa-booking-btn');

  let selectedBrand = 'Toyota';
  let selectedService = { name: 'Tune Up Jet Clean & Carbon Clean', price: 450000 };
  let selectedParts = [];

  function formatRupiah(number) {
    return 'Rp ' + number.toLocaleString('id-ID');
  }

  function updateCalculator() {
    if (!calcSubtotalEl) return;

    if (brandSelect) {
      selectedBrand = brandSelect.value;
    }

    let subtotal = selectedService.price;
    selectedParts = [];

    partCheckboxes.forEach(cb => {
      if (cb.checked) {
        const price = parseInt(cb.dataset.price, 10);
        const name = cb.dataset.name;
        subtotal += price;
        selectedParts.push({ name, price });
      }
    });

    // 10% promo discount for online booking
    const discount = Math.round(subtotal * 0.1);
    const grandTotal = subtotal - discount;

    calcSubtotalEl.textContent = formatRupiah(subtotal);
    calcDiscountEl.textContent = '- ' + formatRupiah(discount);
    calcTotalEl.textContent = formatRupiah(grandTotal);

    // Update WhatsApp link
    if (calcWaBookingBtn) {
      let partsListText = selectedParts.length > 0
        ? selectedParts.map(p => `• ${p.name} (${formatRupiah(p.price)})`).join('%0A')
        : '• Tidak ada sparepart tambahan';

      let msg = `Halo Bengkel Bambang Lancar! Saya ingin booking servis dengan estimasi online:%0A%0A` +
        `🚗 *Merk Mobil:* ${selectedBrand}%0A` +
        `🔧 *Layanan Utama:* ${selectedService.name} (${formatRupiah(selectedService.price)})%0A` +
        `🔩 *Sparepart Dipilih:*%0A${partsListText}%0A` +
        `💰 *Diskon Promo (10%):* -${formatRupiah(discount)}%0A` +
        `🏷️ *Total Estimasi:* *${formatRupiah(grandTotal)}*%0A%0A` +
        `Mohon info ketersediaan jadwal slot servis. Terima kasih!`;

      calcWaBookingBtn.href = `https://wa.me/6283854463246?text=${msg}`;
    }
  }

  if (brandSelect) {
    brandSelect.addEventListener('change', updateCalculator);
  }

  serviceButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      serviceButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedService = {
        name: this.dataset.name,
        price: parseInt(this.dataset.price, 10)
      };
      updateCalculator();
    });
  });

  partCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCalculator);
  });

  updateCalculator();

  // ==========================================
  // 2. SPAREPART FILTER & LIVE SEARCH
  // ==========================================
  const partSearchInput = document.getElementById('part-search-input');
  const partFilterBtns = document.querySelectorAll('.part-filter-btn');
  const partItems = document.querySelectorAll('.part-item');

  let currentCategory = 'all';
  let currentKeyword = '';

  function filterParts() {
    partItems.forEach(item => {
      const category = item.dataset.category;
      const title = item.querySelector('.part-title')?.textContent.toLowerCase() || '';
      const compat = item.querySelector('.part-compat')?.textContent.toLowerCase() || '';
      const brand = item.querySelector('.part-brand-logo')?.textContent.toLowerCase() || '';

      const matchCategory = currentCategory === 'all' || category === currentCategory;
      const matchKeyword = currentKeyword === '' || 
        title.includes(currentKeyword) || 
        compat.includes(currentKeyword) || 
        brand.includes(currentKeyword);

      if (matchCategory && matchKeyword) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  partFilterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      partFilterBtns.forEach(b => b.classList.remove('active', 'btn-danger'));
      partFilterBtns.forEach(b => b.classList.add('btn-outline-secondary'));
      this.classList.remove('btn-outline-secondary');
      this.classList.add('active', 'btn-danger');

      currentCategory = this.dataset.filter;
      filterParts();
    });
  });

  if (partSearchInput) {
    partSearchInput.addEventListener('input', function () {
      currentKeyword = this.value.trim().toLowerCase();
      filterParts();
    });
  }

  // ==========================================
  // 3. BOOKING FORM EMAIL & WHATSAPP INTEGRATION
  // ==========================================
  const bookingForm = document.getElementById('main-booking-form');
  const bookingAlertBox = document.getElementById('booking-alert-box');
  const submitBtn = document.getElementById('bk-submit-btn');

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('bk-name')?.value.trim() || '';
      const phone = document.getElementById('bk-phone')?.value.trim() || '';
      const plate = document.getElementById('bk-plate')?.value.trim() || '';
      const car = document.getElementById('bk-car')?.value.trim() || '';
      const service = document.getElementById('bk-service')?.value || '';
      const date = document.getElementById('bk-date')?.value || '';
      const note = document.getElementById('bk-notes')?.value.trim() || '-';

      // Button loading state
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Mengirim Formulir ke Email...';
      }

      // Prepare payload for Formsubmit API
      const payload = {
        _subject: `[Reservasi Servis] ${name} - ${car} (${plate})`,
        _template: 'table',
        _captcha: 'false',
        'Nama Lengkap Pemilik': name,
        'Nomor WhatsApp': phone,
        'Plat Nomor Kendaraan': plate,
        'Merk & Model Mobil': car,
        'Paket / Layanan Servis': service,
        'Rencana Tanggal & Jam': date,
        'Keluhan & Catatan': note
      };

      fetch('https://formsubmit.co/ajax/azrielwa83@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }

        const waMsg = `Halo Admin Bengkel Bambang Lancar!%0A` +
          `Saya telah mengirimkan formulir reservasi servis mobil via email:%0A%0A` +
          `👤 *Nama:* ${encodeURIComponent(name)}%0A` +
          `📱 *No. WhatsApp:* ${encodeURIComponent(phone)}%0A` +
          `🚘 *Plat Nomor:* ${encodeURIComponent(plate)}%0A` +
          `🚙 *Kendaraan:* ${encodeURIComponent(car)}%0A` +
          `🛠️ *Paket:* ${encodeURIComponent(service)}%0A` +
          `📅 *Tanggal:* ${encodeURIComponent(date)}%0A` +
          `📝 *Catatan:* ${encodeURIComponent(note)}%0A%0A` +
          `Mohon dicek di email dan dikonfirmasi ketersediaan jadwal slot antriannya. Terima kasih!`;

        if (bookingAlertBox) {
          bookingAlertBox.style.display = 'block';
          bookingAlertBox.innerHTML = `
            <div class="alert alert-success border-0 shadow-sm p-4 rounded-3 text-start mb-0">
              <div class="d-flex align-items-center mb-2">
                <i class="bi bi-check-circle-fill fs-3 text-success me-3"></i>
                <div>
                  <h5 class="fw-bold text-dark mb-0">Formulir Berhasil Terkirim ke Email!</h5>
                  <small class="text-muted">Data reservasi Anda telah diteruskan ke <strong>azrielwa83@gmail.com</strong>.</small>
                </div>
              </div>
              <p class="small text-secondary mb-3">
                Terima kasih, <strong>${name}</strong>. Tim Service Advisor kami akan segera meninjau jadwal Anda dan menghubungi melalui WhatsApp di <strong>${phone}</strong>.
              </p>
              <div class="d-flex flex-wrap gap-2">
                <a href="https://wa.me/6283854463246?text=${waMsg}" target="_blank" class="btn btn-success btn-sm rounded-pill px-3 py-2 fw-semibold">
                  <i class="bi bi-whatsapp me-1"></i> Konfirmasi Cepat ke WhatsApp 0838-5446-3246
                </a>
              </div>
            </div>
          `;
          bookingAlertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          alert(`Terima kasih Bapak/Ibu ${name}!\nFormulir reservasi servis Anda berhasil dikirim ke email azrielwa83@gmail.com.`);
        }

        bookingForm.reset();
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }

        // Fallback: Submit standard form or open WhatsApp
        if (bookingAlertBox) {
          bookingAlertBox.style.display = 'block';
          bookingAlertBox.innerHTML = `
            <div class="alert alert-warning border-0 shadow-sm p-3 rounded-3 text-start mb-0">
              <h6 class="fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>Pengiriman Otomatis Terkendala Koneksi</h6>
              <p class="small mb-2">Silakan klik tombol di bawah untuk langsung mengirimkan data reservasi ini ke WhatsApp bengkel:</p>
              <a href="https://wa.me/6283854463246?text=Halo%20Admin%20Bambang%20Lancar,%20saya%20ingin%20reservasi%20servis%20untuk%20${encodeURIComponent(name)}%20(${encodeURIComponent(car)}%20-%20${encodeURIComponent(plate)})" target="_blank" class="btn btn-success btn-sm rounded-pill px-3">
                <i class="bi bi-whatsapp me-1"></i> Kirim Langsung ke WhatsApp 0838-5446-3246
              </a>
            </div>
          `;
        }
      });
    });
  }
});
