// umiack.com / jp.umiack.com top page loader
(function () {
  var v = 'BUILD_VERSION';
  var jsBase = '/common/umiack-site-assets/js/';
  var cssBase = '/common/umiack-site-assets/css/';

  // 1. Load Styles
  var styles = [
    'top-base.css',
    'top-umiack-logo.css',
    'top-umiack-links.css'
  ];
  styles.forEach(function (file) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = cssBase + file + '?v=' + v;
    document.head.appendChild(l);
  });

  // 2. Load Scripts
  var scripts = [
    'top-shared.js',
    'top-backgrounds.js',
    'top-umiack-logo.js'
  ];
  scripts.forEach(function (file) {
    var s = document.createElement('script');
    s.src = jsBase + file + '?v=' + v;
    s.defer = true;
    document.head.appendChild(s);
  });
})();
