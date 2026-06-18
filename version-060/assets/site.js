
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeText(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("show", window.scrollY > 420);
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
      var active = slides[index];
      var panel = document.querySelector("[data-hero-panel]");
      if (panel && active) {
        panel.style.setProperty("--hero-poster", active.style.getPropertyValue("--hero-image"));
        var title = active.getAttribute("data-title") || "";
        var desc = active.getAttribute("data-desc") || "";
        var href = active.getAttribute("data-href") || "./index.html";
        panel.querySelector("h2").textContent = title;
        panel.querySelector("p").textContent = desc;
        panel.setAttribute("href", href);
      }
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        window.location.href = "./search.html" + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    });
  }

  function renderSearchCards(list) {
    var target = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!target) {
      return;
    }
    var limited = list.slice(0, 120);
    if (status) {
      status.textContent = list.length ? "已匹配 " + list.length + " 部影片" : "输入关键词后可按片名、题材、地区与年份检索";
    }
    if (!limited.length) {
      target.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
      return;
    }
    target.innerHTML = limited.map(function (movie) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeText(movie.url) + '" aria-label="' + escapeText(movie.title) + '">' +
        '<span class="poster-bg" style="--cover-image: url(\'' + escapeText(movie.cover) + '\');"></span>' +
        '<span class="poster-shade"></span>' +
        '<span class="play-pill">▶ 点播</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<h3><a href="' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a></h3>' +
        '<p class="movie-desc">' + escapeText(movie.description) + '</p>' +
        '<div class="movie-meta"><span>' + escapeText(movie.region) + ' / ' + escapeText(movie.type) + ' / ' + escapeText(movie.year) + '</span><span>' + escapeText(movie.rating) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join("");
  }

  function initSearchPage() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel || !window.SEARCH_MOVIES) {
      return;
    }
    var queryInput = panel.querySelector("[data-search-query]");
    var typeSelect = panel.querySelector("[data-search-type]");
    var yearSelect = panel.querySelector("[data-search-year]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (queryInput) {
      queryInput.value = initial;
    }
    function match() {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var result = window.SEARCH_MOVIES.filter(function (movie) {
        var hay = [movie.title, movie.description, movie.genre, movie.region, movie.type, movie.year, movie.category].join(" ").toLowerCase();
        var okQuery = q ? hay.indexOf(q) !== -1 : true;
        var okType = type ? movie.type.indexOf(type) !== -1 || movie.genre.indexOf(type) !== -1 : true;
        var okYear = year ? String(movie.year) === year : true;
        return okQuery && okType && okYear;
      });
      result.sort(function (a, b) {
        return b.views - a.views;
      });
      renderSearchCards(result);
    }
    [queryInput, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", match);
        field.addEventListener("change", match);
      }
    });
    match();
  }

  window.initMoviePlayer = function (movieSource) {
    var video = document.querySelector("[data-movie-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    var status = document.querySelector("[data-player-status]");
    if (!video || !movieSource) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }
    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("点击画面继续播放");
        });
      }
    }
    function attachSource() {
      if (attached) {
        playVideo();
        return;
      }
      attached = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = movieSource;
        video.load();
        playVideo();
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(movieSource);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("视频暂时无法播放");
          }
        });
      } else {
        setStatus("视频暂时无法播放");
      }
    }
    function start() {
      if (cover) {
        cover.classList.add("hidden");
      }
      setStatus("");
      attachSource();
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("hidden");
      }
      setStatus("");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initBackTop();
    initHeroSlider();
    initSearchForms();
    initSearchPage();
  });
})();
