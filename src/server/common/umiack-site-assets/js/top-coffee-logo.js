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
    BEAN_INITIAL_X: -48,
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
  let parallax_container;
  let scrolling_animation;
  let delay = 0;
  let widthRatio = 1;
  let cachedMaxAllowedX = 0;
  let beanPosition = { x: 0, y: 0 };

  function init() {
    imageBean = document.getElementById('img_2');
    logoImage = document.getElementById('img_1');
    logo_container = document.getElementById('logo_container');
    parallax_container = document.getElementById('parallax_container');
    scrolling_animation = document.getElementById('scrolling_animation');

    if (!imageBean || !logo_container || !parallax_container) {
      if (window.DEBUG) console.error('Coffee logo elements are missing in the DOM.');
      return;
    }

    // Reveal logo container
    logo_container.style.opacity = 1;

    updateCachedLayout();
  }

  function updateCachedLayout() {
    if (!imageBean || !parallax_container) return;

    // Determine scale factor for small screens
    widthRatio = window.innerWidth < COFFEE_CONFIG.SMALL_SCREEN_WIDTH
      ? COFFEE_CONFIG.SMALL_SCREEN_SCALE
      : 1;

    const w = window.innerWidth;
    const beanWidth = imageBean.getBoundingClientRect().width;
    cachedMaxAllowedX = w - beanWidth - (COFFEE_CONFIG.OFFSET_VALUE * widthRatio);

    // Using parallax_container (parent of sticky logo_container) for stable delay calculation.
    delay = parallax_container.getBoundingClientRect().top + window.scrollY;

    // Apply initial position if not scrolling yet
    if (window.scrollY <= delay) {
      // imageBean.style.top = COFFEE_CONFIG.BEAN_INITIAL_Y * widthRatio + 'px';
      // imageBean.style.left = COFFEE_CONFIG.BEAN_INITIAL_X * widthRatio + 'px';
      beanPosition = { x: COFFEE_CONFIG.BEAN_INITIAL_X * widthRatio, y: COFFEE_CONFIG.BEAN_INITIAL_Y * widthRatio };
      imageBean.style.transform = `translate(${beanPosition.x}px, ${beanPosition.y}px) rotate(0rad)`;
      imageBean.style.opacity = 1;
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
    // imageBean.style.left = effectiveX + 'px';
    beanPosition.x = effectiveX;

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
    beanPosition.y = verticalMovement * widthRatio;
    // imageBean.style.top = verticalMovement * widthRatio + 'px';

    // --- Rotation ---
    imageBean.style.transform = 'translate(' + beanPosition.x + 'px, ' + beanPosition.y + 'px) rotate(' + adjustedScroll / COFFEE_CONFIG.ROTATION_DIVISOR + 'rad)';

    // --- Scrolling Spinner Rotation ---
    if (scrolling_animation && scrolling_animation.classList.contains('scrolling-spinner')) {
      scrolling_animation.style.transform = 'rotate(' + scrollPosition / 100 + 'rad)';
    }
  }

  function getMetrics() {
    // top-backgrounds.js uses these for scrolling waterdrop size calculation.
    // Coffee logo has no equivalent concept, so return defaults.
    return { initialDropWidth: CONFIG.DROPS_WIDTH, logoRatio: 1 };
  }

  function getObservedElement() {
    return logoImage || document.getElementById('img_1');
  }

  shared.runtime.registerLogoModule({
    init,
    onLayoutChange,
    update,
    getMetrics,
    getObservedElement,
  });
})();
