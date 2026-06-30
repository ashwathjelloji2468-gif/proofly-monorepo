(function() {
  // Prevent duplicate execution
  if (window.__prooflyWidgetLoaded) return;
  window.__prooflyWidgetLoaded = true;

  // Resolve API Host dynamically from currentScript src
  var scriptEl = document.currentScript;
  var scriptUrl = scriptEl ? scriptEl.src : 'http://localhost:5000/widget.js';
  var apiHost = scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));
  if (apiHost.indexOf('http') !== 0) {
    apiHost = 'http://localhost:5000'; // fallback
  }

  // Helper to log analytics events
  function logAnalytics(widgetId, spaceId, eventType, metadata) {
    try {
      fetch(apiHost + '/api/widgets/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: widgetId,
          spaceId: spaceId,
          eventType: eventType,
          metadata: metadata || {}
        })
      });
    } catch(e) {
      console.error('Proofly Analytics Log Failed:', e);
    }
  }

  // Inject CSS Stylesheet dynamically
  var style = document.createElement('style');
  style.innerHTML = '\
    .proofly-container { font-family: "Outfit", "Inter", sans-serif; box-sizing: border-box; width: 100%; text-align: left; }\
    .proofly-container * { box-sizing: border-box; }\
    .proofly-card { background: #18181B; border: 1px solid rgba(255,255,255,0.06); color: #F4F4F5; padding: 20px; transition: transform 0.2s ease, border-color 0.2s ease; position: relative; }\
    .proofly-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }\
    .proofly-header { display: flex; align-items: center; margin-bottom: 12px; gap: 10px; }\
    .proofly-avatar { width: 40px; height: 40px; rounded: 50%; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }\
    .proofly-meta { display: flex; flex-direction: column; overflow: hidden; }\
    .proofly-name { font-weight: 700; font-size: 14px; color: #FFFFFF; display: flex; align-items: center; gap: 4px; }\
    .proofly-title { font-size: 11px; color: #A1A1AA; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }\
    .proofly-stars { display: flex; gap: 2px; color: #F59E0B; font-size: 12px; margin-bottom: 8px; }\
    .proofly-text { font-size: 13px; line-height: 1.6; color: #E4E4E7; margin-bottom: 12px; white-space: pre-line; }\
    .proofly-date { font-size: 10px; color: #71717A; margin-top: auto; }\
    .proofly-badge-verified { display: inline-flex; align-items: center; color: #10B981; fill: #10B981; width: 13px; height: 13px; }\
    .proofly-video-wrapper { position: relative; border-radius: 8px; overflow: hidden; margin-top: 10px; background: #000; display: flex; }\
    .proofly-video { width: 100%; max-height: 220px; object-fit: cover; }\
    .proofly-branding { display: flex; align-items: center; justify-content: center; font-size: 10px; color: #71717A; margin-top: 20px; text-decoration: none; font-weight: 600; gap: 4px; }\
    .proofly-branding:hover { color: #A1A1AA; }\
    .proofly-branding svg { width: 12px; height: 12px; }\
    /* Masonry Grid */\
    .proofly-masonry { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }\
    /* Carousel Slider */\
    .proofly-carousel-wrapper { position: relative; width: 100%; overflow: hidden; }\
    .proofly-carousel-track { display: flex; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); gap: 20px; }\
    .proofly-carousel-slide { flex: 0 0 calc(33.333% - 14px); min-width: 260px; }\
    @media (max-width: 768px) { .proofly-carousel-slide { flex: 0 0 calc(50% - 10px); } }\
    @media (max-width: 480px) { .proofly-carousel-slide { flex: 0 0 100%; } }\
    .proofly-carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: #18181B; border: 1px solid rgba(255,255,255,0.1); color: #FFF; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: background 0.2s; }\
    .proofly-carousel-btn:hover { background: #27272A; }\
    .proofly-carousel-prev { left: 10px; }\
    .proofly-carousel-next { right: 10px; }\
    /* Single Testimonial layout */\
    .proofly-single { max-width: 500px; margin: 0 auto; }\
    /* Popup Widget */\
    .proofly-popup { position: fixed; bottom: 20px; right: 20px; width: 320px; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-radius: 12px; transform: translateY(120%); transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }\
    .proofly-popup.show { transform: translateY(0); }\
    .proofly-popup-close { position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: #A1A1AA; cursor: pointer; font-size: 14px; }\
    .proofly-popup-close:hover { color: #FFF; }\
    /* Floating trust badge */\
    .proofly-badge-trigger { position: fixed; bottom: 20px; left: 20px; background: #18181B; border: 1px solid rgba(255,255,255,0.1); padding: 10px 16px; border-radius: 30px; display: flex; align-items: center; gap: 8px; color: #FFF; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9998; transition: transform 0.2s; }\
    .proofly-badge-trigger:hover { transform: scale(1.03); }\
    .proofly-badge-bubble { position: fixed; bottom: 70px; left: 20px; width: 300px; background: #18181B; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; z-index: 9998; box-shadow: 0 8px 25px rgba(0,0,0,0.4); display: none; }\
    .proofly-badge-bubble.show { display: block; animation: proofly-fade-in 0.25s ease-out; }\
    @keyframes proofly-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\
  ';
  document.head.appendChild(style);

  // Initialize all widget containers in the DOM
  function initWidgets() {
    // 1. Search for script tag configurations
    var scripts = document.querySelectorAll('script[data-widget], script[data-space]');
    scripts.forEach(function(script) {
      var widgetId = script.getAttribute('data-widget');
      var spaceId = script.getAttribute('data-space');
      if (widgetId || spaceId) {
        var containerId = 'proofly-widget-' + (widgetId || spaceId);
        if (!document.getElementById(containerId)) {
          var div = document.createElement('div');
          div.id = containerId;
          div.className = 'proofly-widget-target';
          if (widgetId) div.setAttribute('data-widget', widgetId);
          if (spaceId) div.setAttribute('data-space', spaceId);
          script.parentNode.insertBefore(div, script.nextSibling);
        }
      }
    });

    // 2. Discover and render all targets
    var targets = document.querySelectorAll('.proofly-widget, .proofly-widget-target, [data-widget-embed]');
    targets.forEach(function(el) {
      if (el.getAttribute('data-proofly-rendered')) return;
      el.setAttribute('data-proofly-rendered', 'true');

      var widgetId = el.getAttribute('data-widget') || el.getAttribute('data-widget-embed');
      var spaceId = el.getAttribute('data-space');

      // If we only have spaceId but no widgetId, we'll fetch default grid widget configurations or query testimonials directly
      var requestUrl = widgetId 
        ? apiHost + '/api/widgets/' + widgetId 
        : apiHost + '/api/widgets/default?spaceId=' + spaceId;

      fetch(requestUrl)
        .then(function(res) {
          if (!res.ok) throw new Error('Widget request failed');
          return res.json();
        })
        .then(function(data) {
          renderWidget(el, data);
        })
        .catch(function(err) {
          console.error('Proofly Widget initialization failed:', err);
        });
    });
  }

  // Main Render Routine
  function renderWidget(element, data) {
    var widget = data.widget;
    var testimonials = data.testimonials;
    if (!testimonials || testimonials.length === 0) {
      element.innerHTML = '';
      return;
    }

    var settings = widget.settings || {};
    var layout = widget.layout; // CAROUSEL, MASONRY, SINGLE, POPUP, FLOATING, WALL
    var isDark = widget.theme === 'DARK' || settings.darkLightMode === 'dark';

    // Apply custom style variables
    var bg = settings.backgroundColor || (isDark ? '#09090B' : '#FFFFFF');
    var cardBg = settings.cardColor || (isDark ? '#18181B' : '#F4F4F5');
    var textColor = settings.textColor || (isDark ? '#E4E4E7' : '#27272A');
    var accentColor = settings.accentColor || '#10B981';
    var borderRadius = settings.borderRadius || '8px';
    var shadow = settings.shadowType || 'md';

    // Build custom stylesheet for this specific widget container
    var widgetStyleId = 'proofly-styles-' + widget.id;
    if (!document.getElementById(widgetStyleId)) {
      var wStyle = document.createElement('style');
      wStyle.id = widgetStyleId;
      var shadowVal = shadow === 'none' ? 'none' : '0 4px 15px rgba(0,0,0,0.15)';
      wStyle.innerHTML = '\
        #proofly-container-' + widget.id + ' { background: ' + bg + '; color: ' + textColor + '; border-radius: ' + borderRadius + '; }\
        #proofly-container-' + widget.id + ' .proofly-card { background: ' + cardBg + '; color: ' + textColor + '; border-radius: ' + borderRadius + '; box-shadow: ' + shadowVal + '; }\
        #proofly-container-' + widget.id + ' .proofly-name { color: ' + (isDark ? '#FFF' : '#000') + '; }\
        #proofly-container-' + widget.id + ' .proofly-stars { color: ' + accentColor + '; }\
      ';
      document.head.appendChild(wStyle);
    }

    var container = document.createElement('div');
    container.id = 'proofly-container-' + widget.id;
    container.className = 'proofly-container';

    // Card Renderer Helper
    function buildCardHtml(t) {
      var starsHtml = '';
      if (settings.showRating !== false) {
        starsHtml += '<div class="proofly-stars">';
        for (var i = 0; i < (t.rating || 5); i++) {
          starsHtml += '★';
        }
        starsHtml += '</div>';
      }

      var headerHtml = '';
      if (settings.showAvatar !== false || settings.showCompany !== false) {
        headerHtml += '<div class="proofly-header">';
        if (settings.showAvatar !== false) {
          headerHtml += '<img class="proofly-avatar" src="' + (t.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.reviewerName) + '" alt="' + t.reviewerName + '">';
        }
        headerHtml += '<div class="proofly-meta">';
        headerHtml += '<span class="proofly-name">' + t.reviewerName;
        if (settings.showVerifiedBadge !== false) {
          headerHtml += ' <svg class="proofly-badge-verified" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a.75.75 0 00-.708-.523 4.25 4.25 0 00-.507 8.47 7.502 7.502 0 00-.3 2.842.75.75 0 001.272.545l2.06-1.545a2.75 2.75 0 011.65-.545h3.016A4.25 4.25 0 0017 8.5v-.25a4.25 4.25 0 00-4.25-4.25h-6.49M10 11a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>';
        }
        headerHtml += '</span>';
        if (settings.showCompany !== false && t.reviewerTitle) {
          headerHtml += '<span class="proofly-title">' + t.reviewerTitle + '</span>';
        }
        headerHtml += '</div></div>';
      }

      var textHtml = t.textContent ? '<div class="proofly-text">"' + t.textContent + '"</div>' : '';

      var videoHtml = '';
      if (settings.showVideo !== false && t.videoUrl) {
        videoHtml += '<div class="proofly-video-wrapper">';
        videoHtml += '<video class="proofly-video" src="' + t.videoUrl + '" controls ' + (settings.autoplayVideo ? 'autoplay muted loop playsinline' : '') + ' data-t-id="' + t.id + '"></video>';
        videoHtml += '</div>';
      }

      var dateHtml = '';
      if (settings.showDate !== false) {
        dateHtml += '<div class="proofly-date">' + new Date(t.createdAt).toLocaleDateString() + '</div>';
      }

      return '<div class="proofly-card" data-t-id="' + t.id + '">' + headerHtml + starsHtml + textHtml + videoHtml + dateHtml + '</div>';
    }

    // 1. CAROUSEL Layout logic
    if (layout === 'CAROUSEL') {
      var trackHtml = '';
      testimonials.forEach(function(t) {
        trackHtml += '<div class="proofly-carousel-slide">' + buildCardHtml(t) + '</div>';
      });

      var arrowBtns = '';
      if (testimonials.length > 3) {
        arrowBtns += '<button class="proofly-carousel-btn proofly-carousel-prev">‹</button>';
        arrowBtns += '<button class="proofly-carousel-btn proofly-carousel-next">›</button>';
      }

      container.innerHTML = '<div class="proofly-carousel-wrapper">' + arrowBtns + '<div class="proofly-carousel-track">' + trackHtml + '</div></div>';
      element.appendChild(container);

      // Track shifting logic
      var track = container.querySelector('.proofly-carousel-track');
      var prev = container.querySelector('.proofly-carousel-prev');
      var next = container.querySelector('.proofly-carousel-next');

      if (track && prev && next) {
        var currentIndex = 0;
        var autoplayInterval;
        var speed = settings.autoplaySpeed || 4000;

        var updateSlider = function() {
          var cardWidth = track.querySelector('.proofly-carousel-slide').offsetWidth;
          var gap = 20;
          track.style.transform = 'translateX(-' + (currentIndex * (cardWidth + gap)) + 'px)';
        };

        next.addEventListener('click', function(e) {
          e.stopPropagation();
          var maxIdx = testimonials.length - (window.innerWidth < 768 ? 1 : 3);
          currentIndex = currentIndex >= maxIdx ? 0 : currentIndex + 1;
          updateSlider();
          logAnalytics(widget.id, widget.spaceId, 'WIDGET_CLICK', { type: 'arrow-next' });
        });

        prev.addEventListener('click', function(e) {
          e.stopPropagation();
          currentIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
          updateSlider();
          logAnalytics(widget.id, widget.spaceId, 'WIDGET_CLICK', { type: 'arrow-prev' });
        });

        // Responsive resize listener
        window.addEventListener('resize', updateSlider);

        // Autoplay loop
        if (settings.autoplay !== false) {
          autoplayInterval = setInterval(function() {
            var maxIdx = testimonials.length - (window.innerWidth < 768 ? 1 : 3);
            currentIndex = currentIndex >= maxIdx ? 0 : currentIndex + 1;
            updateSlider();
          }, speed);

          container.addEventListener('mouseenter', function() { clearInterval(autoplayInterval); });
          container.addEventListener('mouseleave', function() {
            autoplayInterval = setInterval(function() {
              var maxIdx = testimonials.length - (window.innerWidth < 768 ? 1 : 3);
              currentIndex = currentIndex >= maxIdx ? 0 : currentIndex + 1;
              updateSlider();
            }, speed);
          });
        }
      }
    }

    // 2. MASONRY GRID / WALL layout logic
    else if (layout === 'MASONRY' || layout === 'WALL') {
      var gridHtml = '<div class="proofly-masonry">';
      testimonials.forEach(function(t) {
        gridHtml += buildCardHtml(t);
      });
      gridHtml += '</div>';
      container.innerHTML = gridHtml;
      element.appendChild(container);
    }

    // 3. SINGLE Testimonial Layout
    else if (layout === 'SINGLE') {
      container.innerHTML = '<div class="proofly-single">' + buildCardHtml(testimonials[0]) + '</div>';
      element.appendChild(container);
    }

    // 4. POPUP Layout
    else if (layout === 'POPUP') {
      container.className += ' proofly-popup';
      container.innerHTML = '<button class="proofly-popup-close">×</button><div class="proofly-popup-content">' + buildCardHtml(testimonials[0]) + '</div>';
      document.body.appendChild(container);

      var closeBtn = container.querySelector('.proofly-popup-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          container.classList.remove('show');
        });
      }

      // Display with delay
      var delay = settings.popupDelay || 3000;
      setTimeout(function() {
        container.classList.add('show');
      }, delay);

      // Rotating testimonials
      if (testimonials.length > 1) {
        var popupIdx = 0;
        setInterval(function() {
          if (!container.classList.contains('show')) return;
          popupIdx = (popupIdx + 1) % testimonials.length;
          var content = container.querySelector('.proofly-popup-content');
          if (content) {
            content.style.opacity = '0';
            setTimeout(function() {
              content.innerHTML = buildCardHtml(testimonials[popupIdx]);
              content.style.opacity = '1';
            }, 300);
          }
        }, 8000);
      }
    }

    // 5. FLOATING Trust Badge Layout
    else if (layout === 'FLOATING') {
      var avgRating = (testimonials.reduce(function(sum, t) { return sum + t.rating; }, 0) / testimonials.length).toFixed(1);
      var trigger = document.createElement('div');
      trigger.className = 'proofly-badge-trigger';
      trigger.innerHTML = '⭐ ' + avgRating + ' (' + testimonials.length + ' reviews)';
      document.body.appendChild(trigger);

      var bubble = document.createElement('div');
      bubble.className = 'proofly-badge-bubble';
      bubble.innerHTML = '<div style="margin-bottom:12px;font-weight:800;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:6px;">Recent Reviews</div><div class="proofly-badge-content">' + buildCardHtml(testimonials[0]) + '</div>';
      document.body.appendChild(bubble);

      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        bubble.classList.toggle('show');
        logAnalytics(widget.id, widget.spaceId, 'WIDGET_CLICK', { type: 'badge-trigger' });
      });

      document.addEventListener('click', function() {
        bubble.classList.remove('show');
      });

      bubble.addEventListener('click', function(e) {
        e.stopPropagation();
      });

      // Rotating badge bubble testimonials
      if (testimonials.length > 1) {
        var bubbleIdx = 0;
        setInterval(function() {
          if (!bubble.classList.contains('show')) return;
          bubbleIdx = (bubbleIdx + 1) % testimonials.length;
          var content = bubble.querySelector('.proofly-badge-content');
          if (content) {
            content.innerHTML = buildCardHtml(testimonials[bubbleIdx]);
          }
        }, 6000);
      }
    }

    // Append "Powered by Proofly" Branding if set
    if (settings.showProoflyBranding !== false) {
      var branding = document.createElement('a');
      branding.href = 'https://useproofly.com?utm_source=widget&utm_medium=embed&utm_campaign=' + widget.id;
      branding.target = '_blank';
      branding.className = 'proofly-branding';
      branding.innerHTML = '\
        <span>Powered by</span>\
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">\
          <path d="M 22 82 L 22 35 C 22 18, 36 10, 54 10 C 72 10, 86 24, 86 42 C 86 60, 72 74, 54 74 L 38 74 C 33 74, 30 71, 30 66 L 30 58 C 30 53, 33 50, 38 50 L 54 50 C 59 50, 64 45, 64 39 C 64 33, 59 28, 54 28 L 38 28 C 29 28, 22 35, 22 45 Z" fill="url(#proofly-grad)" />\
          <path d="M 38 62 L 56 44" stroke="#FFF" stroke-width="6" stroke-linecap="round" />\
          <defs><linearGradient id="proofly-grad" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#4F46E5"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>\
        </svg>\
        <strong style="color: #8B5CF6">Proofly</strong>\
      ';
      branding.addEventListener('click', function() {
        logAnalytics(widget.id, widget.spaceId, 'WIDGET_CONVERSION', { type: 'branding-link' });
      });

      if (layout === 'POPUP') {
        container.querySelector('.proofly-popup-content').appendChild(branding);
      } else if (layout === 'FLOATING') {
        bubble.appendChild(branding);
      } else {
        container.appendChild(branding);
      }
    }

    // Set up card and video click event listeners
    container.addEventListener('click', function(e) {
      var card = e.target.closest('.proofly-card');
      if (card) {
        var tId = card.getAttribute('data-t-id');
        logAnalytics(widget.id, widget.spaceId, 'WIDGET_CLICK', { testimonialId: tId, target: 'card' });
      }
    });

    container.querySelectorAll('video').forEach(function(video) {
      video.addEventListener('play', function() {
        var tId = video.getAttribute('data-t-id');
        logAnalytics(widget.id, widget.spaceId, 'VIDEO_PLAY', { testimonialId: tId });
      });
    });

    // Lazy load logging using IntersectionObserver
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            logAnalytics(widget.id, widget.spaceId, 'WIDGET_VIEW');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(element);
    } else {
      logAnalytics(widget.id, widget.spaceId, 'WIDGET_VIEW');
    }
  }

  // Auto-init on script load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initWidgets, 1);
  } else {
    document.addEventListener('DOMContentLoaded', initWidgets);
  }
})();
