/**
 * Umiack Slider - Professional Edition (v2.0)
 * Optimized for performance, stability, and local responsive images.
 * Works with build-time generated manifests for instant loading.
 */
(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.UmiackSliderInitialized) return;

  const init = async () => {
    // --- 1. DOM Elements (Main Slider) ---
    const WID = document.getElementById('slider-main');
    const MID = document.getElementById('umiack-modal');
    if (!WID || !MID) return;

    // Check if we've already initialized these specific elements
    if (WID.classList.contains('umiack-initialized')) return;
    WID.classList.add('umiack-initialized');

    const track = WID.querySelector('.umiack-slides');
    const dotsWrap = WID.querySelector('.umiack-dots');
    const btnPrev = WID.querySelector('.umiack-btn-prev');
    const btnNext = WID.querySelector('.umiack-btn-next');
    const btnExp = WID.querySelector('.umiack-btn-expand');

    // --- 2. DOM Elements (Modal Window) ---
    const modalImg = MID.querySelector('.umiack-modal-img');
    const modalPrev = MID.querySelector('.umiack-modal-prev');
    const modalNext = MID.querySelector('.umiack-modal-next');
    const modalClose = MID.querySelector('.umiack-btn-close');
    const modalCount = MID.querySelector('.umiack-modal-counter');

    if (!track) return;

    // --- 3. State Management ---
    let total = 0;
    let current = 0;
    let modalCurrent = 0;
    const images = [];

    // --- 4. Dynamic Loading (Manifest Strategy) ---
    const slugify = (text) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    const rawTourId = WID.getAttribute('data-tour');
    const tourId = rawTourId ? slugify(rawTourId) : null;

    if (tourId) {
      try {
        const response = await fetch(`/common/umiack-site-assets/img/tours/${tourId}/images-manifest.json`);
        if (response.ok) {
          const manifest = await response.json();
          renderSlider(manifest);
        } else {
          console.warn('Umiack Slider: Local manifest not found, falling back to HTML scan.');
          scanHTML();
        }
      } catch (err) {
        console.error('Umiack Slider: Error loading manifest:', err);
        scanHTML();
      }
    } else {
      scanHTML();
    }

    function scanHTML() {
      const slideEls = WID.querySelectorAll('.umiack-slide');
      slideEls.forEach((el) => {
        const img = el.querySelector('img');
        const src = (img && (img.getAttribute('data-src') || img.src)) || '';
        const alt = (img && img.alt) || '';
        const srcset = img && img.getAttribute('srcset');
        images.push({ src, alt, srcset });
      });
      finalizeInit();
    }

    function renderSlider(manifest) {
      track.innerHTML = '';
      manifest.forEach((item) => {
        const figure = document.createElement('figure');
        figure.className = 'umiack-slide';
        
        const img = document.createElement('img');
        
        // Build srcset from variants
        const srcset = item.variants.map(v => `${v.webp} ${v.width}w`).join(', ');
        const fallbackSrc = item.variants.length > 0 ? item.variants[Math.min(1, item.variants.length - 1)].jpg : '';
        
        img.src = fallbackSrc;
        img.alt = item.alt;
        img.loading = 'lazy';
        img.setAttribute('srcset', srcset);
        img.setAttribute('sizes', '(min-width: 860px) 840px, 100vw');
        
        figure.appendChild(img);
        track.appendChild(figure);
        
        images.push({ src: fallbackSrc, alt: item.alt, srcset });
      });
      finalizeInit();
    }

    function finalizeInit() {
      total = images.length;
      if (total === 0) return;

      // Generate Dots
      dotsWrap.innerHTML = '';
      images.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `umiack-dot${idx === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => goTo(idx));
        dotsWrap.appendChild(dot);
      });

      // Navigation Setup
      btnPrev.addEventListener('click', () => goTo(current - 1));
      btnNext.addEventListener('click', () => goTo(current + 1));
      
      // Auto-refresh dots state
      goTo(0);
    }

    // --- 5. Navigation Control ---
    function adjustHeight() {
      const slides = track.querySelectorAll('.umiack-slide');
      const activeSlide = slides[current];
      if (!activeSlide) return;

      const img = activeSlide.querySelector('img');
      if (!img) return;

      const updateHeight = () => {
        const sliderContainer = WID.querySelector('.umiack-slider');
        if (sliderContainer) {
          sliderContainer.style.height = `${img.offsetHeight}px`;
        }
      };

      // if image is already loaded, update immediately
      if (img.complete) {
        updateHeight();
      } else {
        img.onload = updateHeight;
      }
    }

    function goTo(idx) {
      if (total === 0) return;
      current = (idx + total) % total;
      track.style.transition = '';
      track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;

      const dots = dotsWrap.querySelectorAll('.umiack-dot');
      dots.forEach((dot, j) => {
        dot.classList.toggle('active', j === current);
      });

      // Adjust height to match the current slide's image
      adjustHeight();
    }

    // --- 6. Touch Swiping (Main) ---
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let sliderWidth = 0;

    // Handle Resize
    window.addEventListener('resize', () => {
      adjustHeight();
    });

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = false;
      startWidth = WID.offsetWidth;
      track.style.transition = 'none';
    }, { passive: false });

    track.addEventListener('touchmove', (e) => {
      diffX = e.touches[0].clientX - startX;
      diffY = e.touches[0].clientY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (e.cancelable) e.preventDefault();
        isSwiping = true;
        const move = -(current * startWidth) + diffX;
        track.style.transform = `translate3d(${move}px, 0, 0)`;
      }
    }, { passive: false });

    track.addEventListener('touchend', () => {
      if (!isSwiping) return;
      track.style.transition = '';
      if (Math.abs(diffX) > 50) {
        diffX < 0 ? goTo(current + 1) : goTo(current - 1);
      } else {
        goTo(current);
      }
    });

    // --- 7. Modal Control ---
    function updateModalUI() {
      const data = images[modalCurrent];
      modalImg.src = data.src;
      modalImg.alt = data.alt;
      
      if (data.srcset) {
        modalImg.setAttribute('srcset', data.srcset);
        modalImg.setAttribute('sizes', '95vw');
      } else {
        modalImg.removeAttribute('srcset');
        modalImg.removeAttribute('sizes');
      }
      modalCount.textContent = `${modalCurrent + 1} / ${total}`;
    }

    function moveModal(idx) {
      modalCurrent = (idx + total) % total;
      modalImg.style.transition = '';
      modalImg.style.transform = '';
      updateModalUI();
    }

    btnExp.addEventListener('click', () => {
      modalCurrent = current;
      updateModalUI();
      if (MID.parentNode !== document.body) document.body.appendChild(MID);
      MID.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    modalClose.addEventListener('click', () => {
      MID.classList.remove('open');
      document.body.style.overflow = '';
    });

    modalPrev.addEventListener('click', () => moveModal(modalCurrent - 1));
    modalNext.addEventListener('click', () => moveModal(modalCurrent + 1));
    MID.addEventListener('click', (e) => {
      if (e.target === MID) {
        MID.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Modal Swiping
    let mStartX = 0, mStartY = 0, mDiffX = 0, mDiffY = 0, mIsSwiping = false;

    MID.addEventListener('touchstart', (e) => {
      mStartX = e.touches[0].clientX;
      mStartY = e.touches[0].clientY;
      mIsSwiping = false;
      modalImg.style.transition = 'none';
    }, { passive: false });

    MID.addEventListener('touchmove', (e) => {
      mDiffX = e.touches[0].clientX - mStartX;
      mDiffY = e.touches[0].clientY - mStartY;
      if (Math.abs(mDiffX) > Math.abs(mDiffY)) {
        if (e.cancelable) e.preventDefault();
        mIsSwiping = true;
        modalImg.style.transform = `translate3d(${mDiffX}px, 0, 0)`;
      }
    }, { passive: false });

    MID.addEventListener('touchend', () => {
      if (!mIsSwiping) return;
      modalImg.style.transition = '';
      if (Math.abs(mDiffX) > 60) {
        mDiffX < 0 ? moveModal(modalCurrent + 1) : moveModal(modalCurrent - 1);
      } else {
        modalImg.style.transform = 'translate3d(0, 0, 0)';
      }
    });

    // Keyboard Support
    document.addEventListener('keydown', (e) => {
      const isModalOpen = MID.classList.contains('open');
      if (isModalOpen) {
        if (e.key === 'ArrowLeft') moveModal(modalCurrent - 1);
        if (e.key === 'ArrowRight') moveModal(modalCurrent + 1);
        if (e.key === 'Escape') {
          MID.classList.remove('open');
          document.body.style.overflow = '';
        }
      } else {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
      }
    });

    window.UmiackSliderInitialized = true;
  };

  // Immediate or deferred execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();