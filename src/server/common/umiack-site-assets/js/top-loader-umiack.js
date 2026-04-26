// umiack.com / jp.umiack.com top page loader
(function () {
  var v = 'BUILD_VERSION';
  var base = '/common/umiack-site-assets/js/';
  var files = [
    'top-shared.js',
    'top-backgrounds.js',
    'top-umiack-logo.js'
  ];

  files.forEach(function (file) {
    var s = document.createElement('script');
    s.src = base + file + '?v=' + v;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
