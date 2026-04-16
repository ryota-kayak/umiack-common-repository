// Umiack Kayak Tours Loader - Latest Version
// Paste this into Cocoon's Custom JavaScript code field.
(function () {
  var baseJs = 'https://jp.umiack.com/common/umiack-site-assets/js/';
  var baseCss = 'https://jp.umiack.com/common/umiack-site-assets/css/';
  
  // 1. Load Slider CSS (if not already present)
  if (!document.getElementById('umiack-slider-css')) {
    var l = document.createElement('link');
    l.id = 'umiack-slider-css';
    l.rel = 'stylesheet';
    l.href = baseCss + 'kayak-tour.css';
    document.head.appendChild(l);
  }

  // 2. Load Slider JS
  var files = [
    'umiack-slider.js'
  ];

  files.forEach(function (file) {
    var s = document.createElement('script');
    s.src = baseJs + file;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
