// Umiack Kayak Tours Loader - Production Version
// Centralized loader. Call this script from your WordPress page.
(function () {
  var baseJs = '/common/umiack-site-assets/js/';
  var version = 'BUILD_VERSION'; // Will be replaced during build

  // 1. Load Slider JS
  var files = [
    'umiack-slider.js'
  ];

  files.forEach(function (file) {
    var s = document.createElement('script');
    s.src = baseJs + file + '?v=' + version;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
