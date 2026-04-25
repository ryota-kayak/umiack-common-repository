(() => {
    // -------------------------------------------------------------------------
    // Global Variables and Initial Setup (Encapsulated in IIFE for Modularity)
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Configuration Object: Centralize magic numbers and configurable parameters.
    // -------------------------------------------------------------------------
    const CONFIG = {
        OFFSET_VALUE: 100,          // Offset used for calculating maximum allowed horizontal position.
        HORIZONTAL_FADE_RANGE: 200, // Horizontal fade effect range in pixels.
    };

    // Global delay variable used in the scroll event handler.
    let delay = 0;

    /*
     * uniack coffee Logo Configuration
     * ============================================================
     * from here: Setting up the initial position and scaling for the logo image.
     */
    const imageBean = document.querySelector('#img_2');
    let factor_1 = 50; // Bounce factor for vertical movement calculations.

    // Initial position for the logo.
    const bean_initial_position_x = -97;
    const bean_initial_position_y = 339;

    // Determine viewport width and set a scaling factor for small screens (0 - 479 pixels)
    let widthRatio = 1;
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 479) {
        widthRatio = 0.625; // Scale down the logo on smartphones.
    }

    // Apply the initial position of the logo (imageBean) based on the scaling factor.
    imageBean.style.top = bean_initial_position_y * widthRatio + 'px';
    imageBean.style.left = bean_initial_position_x * widthRatio + 'px';
    /*
     * uniack coffee Logo Configuration
     * to here.
     */

    /*
     * Cache layout values for the imageBean to control the fade-out and clamping of horizontal movement.
     * This logic mirrors the approach used in the umiack.com script.
     */
    let cachedWindowWidth = window.innerWidth;
    let cachedScaledBeanWidth = imageBean.getBoundingClientRect().width;
    let cachedMaxAllowedX = cachedWindowWidth - cachedScaledBeanWidth - (CONFIG.OFFSET_VALUE * widthRatio); // Maintain a fixed offset.

    // Update cached layout values on window resize to maintain responsiveness.
    window.addEventListener('resize', () => {
        cachedWindowWidth = window.innerWidth;
        cachedScaledBeanWidth = imageBean.getBoundingClientRect().width;
        cachedMaxAllowedX = cachedWindowWidth - cachedScaledBeanWidth - (CONFIG.OFFSET_VALUE * widthRatio);
    });

    // Variables controlling timing for background images and scrolling animations.
    let timing_load_background_images = 0;
    let timing_start_scrolling_animation = 0;
    let timing_2 = 0;
    let timing_3 = 0;
    let timing_4 = 0;
    let timing_5 = 0;
    let current_timing = 0;

    // Number of background images used for the scroll effect.
    const number_of_pictures = 4;

    // -------------------------------------------------------------------------
    // Window Onload: Setup Background Video and Timing Variables
    // -------------------------------------------------------------------------
    window.onload = () => {
        const logo_container = document.querySelector('#logo_container'); // Container holding the logo.
        // Set the global delay from the logo container's top offset.
        delay = logo_container.getBoundingClientRect().top;

        const video = document.getElementById('background_video');

        /*
         * Adjust the video source and vertical positioning based on viewport width.
         * For screens up to 1023 pixels wide, use a vertical video.
         */
        if (window.matchMedia("(max-width: 1023px)").matches) {
            video.src = "/wp-content/uploads/2025/05/Title-Movie-Vertical.mov";
            video.style.top = (53 + 100) + 'px';
        } else {
            const header = document.getElementById('header-container');
            video.src = "/wp-content/uploads/2025/05/Title-Movie-Horizontal.mov";
            video.style.top = header.offsetHeight + 'px';
        }

        // Hide the loading animation once the video data has loaded.
        video.onloadeddata = () => {
            const loading_animation = document.getElementById('loading_animation');
            loading_animation.style.display = 'none';
        };

        // Calculate the vertical timing for scrolling effects based on the last block's position.
        const last_block = document.getElementById('last_block');
        const rect = last_block.getBoundingClientRect(); // Relative to the current viewport.
        const vh = window.innerHeight; // Viewport height.
        const last_block_position = rect.top + window.scrollY; // Absolute position on the page.

        /*
         * Set up timing variables to manage the sequencing and z-index adjustments for background images.
         * These control which background elements are visible at different scroll positions.
         */
        const distance_between_company_names_and_viewport_top = document.querySelector('#company_names').getBoundingClientRect().top;
        timing_load_background_images = distance_between_company_names_and_viewport_top;
        timing_start_scrolling_animation = last_block_position;
        timing_2 = last_block_position * 1.1;
        timing_3 = timing_2 + vh;
        timing_4 = timing_3 + vh;
        timing_5 = timing_4 + vh;

        // Set dummy space height to enable scrolling effects.
        const dummy_space_for_scroll = document.getElementById('dummy_space_for_scroll');
        dummy_space_for_scroll.style.height = vh * number_of_pictures + 'px';
    };

    // -------------------------------------------------------------------------
    // Retrieve Background Elements for z-index Management
    // -------------------------------------------------------------------------
    const background_video = document.getElementById('background_video');
    const background_images = [];
    for (let i = 1; i <= number_of_pictures; i++) {
        background_images.push(document.getElementById(`background_image_${i}`));
    }
    const scrolling_animation = document.getElementById('scrolling_animation');

    // =========================================================================
    // Step 2: Separation of Concerns - Modularizing the Scroll Effects Logic
    // =========================================================================
    /**
     * Update Background Layers based on the current scroll position.
     *
     * This function manages the z-index ordering, display state, and rotation of background
     * video and images based on several timing variables.
     *
     * @param {number} scrollPosition - The current vertical scroll position.
     */
    const updateBackgroundLayers = (scrollPosition) => {
        // ---------------------------------------------------------------------
        // Background Video and Image Layer Management
        // ---------------------------------------------------------------------
        if (scrollPosition < timing_load_background_images && current_timing !== 1) {
            // Lower z-index values: background video and images are set behind.
            background_video.style.zIndex = "-100";
            background_image_1.style.zIndex = "-101";
            background_image_2.style.zIndex = "-101";
            background_image_3.style.zIndex = "-101";
            background_image_4.style.zIndex = "-101";

            current_timing = 1;
            scrolling_animation.style.display = "none";
        }
        if (scrollPosition > timing_load_background_images &&
            scrollPosition < timing_start_scrolling_animation &&
            current_timing !== 1.5) {

            // Raise background_image_1 above by adjusting z-index.
            background_video.style.zIndex = "-101";
            background_image_1.style.zIndex = "-100";
            background_image_2.style.zIndex = "-101";
            background_image_3.style.zIndex = "-101";
            background_image_4.style.zIndex = "-101";

            // Ensure that background video and images are visible.
            background_video.style.display = "inline";
            background_images.forEach((background_image) => {
                background_image.style.display = 'inline';
            });
            // Set appropriate background images.
            background_image_1.style.backgroundImage = "url('https://jp.umiack.com/wp-content/uploads/2024/01/IMG_2618.webp')";
            background_image_2.style.backgroundImage = "url('https://jp.umiack.com/wp-content/uploads/2024/01/IMG_2615-1.webp')";
            background_image_3.style.backgroundImage = "url('https://jp.umiack.com/wp-content/uploads/2024/01/IMG_2417_2.webp')";
            background_image_4.style.backgroundImage = "url('https://jp.umiack.com/wp-content/uploads/2024/01/IMG_2625-1.webp')";

            current_timing = 1.5;
            scrolling_animation.style.display = "none";
        }
        if (scrollPosition > timing_start_scrolling_animation && scrollPosition < timing_2 && current_timing !== 2) {
            current_timing = 2;
            scrolling_animation.style.display = "inline";
        }
        if (scrollPosition > timing_2 && scrollPosition < timing_3 && current_timing !== 3) {
            // Prioritize the second background image.
            background_video.style.zIndex = "-101";
            background_image_1.style.zIndex = "-101";
            background_image_2.style.zIndex = "-100";
            background_image_3.style.zIndex = "-101";
            background_image_4.style.zIndex = "-101";

            current_timing = 3;
            scrolling_animation.style.display = "inline";
        }
        if (scrollPosition > timing_3 && scrollPosition < timing_4 && current_timing !== 4) {
            // Bring the third background image to the front.
            background_video.style.zIndex = "-101";
            background_image_1.style.zIndex = "-101";
            background_image_2.style.zIndex = "-101";
            background_image_3.style.zIndex = "-100";
            background_image_4.style.zIndex = "-101";

            current_timing = 4;
            scrolling_animation.style.display = "inline";
        }
        if (scrollPosition > timing_4 && scrollPosition < timing_5 && current_timing !== 5) {
            // Bring the fourth background image forward.
            background_video.style.zIndex = "-101";
            background_image_1.style.zIndex = "-101";
            background_image_2.style.zIndex = "-101";
            background_image_3.style.zIndex = "-101";
            background_image_4.style.zIndex = "-100";

            current_timing = 5;
            scrolling_animation.style.display = "inline";
        }

        // Rotate the scrolling animation element proportionally to scroll position.
        scrolling_animation.style.transform = "rotate(" + scrollPosition / 100 + "rad)";
    };

    /**
     * Update Logo Motion based on the current scroll position.
     *
     * This function handles the horizontal and vertical movement, including deceleration and bounce,
     * as well as the rotation of the logo. It also applies a fade-out effect as the logo nears the right border.
     *
     * @param {number} scrollPosition - The current vertical scroll position.
     */
    const updateLogoMotion = (scrollPosition) => {
        // Only update the logo motion if scrolling has passed the initial delay.
        if (scrollPosition > delay) {
            // Calculate how far the scroll position exceeds the initial delay.
            const adjustedScroll = scrollPosition - delay;

            // Compute horizontal movement with deceleration using a power function.
            let horizontalMovement = bean_initial_position_x + adjustedScroll ** 0.95;
            let displayedXPosition = horizontalMovement * widthRatio;
            let effectiveX;

            // Clamp the horizontal position based on the cached maximum allowed value.
            if (displayedXPosition > cachedMaxAllowedX) {
                imageBean.style.left = cachedMaxAllowedX + 'px';
                effectiveX = cachedMaxAllowedX;
            } else {
                imageBean.style.left = displayedXPosition + 'px';
                effectiveX = displayedXPosition;
            }

            // Apply horizontal fade-out using the helper function.
            // The opacity transitions from full at (cachedMaxAllowedX - HORIZONTAL_FADE_RANGE)
            // to zero when the logo reaches cachedMaxAllowedX.
            AnimationHelpers.applyLinearFade(imageBean, effectiveX, cachedMaxAllowedX - CONFIG.HORIZONTAL_FADE_RANGE, cachedMaxAllowedX);

            // Calculate vertical motion to simulate a bounce effect using a cosine wave.
            const quadrant = (adjustedScroll / factor_1) / (Math.PI / 2);
            const energy_loss_factor = Math.floor((quadrant + 1) / 2); // Progressive energy loss effect.
            const cos_wave = Math.cos(adjustedScroll / factor_1);
            const rebound_wave = Math.abs(cos_wave);
            const rebound_wave_with_energy_loss = rebound_wave * (1 / (1.5 ** energy_loss_factor));
            // Determine vertical displacement to simulate the bounce.
            let verticalMovement = bean_initial_position_y + ((1 - rebound_wave_with_energy_loss) * 100);
            imageBean.style.top = verticalMovement * widthRatio + 'px';

            // Gradually rotate the logo based on the adjusted scroll value.
            imageBean.style.transform = 'rotate(' + adjustedScroll / 20 + 'rad)';
        }
    };

    /**
     * Main Scroll Event Handler
     *
     * This function combines the background and logo updates by delegating to the
     * specialized functions, keeping the code modular and easier to maintain.
     */
    const updateScrollEffects = () => {
        const scrollPosition = window.scrollY;
        updateBackgroundLayers(scrollPosition);
        updateLogoMotion(scrollPosition);
    };

    // -------------------------------------------------------------------------
    // Attach the Scroll Event Listener with requestAnimationFrame Throttling
    // -------------------------------------------------------------------------
    // Throttle the scroll event handler for improved performance using AnimationHelpers.
    window.addEventListener('scroll', AnimationHelpers.throttleAnimationFrame(updateScrollEffects));
})();
