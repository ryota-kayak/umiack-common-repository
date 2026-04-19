// Umiack Kayak Tours Loader - Latest Version
// Paste this into Cocoon's Custom JavaScript code field.
(function () {
  var baseJs = '/common/umiack-site-assets/js/';
  var baseCss = '/common/umiack-site-assets/css/';
  var version = 'BUILD_VERSION'; // Will be replaced during build

  // 1. Load Styles (if not already present)
  if (!document.getElementById('kayak-tour-css')) {
    var l = document.createElement('link');
    l.id = 'kayak-tour-css';
    l.rel = 'stylesheet';
    l.href = baseCss + 'kayak-tour.css?v=' + version;
    document.head.appendChild(l);
  }

  // 2. Load Slider JS
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
