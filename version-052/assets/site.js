(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var button = document.querySelector(".menu-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("active", pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("active", pos === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-text]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-item]"));
      function clean(value) {
        return (value || "").toString().trim().toLowerCase();
      }
      function apply() {
        var q = clean(input && input.value);
        var y = clean(year && year.value);
        var r = clean(region && region.value);
        var t = clean(type && type.value);
        items.forEach(function (item) {
          var title = clean(item.getAttribute("data-title"));
          var itemYear = clean(item.getAttribute("data-year"));
          var itemRegion = clean(item.getAttribute("data-region"));
          var itemType = clean(item.getAttribute("data-type"));
          var match = true;
          if (q && title.indexOf(q) === -1) {
            match = false;
          }
          if (y && itemYear !== y) {
            match = false;
          }
          if (r && itemRegion !== r) {
            match = false;
          }
          if (t && itemType !== t) {
            match = false;
          }
          item.hidden = !match;
        });
      }
      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayer() {
    var video = document.getElementById("movie-player");
    if (!video) {
      return;
    }
    var button = document.getElementById("player-start");
    var stream = video.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;
    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }
    function playVideo() {
      hideButton();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }
    function attach() {
      if (loaded || !stream) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = stream;
      playVideo();
    }
    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (loaded && video.readyState > 0) {
        playVideo();
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideButton);
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
