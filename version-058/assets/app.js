
(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-category-select]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var q = normalize(searchInput ? searchInput.value : '');
    var selected = categorySelect ? categorySelect.value : activeFilter;
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year')
      ].join(' '));
      var categoryText = normalize(card.getAttribute('data-category'));
      var genreText = normalize(card.getAttribute('data-genre'));
      var matchesText = !q || haystack.indexOf(q) !== -1;
      var matchesCategory = !selected || selected === 'all' || categoryText === normalize(selected) || genreText.indexOf(normalize(selected)) !== -1;
      var ok = matchesText && matchesCategory;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
  }
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var status = document.querySelector('[data-player-status]');
    var hlsInstance = null;
    var ready = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function initVideo() {
      if (!video || ready) {
        return Promise.resolve();
      }
      var src = video.getAttribute('data-src');
      if (!src) {
        setStatus('当前视频源暂不可用');
        return Promise.resolve();
      }
      ready = true;
      setStatus('正在载入高清播放源');
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪');
        }, { once: true });
      } else {
        video.src = src;
        setStatus('已尝试使用浏览器默认播放器');
      }
      return Promise.resolve();
    }

    function startPlayback() {
      initVideo().then(function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            setStatus('点击播放器继续播放');
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
