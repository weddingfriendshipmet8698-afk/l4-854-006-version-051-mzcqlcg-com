(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function() {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var normalize = function(value) {
    return String(value || '').toLowerCase().trim();
  };

  document.querySelectorAll('[data-catalog-controls]').forEach(function(panel) {
    var section = panel.closest('section');
    var grid = section ? section.querySelector('[data-movie-grid]') : document.querySelector('[data-movie-grid]');

    if (!grid) {
      return;
    }

    var input = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-region-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var sort = panel.querySelector('[data-sort-select]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    var apply = function() {
      var q = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);

      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var regionText = normalize(card.getAttribute('data-region'));
        var typeText = normalize(card.getAttribute('data-type'));
        var visible = true;

        if (q && haystack.indexOf(q) === -1) {
          visible = false;
        }

        if (regionValue && regionText.indexOf(regionValue) === -1) {
          visible = false;
        }

        if (typeValue && typeText.indexOf(typeValue) === -1) {
          visible = false;
        }

        card.classList.toggle('is-hidden', !visible);
      });
    };

    var sortCards = function() {
      var mode = sort ? sort.value : 'default';
      var sorted = cards.slice();

      if (mode === 'year-desc') {
        sorted.sort(function(a, b) {
          return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
        });
      }

      if (mode === 'year-asc') {
        sorted.sort(function(a, b) {
          return (parseInt(a.getAttribute('data-year'), 10) || 0) - (parseInt(b.getAttribute('data-year'), 10) || 0);
        });
      }

      if (mode === 'title') {
        sorted.sort(function(a, b) {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
        });
      }

      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (region) {
      region.addEventListener('change', apply);
    }

    if (type) {
      type.addEventListener('change', apply);
    }

    if (sort) {
      sort.addEventListener('change', function() {
        sortCards();
        apply();
      });
    }
  });

  var HlsCtor = window.Hls;

  document.querySelectorAll('.player-root').forEach(function(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    var streamUrl = root.getAttribute('data-video');
    var playerReady = false;
    var hlsInstance = null;

    var prepare = function() {
      if (!video || !streamUrl || playerReady) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (HlsCtor && HlsCtor.isSupported()) {
        hlsInstance = new HlsCtor({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      playerReady = true;
    };

    var start = function() {
      prepare();
      root.classList.add('is-playing');

      if (video) {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function() {});
        }
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function() {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function() {
        root.classList.add('is-playing');
      });
    }

    window.addEventListener('pagehide', function() {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
