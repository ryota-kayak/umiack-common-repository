// Kayak Tours loader
// Paste this into Cocoon's Custom JavaScript code field.
(function () {
  var base = '/common/umiack-site-assets/js/';
  var files = [
    'umiack-slider.js'
  ];

  files.forEach(function (file) {
    var s = document.createElement('script');
    s.src = base + file;
    s.defer = true;
    document.head.appendChild(s);
  });
})();

