// umiackcoffee.com top page loader
(function () {
  var v = 'BUILD_VERSION';
  var jsBase = '/common/umiack-site-assets/js/';

  // Load Scripts
  var scripts = [
    'top-shared.js',
    'top-backgrounds.js',
    'top-coffee-logo.js'
  ];
  scripts.forEach(function (file) {
    var s = document.createElement('script');
    s.src = jsBase + file + '?v=' + v;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
