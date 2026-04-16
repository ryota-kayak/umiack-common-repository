/**
 * Umiack Slider - Professional Edition
 * Optimized for performance, stability, and responsive images.
 * Works seamlessly with WordPress REST API to fetch best-fit image sizes.
 */
(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.UmiackSliderInitialized) return;

  const init = () => {
    // --- 1. DOM Elements (Main Slider) ---
    const WID = document.getElementById('slider-main');
    const MID = document.getElementById('umiack-modal');
    if (!WID || !MID) return;

    // Check if we've already initialized these specific elements
    if (WID.classList.contains('umiack-initialized')) return;
    WID.classList.add('umiack-initialized');

    const track = WID.querySelector('.umiack-slides');
    const slideEls = WID.querySelectorAll('.umiack-slide');
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

    if (!track || slideEls.length === 0) return;

    // --- 3. State Management ---
    const total = slideEls.length;
    let current = 0;
    let modalCurrent = 0;
    const images = [];

    // --- 4. Initialize Image Data ---
    slideEls.forEach((el) => {
      const img = el.querySelector('img');
      let src = (img && (img.getAttribute('data-src') || img.src)) || '';
      const alt = (img && img.alt) || '';

      // Extracting URL from noscript if image is lazy-loaded by theme
      if (!src) {
        const noscript = el.querySelector('noscript');
        if (noscript) {
          const html = noscript.textContent || noscript.innerHTML;
          const start = html.indexOf('src="');
          if (start > -1) {
            const sub = html.substring(start + 5);
            const end = sub.indexOf('"');
            if (end > -1) src = sub.substring(0, end);
          }
        }
      }
      images.push({ src, alt, srcset: null });
    });

    // --- 5. Navigation Control (Main) ---
    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transition = '';
      track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;

      const dots = dotsWrap.querySelectorAll('.umiack-dot');
      dots.forEach((dot, j) => {
        dot.classList.toggle('active', j === current);
      });
    }

    // Generate Dots
    images.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `umiack-dot${idx === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', () => goTo(idx));
      dotsWrap.appendChild(dot);
    });

    btnPrev.addEventListener('click', () => goTo(current - 1));
    btnNext.addEventListener('click', () => goTo(current + 1));

    // --- 6. Touch Swiping (Main) ---
    let startX = 0, startY = 0, diffX = 0, diffY = 0, isSwiping = false, startWidth = 0;

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

    // --- 8. Responsive Strategy (WordPress API) ---
    const fetchResponsiveImages = async () => {
      const sizesHint = '(min-width: 860px) 840px, 100vw';
      
      images.forEach(async (data, idx) => {
        if (!data.src) return;

        // Extract original filename to search in Media Library
        const pathParts = data.src.split('/');
        let filename = pathParts[pathParts.length - 1].split('.')[0];
        const lastDash = filename.lastIndexOf('-');
        if (lastDash > -1) {
          const suffix = filename.substring(lastDash + 1);
          // Remove WP auto-generated resolution suffix like -1024x768 or -scaled
          if (suffix.indexOf('x') > 0 || suffix === 'scaled') {
            filename = filename.substring(0, lastDash);
          }
        }

        try {
          const response = await fetch(`/wp-json/wp/v2/media?search=${encodeURIComponent(filename)}&per_page=5&_fields=source_url,media_details`);
          const items = await response.json();

          if (items && items.length > 0) {
            const media = items[0];
            const availableSizes = media.media_details.sizes || {};
            const srcsetParts = [];
            const usedWidths = new Set();

            // Build srcset from all available versions
            Object.keys(availableSizes).forEach(sizeKey => {
              const sizeData = availableSizes[sizeKey];
              if (sizeData && sizeData.source_url && !usedWidths.has(sizeData.width)) {
                srcsetParts.push(`${sizeData.source_url} ${sizeData.width}w`);
                usedWidths.add(sizeData.width);
              }
            });

            // Fallback to original full size
            if (media.source_url && !usedWidths.has(media.media_details.width)) {
              srcsetParts.push(`${media.source_url} ${media.media_details.width}w`);
            }

            if (srcsetParts.length > 0) {
              const srcsetStr = srcsetParts.join(', ');
              data.srcset = srcsetStr;

              // Apply to main slider img
              const targetImg = slideEls[idx].querySelector('img');
              if (targetImg) {
                targetImg.setAttribute('data-srcset', srcsetStr);
                targetImg.setAttribute('data-sizes', sizesHint);
                // If already loaded, upgrade immediately
                if (targetImg.src) {
                  targetImg.setAttribute('srcset', srcsetStr);
                  targetImg.setAttribute('sizes', sizesHint);
                }
              }
            }
          }
        } catch (err) {
          console.warn('Umiack Slider: Failed to fetch responsive manifest for:', filename, err);
        }
      });
    };

    // Initial render
    goTo(0);
    fetchResponsiveImages();
    window.UmiackSliderInitialized = true;
  };

  // Immediate or deferred execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();