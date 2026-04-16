// UMIACK top page background/video module

(function () {
  'use strict';

  const shared = window.UMIACKTopShared;
  if (!shared) {
    console.error('UMIACKTopShared is required before top-backgrounds.js');
    return;
  }

  const { CONFIG, animateWaterDrop } = shared;

  let background_video;
  let background_images = [];
  let scrolling_animation;
  let scrolling_drop_svg_brandColor;
  let scrolling_drop_svg_rimLight;
  let scrolling_drop_svg_spotLight;
  let video_overlay;

  let timing_start_scrolling_animation = 0;
  let timing_0 = 0;
  let timing_2 = 0;
  let timing_3 = 0;
  let timing_4 = 0;
  let timing_5 = 0;
  let timing_6 = 0;

  let overlayHasFaded = false;
  let hasOverlayBeenDisplayed = false;

  const video_urls = [
    {
      horizontal: '/common/umiack-site-assets/img/background-images/Title_Horizontal_2000kbps.mov',
      vertical: '/common/umiack-site-assets/img/background-images/Title_Virtical_2000kbps.mov',
    },
  ];
  const video_poster_urls = [
    {
      horizontal: '/common/umiack-site-assets/img/background-images/Title-Movie-Horizontal.webp',
      vertical: '/common/umiack-site-assets/img/background-images/Title-Movie-Vertical.webp',
    },
  ];
  const number_of_videos = video_urls.length;

  function handleVideoPlaying() {
    if (overlayHasFaded || !video_overlay || !background_video) return;
    overlayHasFaded = true;
    video_overlay.style.opacity = '0';
    background_video.removeEventListener('playing', handleVideoPlaying);
  }

  function configureVideoSource() {
    if (!background_video || !video_overlay) return;

    if (window.matchMedia('(max-width: 1023px)').matches) {
      background_video.src = video_urls[0].vertical;
      video_overlay.style.backgroundImage = `url('${video_poster_urls[0].vertical}')`;
      background_video.style.top = (CONFIG.VIDEO_HEADER_OFFSET_MOBILE + CONFIG.VIDEO_EXTRA_OFFSET_MOBILE) + 'px';
    } else {
      const header = document.getElementById('header-container');
      if (header) {
        background_video.src = video_urls[0].horizontal;
        video_overlay.style.backgroundImage = `url('${video_poster_urls[0].horizontal}')`;
        background_video.style.top = `${header.offsetHeight}px`;
      }
    }
  }

  function calculatePhaseThresholds() {
    const lastBlock = document.getElementById('last_block');
    if (!lastBlock) return;

    const vh = window.innerHeight;
    const blockTop = lastBlock.offsetTop;

    timing_0 = blockTop - 1 * vh;
    timing_start_scrolling_animation = blockTop;
    timing_2 = blockTop + 1 * vh;
    timing_3 = blockTop + 2 * vh;
    timing_4 = blockTop + 3 * vh;
    timing_5 = blockTop + 4 * vh;
    timing_6 = blockTop + 5 * vh;

    const dummy = document.getElementById('dummy_space_for_scroll');
    if (dummy) {
      dummy.style.height = `${vh * (CONFIG.NUMBER_OF_PICTURES + number_of_videos + 1)}px`;
    }
  }

  function init() {
    background_video = document.getElementById('background_video');
    background_images = [];
    for (let i = 1; i <= CONFIG.NUMBER_OF_PICTURES; i += 1) {
      background_images.push(document.getElementById(`background_image_${i}`));
    }
    scrolling_animation = document.getElementById('scrolling_animation');
    video_overlay = document.getElementById('background_video_overlay');

    scrolling_drop_svg_brandColor = document.getElementById('brandColor_scrolling');
    scrolling_drop_svg_rimLight = document.getElementById('rimLight_scrolling');
    scrolling_drop_svg_spotLight = document.getElementById('spotLight_scrolling');

    if (!background_video || background_images.includes(null) || !scrolling_animation || !video_overlay) {
      if (window.DEBUG) console.error('Background video, images, or scrolling animation element is missing.');
      return;
    }

    configureVideoSource();

    background_images.forEach((bg) => {
      if (bg) {
        bg.style.display = 'inline';
        bg.style.opacity = '0';
      }
    });
    background_video.style.opacity = '0';
  }

  function onLayoutChange() {
    configureVideoSource();
    calculatePhaseThresholds();
  }

  function update(scrollPosition, { logoMetrics } = {}) {
    if (!background_video || background_images.length === 0 || !scrolling_animation) return;

    let newPhase = 0;
    if (scrollPosition < timing_0) {
      newPhase = 0;
    } else if (scrollPosition < timing_start_scrolling_animation) {
      newPhase = 1;
    } else if (scrollPosition < timing_2) {
      newPhase = 2;
    } else if (scrollPosition < timing_3) {
      newPhase = 3;
    } else if (scrollPosition < timing_4) {
      newPhase = 4;
    } else if (scrollPosition < timing_5) {
      newPhase = 5;
    } else if (scrollPosition < timing_6) {
      newPhase = 6;
    } else {
      newPhase = 7;
    }

    if (newPhase === 0) {
      background_video.style.opacity = '0';
      video_overlay.style.opacity = '0';
    }
    if (newPhase === 1) {
      scrolling_animation.style.opacity = '0';
      background_video.pause();
      background_video.style.opacity = '1';
      if (!hasOverlayBeenDisplayed) {
        video_overlay.style.opacity = '1';
        hasOverlayBeenDisplayed = true;
      }
    } else if (newPhase === 2) {
      background_video.play();
      background_video.style.opacity = '1';
      background_images[0].style.opacity = '0';
      scrolling_animation.style.opacity = '1';
      background_video.addEventListener('playing', handleVideoPlaying);
    } else if (newPhase === 3) {
      background_images[0].style.opacity = '1';
      background_video.style.opacity = '0';
      background_video.pause();
      background_images[1].style.opacity = '0';
    } else if (newPhase === 4) {
      background_images[1].style.opacity = '1';
      background_images[0].style.opacity = '0';
      background_images[2].style.opacity = '0';
    } else if (newPhase === 5) {
      background_images[2].style.opacity = '1';
      background_images[1].style.opacity = '0';
      background_images[3].style.opacity = '0';
    } else if (newPhase === 6) {
      background_images[3].style.opacity = '1';
      background_images[2].style.opacity = '0';
      scrolling_animation.style.opacity = '1';
    } else if (newPhase === 7) {
      scrolling_animation.style.opacity = '0';
    }

    const leftFromVW = window.innerWidth * 0.1;
    const scale_scrolling_drop = 7;
    const t = scrollPosition / CONFIG.SCROLLING_DROP_TIME_SCALE;
    let topFromVH;

    const phaseBoundaries = [
      timing_start_scrolling_animation, timing_2,
      timing_2, timing_3,
      timing_3, timing_4,
      timing_4, timing_5,
      timing_5, timing_6,
    ];

    for (let i = 0; i < phaseBoundaries.length; i += 2) {
      const start = phaseBoundaries[i];
      const end = phaseBoundaries[i + 1];
      if (scrollPosition >= start && scrollPosition < end) {
        const ratio = (scrollPosition - start) / (end - start);
        topFromVH = window.innerHeight * (0.05 + 0.75 * ratio);
        break;
      }
    }

    const dropWidth = logoMetrics?.initialDropWidth ?? CONFIG.DROPS_WIDTH;
    const logoRatio = logoMetrics?.logoRatio ?? 1;

    animateWaterDrop({
      dropElement: scrolling_animation,
      svgRimLight: scrolling_drop_svg_rimLight,
      svgSpotLight: scrolling_drop_svg_spotLight,
      dropWidth,
      scale: scale_scrolling_drop,
      effectiveX: leftFromVW,
      effectiveY: topFromVH,
      rotationDegree: CONFIG.WOBBLE_ROTATION_DEG_SCROLLING + CONFIG.WOBBLE_ROTATION_SPEED_SCROLLING * t,
      t,
      logoRatio,
    });
  }

  shared.runtime.registerBackgroundModule({
    init,
    onLayoutChange,
    update,
  });
})();
