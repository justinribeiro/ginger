var webComponentsSupported = ('registerElement' in document
    && 'import' in document.createElement('link')
    && 'content' in document.createElement('template'));

if (!webComponentsSupported) {
  var script = document.createElement('script');
  script.async = true;
  script.src = '/bower_components/webcomponentsjs/webcomponents-lite.min.js';
  document.head.appendChild(script);

  window.addEventListener('WebComponentsReady', function(e) {
    console.log('FALLBACK: WebComponentsReady() fired and components ready.');
    appInit();
  });

} else {
  window.Polymer = window.Polymer || {dom: 'shadow'};

  var link = document.querySelector('#bundle');
  var onImportLoaded = function() {
    appInit();
  };

  // 5. Go if the async Import loaded quickly. Otherwise wait for it.
  // crbug.com/504944 - readyState never goes to complete until Chrome 46.
  // crbug.com/505279 - Resource Timing API is not available until Chrome 46.
  if (link.import && link.import.readyState === 'complete') {
    appInit();
  } else {
    link.addEventListener('load', appInit);
  }
}

// Async loading w/bindings for Ginger
var script = document.createElement('script');
script.async = true;
script.src = '/bower_components/three.js/three.min.js';
script.onload = initGinger;
document.head.appendChild(script);

function initGinger() {
  var ginger = new Ginger();
  ginger.init();
}

// Async loading w/bindings for copy to clipboard
var script = document.createElement('script');
script.async = true;
script.src = '/bower_components/clipboard/dist/clipboard.min.js';
script.onload = initClipboard;
document.head.appendChild(script);

function initClipboard() {
  var clipboard = new Clipboard('#copytoclipboard-share');
  clipboard.on('success', function(e) {
    ga('send', 'pageview', {'page': '/copied', 'title': 'Share Link Copied'});
    document.getElementById('copytoclipboard-share').textContent = "Copied!";
    setTimeout(function() {
      document.getElementById('copytoclipboard-share').textContent = "Copy to Clipboard";
    }, 2000);
  });
}

// GA platinum-sw-offline-analytics handles offline
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-20667086-9', 'auto');
ga('send', 'pageview');

function appInit() {  

  var version = '2';

  document.getElementById('hide-header').addEventListener('click', function (e) {
    ga('send', 'pageview', {'page': '/header-hidden', 'title': 'Header hidden'});
    document.getElementById('sv-lab-header').remove();
  });

  document.getElementById('copytoclipboard-image').addEventListener('click', function(e) {
    ga('send', 'pageview', {'page': '/downloaded', 'title': 'Downloaded Screenshot'});
    var image = document.getElementById('screenshot-image').src;
    var timestamp = Math.floor(Date.now() / 1000);
    var download  = document.createElement('a');
    download.href = image;
    download.download = 'sv-ginger-' + timestamp + '.jpg';
    download.click();
  });

  document.getElementById('screenshot').addEventListener('click', function (e) {
    ga('send', 'pageview', {'page': '/screenshot', 'title': 'Screenshot triggered'});
  });

  var overlay = document.querySelectorAll('.full-shadow');
  for (var i = 0; i < overlay.length; i++) {
    overlay[i].addEventListener('click', function(e) {
      var parent = e.target.parentNode;
      parent.classList.add('hidden');
    });
  }

  // Ugh...localStorage
  var getVersion = localStorage.getItem('version');
  if (getVersion === undefined || getVersion === null) {
    document.getElementById('version-modal').classList.remove('hidden');
    localStorage.setItem('version', version);
  } else {
    if (getVersion !== version) {
      document.getElementById('version-modal').classList.remove('hidden');
      localStorage.setItem('version', version);
    }
  }
}