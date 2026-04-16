// UMIACK top page logo module

(function () {
  'use strict';

  const shared = window.UMIACKTopShared;
  if (!shared) {
    console.error('UMIACKTopShared is required before top-umiack-logo.js');
    return;
  }

  const {
    CONFIG,
    AnimationHelpers,
    degToRad,
    animateWaterDrop,
  } = shared;

  let bodyHeight;
  let viewportWidth;
  let logoRatio;
  let maxAllowedX;
  let minAllowedX;
  let maxAllowedY;
  let scrollPosition = 0;
  let delay = 0;

  let dropsStartPositionY;
  let leftDropStartPositionX;
  let rightDropStartPositionX;
  let vxRight, vyRight, vzRight;
  let vxLeft, vyLeft, vzLeft;
  let leftDropWithBump, rightDropWithBump, leftDrop, rightDrop;
  let baseDropShadow;
  let initialDropWidth;

  let img_a, img_b;
  let logo_container;
  let logo_background;

  let left_drop_svg_brandColor;
  let left_drop_svg_rimLight;
  let left_drop_svg_spotLight;
  let right_drop_svg_brandColor;
  let right_drop_svg_rimLight;
  let right_drop_svg_spotLight;

  function init() {
    img_a = document.getElementById('img_a');
    img_b = document.getElementById('img_b');
    leftDropWithBump = document.getElementById('img_3');
    rightDropWithBump = document.getElementById('img_4');
    leftDrop = document.getElementById('img_7');
    rightDrop = document.getElementById('img_8');
    logo_container = document.getElementById('logo_container');
    logo_background = document.getElementById('logo_background');

    if (logo_container) {
      logo_container.style.opacity = 1;
    }

    baseDropShadow = getComputedStyle(document.documentElement)
      .getPropertyValue('--base-drop-shadow')
      .trim();

    if (!img_b || !leftDropWithBump || !rightDropWithBump || !leftDrop || !rightDrop || !logo_container || !logo_background) {
      if (window.DEBUG) console.error('One or more required logo elements are missing in the DOM.');
      return;
    }

    left_drop_svg_brandColor = document.getElementById('brandColor_7');
    left_drop_svg_rimLight = document.getElementById('rimLight_7');
    left_drop_svg_spotLight = document.getElementById('spotLight_7');
    right_drop_svg_brandColor = document.getElementById('brandColor_8');
    right_drop_svg_rimLight = document.getElementById('rimLight_8');
    right_drop_svg_spotLight = document.getElementById('spotLight_8');

    if (!left_drop_svg_brandColor || !left_drop_svg_rimLight || !left_drop_svg_spotLight || !right_drop_svg_brandColor || !right_drop_svg_rimLight || !right_drop_svg_spotLight) {
      if (window.DEBUG) console.error('Logo SVG content is not loaded yet.');
      return;
    }

    rightDropWithBump.style.transform = `rotate(${CONFIG.R_BUMP_DROP_ROTATION_DEG}deg)`;
  }

  function initializeLogoImagePositions() {
    viewportWidth = window.innerWidth;
    if (!logo_background) return;

    const loadedUrl = logo_background.currentSrc || '';

    if (loadedUrl.includes('background-mobile')) {
      initialDropWidth = CONFIG.DROPS_WIDTH_SMARTPHONE;
      const bgWidth = CONFIG.BG_WIDTH_SMARTPHONE;
      const logoWidth = logo_background.getBoundingClientRect().width;
      logoRatio = logoWidth / bgWidth;

      dropsStartPositionY = logoRatio * CONFIG.DROPS_TOP_SMARTPHONE;
      leftDropStartPositionX = logoRatio * CONFIG.L_DROPS_LEFT_SMARTPHONE;
      rightDropStartPositionX = logoRatio * CONFIG.R_DROPS_LEFT_SMARTPHONE;

      const elevRightRad_sp = degToRad(CONFIG.INITIAL_ELEVATION_RIGHT_SMARTPHONE);
      const azimRightRad_sp = degToRad(CONFIG.INITIAL_AZIMUTH_RIGHT_SMARTPHONE);
      const elevLeftRad_sp = degToRad(CONFIG.INITIAL_ELEVATION_LEFT_SMARTPHONE);
      const azimLeftRad_sp = degToRad(CONFIG.INITIAL_AZIMUTH_LEFT_SMARTPHONE);

      vxRight = CONFIG.INITIAL_SPEED_RIGHT_SMARTPHONE * Math.cos(elevRightRad_sp) * Math.cos(azimRightRad_sp);
      vyRight = CONFIG.INITIAL_SPEED_RIGHT_SMARTPHONE * Math.cos(elevRightRad_sp) * -1 * Math.sin(azimRightRad_sp);
      vzRight = CONFIG.INITIAL_SPEED_RIGHT_SMARTPHONE * Math.sin(elevRightRad_sp);

      vxLeft = CONFIG.INITIAL_SPEED_LEFT_SMARTPHONE * Math.cos(elevLeftRad_sp) * Math.cos(azimLeftRad_sp);
      vyLeft = CONFIG.INITIAL_SPEED_LEFT_SMARTPHONE * Math.cos(elevLeftRad_sp) * -1 * Math.sin(azimLeftRad_sp);
      vzLeft = CONFIG.INITIAL_SPEED_LEFT_SMARTPHONE * Math.sin(elevLeftRad_sp);

      img_a.style.width = (logoRatio * CONFIG.A_WIDTH_SMARTPHONE) + 'px';
      img_a.style.top = (logoRatio * CONFIG.A_TOP_SMARTPHONE) + 'px';
      img_a.style.left = (logoRatio * CONFIG.A_LEFT_SMARTPHONE) + 'px';

      img_b.style.width = (logoRatio * CONFIG.B_WIDTH_SMARTPHONE) + 'px';
      img_b.style.top = (logoRatio * CONFIG.B_TOP_SMARTPHONE) + 'px';
      img_b.style.left = (logoRatio * CONFIG.B_LEFT_SMARTPHONE) + 'px';

      [leftDropWithBump, rightDropWithBump].forEach((el) => {
        el.style.width = (logoRatio * initialDropWidth) + 'px';
        el.style.top = dropsStartPositionY + 'px';
      });

      leftDropWithBump.style.left = leftDropStartPositionX + 'px';
      rightDropWithBump.style.left = rightDropStartPositionX + 'px';

      bodyHeight = document.body.scrollHeight;
      const logoMotionOrigin = logo_container.getBoundingClientRect().top + window.scrollY;
      maxAllowedY = (bodyHeight - logoMotionOrigin) / 2;
    } else {
      initialDropWidth = CONFIG.DROPS_WIDTH;
      const bgWidth = CONFIG.BG_WIDTH;
      logoRatio = logo_background.getBoundingClientRect().width / bgWidth;

      dropsStartPositionY = logoRatio * CONFIG.TRANSPARENT_DROPS_TOP;
      leftDropStartPositionX = logoRatio * CONFIG.L_DROPS_LEFT;
      rightDropStartPositionX = logoRatio * CONFIG.R_DROPS_LEFT;

      const elevRightRad = degToRad(CONFIG.INITIAL_ELEVATION_RIGHT);
      const azimRightRad = degToRad(CONFIG.INITIAL_AZIMUTH_RIGHT);
      const elevLeftRad = degToRad(CONFIG.INITIAL_ELEVATION_LEFT);
      const azimLeftRad = degToRad(CONFIG.INITIAL_AZIMUTH_LEFT);

      vxRight = CONFIG.INITIAL_SPEED_RIGHT * Math.cos(elevRightRad) * Math.cos(azimRightRad);
      vyRight = CONFIG.INITIAL_SPEED_RIGHT * Math.cos(elevRightRad) * -1 * Math.sin(azimRightRad);
      vzRight = CONFIG.INITIAL_SPEED_RIGHT * Math.sin(elevRightRad);

      vxLeft = CONFIG.INITIAL_SPEED_LEFT * Math.cos(elevLeftRad) * Math.cos(azimLeftRad);
      vyLeft = CONFIG.INITIAL_SPEED_LEFT * Math.cos(elevLeftRad) * -1 * Math.sin(azimLeftRad);
      vzLeft = CONFIG.INITIAL_SPEED_LEFT * Math.sin(elevLeftRad);

      img_a.style.width = (logoRatio * CONFIG.A_WIDTH) + 'px';
      img_a.style.top = (logoRatio * CONFIG.A_TOP) + 'px';
      img_a.style.left = (logoRatio * CONFIG.A_LEFT) + 'px';

      img_b.style.width = (logoRatio * CONFIG.B_WIDTH) + 'px';
      img_b.style.top = (logoRatio * CONFIG.B_TOP) + 'px';
      img_b.style.left = (logoRatio * CONFIG.B_LEFT) + 'px';

      [leftDropWithBump, rightDropWithBump].forEach((el) => {
        el.style.width = (logoRatio * initialDropWidth) + 'px';
        el.style.top = dropsStartPositionY + 'px';
      });

      leftDropWithBump.style.left = (logoRatio * CONFIG.L_DROPS_LEFT) + 'px';
      rightDropWithBump.style.left = rightDropStartPositionX + 'px';

      bodyHeight = document.body.scrollHeight;
      const logoMotionOrigin = logo_container.getBoundingClientRect().top + window.scrollY;
      maxAllowedY = (bodyHeight - logoMotionOrigin) / 2;
    }

    minAllowedX = 0;
    update(scrollPosition);
  }

  function update(scrollPositionArg) {
    scrollPosition = scrollPositionArg;
    if (!img_b || !leftDropWithBump || !rightDropWithBump || !leftDrop || !rightDrop) return;

    const localScroll = Math.max(0, scrollPosition - delay);
    const isAtTop = localScroll === 0;

    leftDropWithBump.style.visibility = isAtTop ? 'visible' : 'hidden';
    rightDropWithBump.style.visibility = isAtTop ? 'visible' : 'hidden';
    leftDrop.style.visibility = isAtTop ? 'hidden' : 'visible';
    rightDrop.style.visibility = isAtTop ? 'hidden' : 'visible';

    let timeLine = 1 - localScroll / CONFIG.TIMELINE_MAX_SCROLL;
    timeLine = Math.max(0, timeLine);
    AnimationHelpers.applyLinearFade(img_b, timeLine, 1, 0.8);

    const fraction = Math.max(0, Math.min(1, scrollPosition / CONFIG.COLOR_TRANSITION_RANGE));
    if (left_drop_svg_brandColor) left_drop_svg_brandColor.setAttribute('opacity', 1 - fraction);
    if (right_drop_svg_brandColor) right_drop_svg_brandColor.setAttribute('opacity', 1 - fraction);

    const t = localScroll / CONFIG.DELTA_TIME_DIVISOR;

    const x_right = rightDropStartPositionX + (vxRight * Math.sqrt(logoRatio)) * t;
    const y_right = dropsStartPositionY + (vyRight * Math.sqrt(logoRatio)) * t + 0.5 * CONFIG.GRAVITY * (t ** 2);
    const z_right = (vzRight * Math.sqrt(logoRatio)) * t;
    const scale_right = 1 + z_right * CONFIG.DROP_Z_MOVEMENT_RATE;

    const x_left = leftDropStartPositionX + (vxLeft * Math.sqrt(logoRatio)) * t;
    const y_left = dropsStartPositionY + (vyLeft * Math.sqrt(logoRatio)) * t + 0.5 * CONFIG.GRAVITY * (t ** 2);
    const z_left = (vzLeft * Math.sqrt(logoRatio)) * t;
    const scale_left = 1 + z_left * CONFIG.DROP_Z_MOVEMENT_RATE;

    maxAllowedX = window.innerWidth - (logoRatio * initialDropWidth * scale_right) - (logoRatio * CONFIG.OFFSET_VALUE);

    const effectiveXright = Math.min(x_right, maxAllowedX);
    const effectiveYright = Math.min(y_right, maxAllowedY);
    const effectiveXleft = Math.max(x_left, minAllowedX);
    const effectiveYleft = Math.min(y_left, maxAllowedY);

    AnimationHelpers.applyLinearFade(leftDrop, effectiveYleft, maxAllowedY - CONFIG.VERTICAL_FADE_RANGE, maxAllowedY);
    AnimationHelpers.applyLinearFade(rightDrop, effectiveXright, maxAllowedX - CONFIG.HORIZONTAL_FADE_RANGE, maxAllowedX);

    if (y_left < maxAllowedY) {
      animateWaterDrop({
        dropElement: leftDrop,
        svgRimLight: left_drop_svg_rimLight,
        svgSpotLight: left_drop_svg_spotLight,
        dropWidth: initialDropWidth,
        scale: scale_left,
        effectiveX: effectiveXleft,
        effectiveY: effectiveYleft,
        rotationDegree: CONFIG.WOBBLE_ROTATION_DEG_LEFT + CONFIG.WOBBLE_ROTATION_SPEED_LEFT * t,
        t,
        logoRatio,
      });
    }

    if (x_right < maxAllowedX) {
      animateWaterDrop({
        dropElement: rightDrop,
        svgRimLight: right_drop_svg_rimLight,
        svgSpotLight: right_drop_svg_spotLight,
        dropWidth: initialDropWidth,
        scale: scale_right,
        effectiveX: effectiveXright,
        effectiveY: effectiveYright,
        rotationDegree: CONFIG.WOBBLE_ROTATION_DEG_RIGHT + CONFIG.WOBBLE_ROTATION_SPEED_RIGHT * t,
        t,
        logoRatio,
      });
    }
  }

  function onLayoutChange() {
    initializeLogoImagePositions();
  }

  function getMetrics() {
    return { initialDropWidth, logoRatio };
  }

  function getObservedElement() {
    return logo_background || document.getElementById('logo_background');
  }

  shared.runtime.registerLogoModule({
    init,
    onLayoutChange,
    update,
    getMetrics,
    getObservedElement,
  });
})();
