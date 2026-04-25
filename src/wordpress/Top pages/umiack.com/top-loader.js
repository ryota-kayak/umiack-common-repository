// umiack.com top page loader
// Single-scroll-loop split version.
// Paste this into Cocoon's Custom JavaScript code field.
(function () {
  var base = '/common/umiack-site-assets/js/';
  var files = [
    'top-shared.js',
    'top-backgrounds.js',
    'top-umiack-logo.js'
  ];

  files.forEach(function (file) {
    var s = document.createElement('script');
    s.src = base + file;
    s.defer = true;
    document.head.appendChild(s);
  });
})();

