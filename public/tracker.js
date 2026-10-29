(function () {
  'use strict';

  var doc = document;
  var win = window;
  var nav = navigator;
  var loc = location;
  var his = history;

  var currentScript = doc.currentScript || doc.querySelector('script[data-website-id]');
  if (!currentScript) return;

  var websiteId = currentScript.getAttribute('data-website-id');
  if (!websiteId) return;

  var hostUrl = currentScript.getAttribute('data-host-url') || (function () {
    var src = currentScript.src;
    var a = doc.createElement('a');
    a.href = src;
    return a.protocol + '//' + a.host;
  })();

  var autoTrack = currentScript.getAttribute('data-auto-track') !== 'false';
  var trackOutbound = currentScript.getAttribute('data-outbound') !== 'false';
  var trackDownloads = currentScript.getAttribute('data-downloads') !== 'false';
  var respectDnt = currentScript.getAttribute('data-respect-dnt') === 'true';

  // Do Not Track check
  if (respectDnt && (nav.doNotTrack === '1' || win.doNotTrack === '1' || nav.msDoNotTrack === '1')) {
    return;
  }

  var lastTrackedPath = '';

  function getScreenType() {
    var width = win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
    if (width < 768) return 'Mobile';
    if (width <= 1024) return 'Tablet';
    return 'Desktop';
  }

  function sendEvent(eventName, eventData, customPath) {
    var path = customPath || loc.pathname;
    var payload = {
      website_id: websiteId,
      event_name: eventName || 'pageview',
      path: path,
      title: doc.title || '',
      referrer: doc.referrer || '',
      screen: getScreenType(),
      event_data: eventData || {}
    };

    var endpoint = hostUrl.replace(/\/$/, '') + '/api/v1/collect';
    var data = JSON.stringify(payload);

    try {
      if (nav.sendBeacon) {
        nav.sendBeacon(endpoint, data);
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(data);
      }
    } catch (e) {
      // Graceful fallback - fail silently
    }
  }

  function trackPageview(path) {
    var currentPath = path || loc.pathname;
    if (currentPath === lastTrackedPath) return;
    lastTrackedPath = currentPath;
    sendEvent('pageview', null, currentPath);
  }

  // Public JavaScript API
  win.privacyAnalytics = {
    track: function (eventName, eventData) {
      sendEvent(eventName, eventData);
    },
    pageview: function (path) {
      trackPageview(path);
    }
  };

  // Initial pageview tracking
  if (autoTrack) {
    if (doc.readyState === 'complete' || doc.readyState === 'interactive') {
      trackPageview();
    } else {
      doc.addEventListener('DOMContentLoaded', function () {
        trackPageview();
      });
    }

    // SPA Navigation Detection
    var pushState = his.pushState;
    if (pushState) {
      his.pushState = function () {
        pushState.apply(this, arguments);
        trackPageview();
      };
    }

    var replaceState = his.replaceState;
    if (replaceState) {
      his.replaceState = function () {
        replaceState.apply(this, arguments);
        trackPageview();
      };
    }

    win.addEventListener('popstate', function () {
      trackPageview();
    });

    // Outbound link and download tracking
    doc.addEventListener('click', function (e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentNode;
      }
      if (!target || !target.href) return;

      var href = target.href;
      var isExternal = target.hostname && target.hostname !== loc.hostname;

      if (trackOutbound && isExternal) {
        win.privacyAnalytics.track('outbound_click', {
          url: href.slice(0, 100),
          target_domain: target.hostname
        });
      }

      if (trackDownloads) {
        var extensionMatch = href.match(/\.(pdf|zip|tar\.gz|tgz|gz|exe|dmg|pkg|deb|rpm|csv|xlsx|docx|mp4|mp3)($|\?)/i);
        if (extensionMatch) {
          win.privacyAnalytics.track('file_download', {
            file_extension: extensionMatch[1],
            file_name: href.split('/').pop().split('?')[0].slice(0, 80)
          });
        }
      }
    }, true);
  }
})();
