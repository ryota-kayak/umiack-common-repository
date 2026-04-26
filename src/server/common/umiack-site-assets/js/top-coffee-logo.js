// UMIACK Coffee top page logo module
// Bean bounce + roll animation

(function () {
  'use strict';

  const shared = window.UMIACKTopShared;
  if (!shared) {
    console.error('UMIACKTopShared is required before top-coffee-logo.js');
    return;
  }

  const { CONFIG, AnimationHelpers } = shared;

  // --- Coffee logo specific constants ---
  const COFFEE_CONFIG = {
    BEAN_INITIAL_X: -97,
    BEAN_INITIAL_Y: 339,
    BOUNCE_FACTOR: 50,
    HORIZONTAL_FADE_RANGE: 200,
    OFFSET_VALUE: 100,
    SMALL_SCREEN_SCALE: 0.625,
    SMALL_SCREEN_WIDTH: 479,
    ROTATION_DIVISOR: 20,
    HORIZONTAL_POWER: 0.95,
    ENERGY_LOSS_BASE: 1.5,
    BOUNCE_HEIGHT: 100,
  };

  let imageBean;
  let logoImage;
  let logo_container;
  let delay = 0;
  let widthRatio = 1;
  let cachedMaxAllowedX = 0;

  function init() {
    imageBean = document.getElementById('img_2');
    logoImage = document.getElementById('img_1');
    logo_container = document.getElementById('logo_container');

    if (!imageBean || !logo_container) {
      if (window.DEBUG) console.error('Coffee logo elements are missing in the DOM.');
      return;
    }

    // Determine scale factor for small screens
    widthRatio = window.innerWidth < COFFEE_CONFIG.SMALL_SCREEN_WIDTH
      ? COFFEE_CONFIG.SMALL_SCREEN_SCALE
      : 1;

    // Set initial bean position
    imageBean.style.top = COFFEE_CONFIG.BEAN_INITIAL_Y * widthRatio + 'px';
    imageBean.style.left = COFFEE_CONFIG.BEAN_INITIAL_X * widthRatio + 'px';

    // Reveal logo container
    logo_container.style.opacity = 1;

    updateCachedLayout();
  }

  function updateCachedLayout() {
    if (!imageBean) return;
    const w = window.innerWidth;
    const beanWidth = imageBean.getBoundingClientRect().width;
    cachedMaxAllowedX = w - beanWidth - (COFFEE_CONFIG.OFFSET_VALUE * widthRatio);

    if (logo_container) {
      delay = logo_container.getBoundingClientRect().top + window.scrollY;
    }
  }

  function onLayoutChange() {
    updateCachedLayout();
  }

  function update(scrollPosition) {
    if (!imageBean || scrollPosition <= delay) return;

    const adjustedScroll = scrollPosition - delay;

    // --- Horizontal movement (power curve deceleration) ---
    let horizontalMovement = COFFEE_CONFIG.BEAN_INITIAL_X + adjustedScroll ** COFFEE_CONFIG.HORIZONTAL_POWER;
    let displayedX = horizontalMovement * widthRatio;
    let effectiveX = Math.min(displayedX, cachedMaxAllowedX);
    imageBean.style.left = effectiveX + 'px';

    // --- Horizontal fade-out near right edge ---
    AnimationHelpers.applyLinearFade(
      imageBean,
      effectiveX,
      cachedMaxAllowedX - COFFEE_CONFIG.HORIZONTAL_FADE_RANGE,
      cachedMaxAllowedX
    );

    // --- Vertical bounce (gravity + energy loss) ---
    const quadrant = (adjustedScroll / COFFEE_CONFIG.BOUNCE_FACTOR) / (Math.PI / 2);
    const energyLoss = Math.floor((quadrant + 1) / 2);
    const cosWave = Math.cos(adjustedScroll / COFFEE_CONFIG.BOUNCE_FACTOR);
    const reboundWithLoss = Math.abs(cosWave) * (1 / (COFFEE_CONFIG.ENERGY_LOSS_BASE ** energyLoss));
    let verticalMovement = COFFEE_CONFIG.BEAN_INITIAL_Y + ((1 - reboundWithLoss) * COFFEE_CONFIG.BOUNCE_HEIGHT);
    imageBean.style.top = verticalMovement * widthRatio + 'px';

    // --- Rotation ---
    imageBean.style.transform = 'rotate(' + adjustedScroll / COFFEE_CONFIG.ROTATION_DIVISOR + 'rad)';
  }

  function getMetrics() {
    // top-backgrounds.js uses these for scrolling waterdrop size calculation.
    // Coffee logo has no equivalent concept, so return defaults.
    return { initialDropWidth: CONFIG.DROPS_WIDTH, logoRatio: 1 };
  }

  function getObservedElement() {
    return logoImage || document.getElementById('img_1');
  }

  // --- Hijack animateWaterDrop for Coffee site ---
  // top-backgrounds.js calls this for the scrolling animation.
  // We override it here to keep the spinner in place and rotate without distortion.
  const originalAnimate = shared.animateWaterDrop;
  shared.animateWaterDrop = function (params) {
    if (params.dropElement && params.dropElement.id === 'scrolling_animation') {
      const { dropElement, t } = params;
      // Position: fixed at 10vw, 10vh (as per original coffee site design)
      // Rotation: scrollPosition / 100 rad (original logic). t = scrollPosition / 300.
      const rotationRad = (t * 300) / 100;
      dropElement.style.transform = `translate3d(10vw, 10vh, 0) rotate(${rotationRad}rad)`;
      // Neutralize filters/distortion applied by resizeWaterdrop/animateWaterDrop
      dropElement.style.filter = 'none';
      return;
    }
    if (originalAnimate) originalAnimate(params);
  };

  shared.runtime.registerLogoModule({
    init,
    onLayoutChange,
    update,
    getMetrics,
    getObservedElement,
  });
})();
