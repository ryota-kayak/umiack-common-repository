// UMIACK top page shared runtime and helpers
// Single scroll/RAF loop version.

window.DEBUG = window.DEBUG ?? false;

(function () {
  'use strict';

  const CONFIG = {
    BG_WIDTH: 3840,
    A_WIDTH: 1222.7968,
    A_TOP: 479.9264,
    A_LEFT: 1178.9376,
    B_WIDTH: 614.5888,
    B_TOP: 588.8192,
    B_LEFT: 1725.0368,
    DROPS_WIDTH: 67.168,
    DROPS_TOP: 1168.7808,
    L_DROPS_LEFT: 1745.1104,
    R_DROPS_LEFT: 2336.352,
    R_BUMP_DROP_ROTATION_DEG: 40,

    BG_WIDTH_SMARTPHONE: 1440,
    A_WIDTH_SMARTPHONE: 917.0976,
    A_TOP_SMARTPHONE: 359.945,
    A_LEFT_SMARTPHONE: 236.532,
    B_WIDTH_SMARTPHONE: 460.942,
    B_TOP_SMARTPHONE: 441.614,
    B_LEFT_SMARTPHONE: 646.106,
    DROPS_WIDTH_SMARTPHONE: 50.376,
    DROPS_TOP_SMARTPHONE: 876.586,
    L_DROPS_LEFT_SMARTPHONE: 661.162,
    R_DROPS_LEFT_SMARTPHONE: 1104.593,

    VIDEO_HEADER_OFFSET_MOBILE: 53,
    VIDEO_EXTRA_OFFSET_MOBILE: 100,
    NUMBER_OF_PICTURES: 4,

    TIMELINE_MAX_SCROLL: 700,
    COLOR_TRANSITION_RANGE: 30,
    DELTA_TIME_DIVISOR: 60,
    HORIZONTAL_FADE_RANGE: 50,
    VERTICAL_FADE_RANGE: 50,
    DROP_Z_MOVEMENT_RATE: 0.02,
    SCROLLING_DROP_TIME_SCALE: 300,

    SMALL_SCREEN_WIDTH: 479,
    SMALL_SCREEN_SCALE: 0.625,

    GRAVITY: 9.8,

    INITIAL_SPEED_RIGHT: 130,
    INITIAL_AZIMUTH_RIGHT: 45,
    INITIAL_ELEVATION_RIGHT: 5,

    INITIAL_SPEED_LEFT: 130,
    INITIAL_AZIMUTH_LEFT: 95.7,
    INITIAL_ELEVATION_LEFT: 20,

    INITIAL_SPEED_RIGHT_SMARTPHONE: 110,
    INITIAL_AZIMUTH_RIGHT_SMARTPHONE: 45,
    INITIAL_ELEVATION_RIGHT_SMARTPHONE: 5,

    INITIAL_SPEED_LEFT_SMARTPHONE: 110,
    INITIAL_AZIMUTH_LEFT_SMARTPHONE: 96,
    INITIAL_ELEVATION_LEFT_SMARTPHONE: 20,

    START_COLOR: { r: 255, g: 40, b: 0 },
    TARGET_COLOR: { r: 0, g: 175, b: 255 },

    OFFSET_VALUE: 25,
    WOBBLE_ROTATION_DEG_RIGHT: 40,
    WOBBLE_ROTATION_SPEED_RIGHT: 1,
    WOBBLE_ROTATION_DEG_LEFT: -7,
    WOBBLE_ROTATION_SPEED_LEFT: -5,
    WOBBLE_ROTATION_DEG_SCROLLING: 0,
    WOBBLE_ROTATION_SPEED_SCROLLING: 5,
    WAVE_DIVISOR: 20,
    WOBBLE_DIVISOR: 3,

    BACKDROP_BLUR_RATIO: 0.15,
  };

  CONFIG.TRANSPARENT_DROPS_TOP = CONFIG.DROPS_TOP + 0.1197 * CONFIG.DROPS_WIDTH;
  CONFIG.TRANSPARENT_DROPS_WIDTH_SMARTPHONE = 0.86 * CONFIG.DROPS_WIDTH_SMARTPHONE;
  CONFIG.TRANSPARENT_DROPS_TOP_SMARTPHONE = CONFIG.DROPS_TOP_SMARTPHONE + 0.1197 * CONFIG.DROPS_WIDTH_SMARTPHONE;
  CONFIG.TRANSPARENT_L_DROPS_LEFT_SMARTPHONE = CONFIG.L_DROPS_LEFT_SMARTPHONE + 0.1144 * CONFIG.DROPS_WIDTH_SMARTPHONE;

  const AnimationHelpers = {
    applyLinearFade(element, value, fullOpacityBound, zeroOpacityBound) {
      if (!element) return;
      if (fullOpacityBound < zeroOpacityBound) {
        if (value <= fullOpacityBound) {
          element.style.opacity = 1;
        } else if (value >= zeroOpacityBound) {
          element.style.opacity = 0;
        } else {
          element.style.opacity = 1 - (value - fullOpacityBound) / (zeroOpacityBound - fullOpacityBound);
        }
      } else {
        if (value >= fullOpacityBound) {
          element.style.opacity = 1;
        } else if (value <= zeroOpacityBound) {
          element.style.opacity = 0;
        } else {
          element.style.opacity = (value - zeroOpacityBound) / (fullOpacityBound - zeroOpacityBound);
        }
      }
    },

    computeMatrixTransform(scaleX, scaleY, rotationDeg) {
      const rotationRad = rotationDeg * Math.PI / 180;
      const cos = Math.cos(rotationRad);
      const sin = Math.sin(rotationRad);
      const a = scaleX * cos;
      const b = scaleX * sin;
      const c = -scaleY * sin;
      const d = scaleY * cos;
      return `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`;
    },

    throttleAnimationFrame(callback) {
      let ticking = false;
      return function (...args) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            callback.apply(this, args);
            ticking = false;
          });
          ticking = true;
        }
      };
    },
  };

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function rotatePoint(cx, cy, x, y, thetaRad) {
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * Math.cos(thetaRad) - dy * Math.sin(thetaRad),
      y: cy + dx * Math.sin(thetaRad) + dy * Math.cos(thetaRad),
    };
  }

  function resizeWaterdrop(container, newSize) {
    if (!container) return;
    container.style.width = `${newSize}px`;
    container.style.height = `${newSize}px`;

    const shadowSpread = newSize * 0.083;
    const blur = newSize * 0.15;
    container.style.boxShadow =
      `0 0 ${blur}px 0 rgba(180,210,255,0.14), ` +
      `0 0 ${blur * 2.3}px ${shadowSpread}px #fff1`;

    const backdropBlur = newSize * CONFIG.BACKDROP_BLUR_RATIO;
    container.style.backdropFilter = `blur(${backdropBlur}px)`;
    container.style.webkitBackdropFilter = `blur(${backdropBlur}px)`;
  }

  function rotateSvgContents(objectRimLight, objectSpotLight, rotationDeg) {
    if (!objectRimLight || !objectSpotLight) return;
    const cx = 240;
    const cy = 240;
    objectRimLight.setAttribute('transform', `rotate(${-rotationDeg} ${cx} ${cy})`);
    objectSpotLight.setAttribute('transform', `rotate(-10 280 152) rotate(${-rotationDeg} ${cx} ${cy})`);
  }

  function animateWaterDrop({
    dropElement,
    svgRimLight,
    svgSpotLight,
    dropWidth,
    scale,
    effectiveX,
    effectiveY,
    rotationDegree,
    t,
    logoRatio,
  }) {
    if (!dropElement) return;

    const t_wobble = t * 10;
    const WAVE_DIV = 2.7;
    const WOBBLE_DIV = 9.8;

    const wave_x = Math.sin(t_wobble / WAVE_DIV + Math.PI);
    const wave_y = Math.sin(t_wobble / WAVE_DIV);

    const scaleX = wave_x / WOBBLE_DIV + 1;
    const scaleY = wave_y / WOBBLE_DIV + 1;

    let distortion = (Math.abs(wave_x) + Math.abs(wave_y)) / 2;
    distortion = Math.min(distortion, 1);
    const brightness = 1 + distortion * 0.32;
    const contrast = 1 + distortion * 0.23;

    rotateSvgContents(svgRimLight, svgSpotLight, rotationDegree);
    resizeWaterdrop(dropElement, logoRatio * dropWidth * scale);

    const transform =
      `translate3d(${effectiveX}px, ${effectiveY}px, 0) ` +
      AnimationHelpers.computeMatrixTransform(scaleX, scaleY, rotationDegree);

    dropElement.style.transform = transform;
    dropElement.style.filter = `brightness(${brightness}) contrast(${contrast})`;
  }

  const runtime = {
    backgroundModule: null,
    logoModule: null,
    started: false,
    resizeObserver: null,

    registerBackgroundModule(module) {
      this.backgroundModule = module;
    },

    registerLogoModule(module) {
      this.logoModule = module;
    },

    start() {
      if (this.started) return;
      this.started = true;

      try {
        this.backgroundModule?.init?.();
        this.logoModule?.init?.();
      } catch (error) {
        if (window.DEBUG) console.error('UMIACK top init failed:', error);
        return;
      }

      this.handleLayoutChange();
      this.updateAll();

      const throttledScroll = AnimationHelpers.throttleAnimationFrame(() => {
        this.updateAll();
      });
      window.addEventListener('scroll', throttledScroll, { passive: true });

      const throttledResize = AnimationHelpers.throttleAnimationFrame(() => {
        this.handleLayoutChange();
        this.updateAll();
      });
      window.addEventListener('resize', throttledResize, { passive: true });

      const observedElement = this.logoModule?.getObservedElement?.();
      if (observedElement && 'ResizeObserver' in window) {
        let rafId = null;
        this.resizeObserver = new ResizeObserver(() => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            this.handleLayoutChange();
            this.updateAll();
          });
        });
        this.resizeObserver.observe(observedElement);
      }
    },

    handleLayoutChange() {
      this.logoModule?.onLayoutChange?.();
      this.backgroundModule?.onLayoutChange?.();
    },

    updateAll() {
      const scrollPosition = window.scrollY;
      const logoMetrics = this.logoModule?.getMetrics?.() || null;
      this.backgroundModule?.update?.(scrollPosition, { logoMetrics });
      this.logoModule?.update?.(scrollPosition);
    },
  };

  window.UMIACKTopShared = {
    CONFIG,
    AnimationHelpers,
    degToRad,
    rotatePoint,
    resizeWaterdrop,
    rotateSvgContents,
    animateWaterDrop,
    runtime,
  };

  window.addEventListener('load', () => {
    runtime.start();
  }, { once: true });
})();
