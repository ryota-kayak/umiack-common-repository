/**
 * animationHelpers.js
 *
 * A complete module that provides shared functionality for scroll-based animations,
 * fade transitions, CSS matrix transforms, linear interpolation, and requestAnimationFrame-based throttling.
 *
 * This module is intended to be used by both umiack.com and umiackcoffee.com, and any other projects
 * that require consistent animation effects.
 *
 * Usage:
 *   1. Place this file in a common directory, for example:
 *        /home/umiack/www/common/animationHelpers.js
 *   2. Include it in your HTML pages via:
 *        <script src="/common/animationHelpers.js"></script>
 *   3. Use the helper functions as needed, e.g.:
 *        AnimationHelpers.applyLinearFade(element, value, fullOpacityBound, zeroOpacityBound);
 *        AnimationHelpers.computeMatrixTransform(scaleX, scaleY, rotationDeg);
 *        AnimationHelpers.lerp(a, b, t);
 *        const throttledFn = AnimationHelpers.throttleAnimationFrame(yourFunction);
 */

const AnimationHelpers = {
    /**
     * Applies a linear fade effect to a DOM element based on a provided value.
     * The element's opacity will transition between fully opaque (1) and fully transparent (0)
     * over a defined range.
     *
     * @param {HTMLElement} element - The DOM element to update.
     * @param {number} value - The current value that influences opacity.
     * @param {number} fullOpacityBound - The threshold value at which the element is fully opaque.
     * @param {number} zeroOpacityBound - The threshold value at which the element is fully transparent.
     */
    applyLinearFade: function(element, value, fullOpacityBound, zeroOpacityBound) {
        if (fullOpacityBound < zeroOpacityBound) {
            // Increasing fade: fully opaque below the lower bound, fully transparent above the upper bound.
            if (value <= fullOpacityBound) {
                element.style.opacity = 1;
            } else if (value >= zeroOpacityBound) {
                element.style.opacity = 0;
            } else {
                element.style.opacity = 1 - (value - fullOpacityBound) / (zeroOpacityBound - fullOpacityBound);
            }
        } else {
            // Decreasing fade: fully opaque above the upper bound, fully transparent below the lower bound.
            if (value >= fullOpacityBound) {
                element.style.opacity = 1;
            } else if (value <= zeroOpacityBound) {
                element.style.opacity = 0;
            } else {
                element.style.opacity = (value - zeroOpacityBound) / (fullOpacityBound - zeroOpacityBound);
            }
        }
    },

    /**
     * Computes a CSS matrix transform string for an element based on scaling factors and a rotation angle.
     *
     * @param {number} scaleX - The scaling factor along the x-axis.
     * @param {number} scaleY - The scaling factor along the y-axis.
     * @param {number} rotationDeg - The rotation angle in degrees.
     * @returns {string} - The CSS matrix transform string.
     *
     * Example output:
     *   matrix(a, b, c, d, 0, 0)
     */
    computeMatrixTransform: function(scaleX, scaleY, rotationDeg) {
        const rotationRad = rotationDeg * Math.PI / 180;
        const cos = Math.cos(rotationRad);
        const sin = Math.sin(rotationRad);
        const a = scaleX * cos;
        const b = scaleX * sin;
        const c = -scaleY * sin;
        const d = scaleY * cos;
        return `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`;
    },

    /**
     * Performs a linear interpolation between two numbers.
     *
     * @param {number} a - The starting value.
     * @param {number} b - The ending value.
     * @param {number} t - The interpolation fraction (a value between 0 and 1).
     * @returns {number} - The interpolated value.
     */
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Throttles a function to be executed using requestAnimationFrame.
     * This ensures that the function is not executed more than once per animation frame,
     * reducing performance overhead during scroll or resize events.
     *
     * @param {Function} callback - The function to throttle.
     * @returns {Function} - The throttled function.
     *
     * Example usage:
     *   const throttledFunc = AnimationHelpers.throttleAnimationFrame(() => {
     *       // Your scroll or resize logic here.
     *   });
     *   window.addEventListener('scroll', throttledFunc);
     */
    throttleAnimationFrame: function(callback) {
        let ticking = false;
        return function(...args) {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    callback.apply(this, args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    }
};

// Expose the module to the global scope for use in other scripts.
window.AnimationHelpers = AnimationHelpers;
