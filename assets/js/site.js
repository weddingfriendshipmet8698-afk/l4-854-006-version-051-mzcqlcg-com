(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var menuPanel = document.querySelector('[data-menu-panel]');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function () {
      menuPanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function move(step) {
      showSlide(current + step);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]'));

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      var scope = input.closest('section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      }

      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        card.classList.toggle('is-hidden', keyword.length > 0 && haystack.indexOf(keyword) === -1);
      });
    });
  });

  function attachVideo(video, url) {
    if (!video || !url) {
      return;
    }

    if (video.dataset.ready === '1') {
      video.play().catch(function () {});
      return;
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = url;
    video.play().catch(function () {});
  }

  var overlays = Array.prototype.slice.call(document.querySelectorAll('.play-overlay'));

  overlays.forEach(function (overlay) {
    overlay.addEventListener('click', function () {
      var shell = overlay.closest('.player-shell');
      var video = shell ? shell.querySelector('video') : null;
      var url = overlay.getAttribute('data-url');
      overlay.classList.add('hidden');
      attachVideo(video, url);
    });
  });
})();
